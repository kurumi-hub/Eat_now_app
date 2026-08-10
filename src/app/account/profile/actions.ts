"use server";

import { revalidatePath } from "next/cache";

import type { ProfileFormValues } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { toPublicUser } from "@/utils/auth/publicUser";
import { createClient } from "@/utils/supabase/server";
import type { ProfileField, ValidationErrors } from "@/utils/validation";
import { validateProfileValues } from "@/utils/validation";

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  fieldErrors?: ValidationErrors<ProfileField>;
  user?: PublicUser;
};

function formString(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function firstFieldError(fieldErrors: ValidationErrors<ProfileField>) {
  return Object.values(fieldErrors).find(Boolean) || "";
}

function readMetadata(userMetadata: unknown) {
  return typeof userMetadata === "object" &&
    userMetadata !== null &&
    !Array.isArray(userMetadata)
    ? { ...userMetadata }
    : {};
}

function normalizeAvatarMetadataValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : undefined;
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const values: ProfileFormValues = {
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
    avatarUrl: formString(formData, "avatarUrl"),
  };
  const validation = validateProfileValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return {
      status: "error",
      error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const currentMetadata = readMetadata(currentUser.user_metadata);
  const avatarUrl = normalizeAvatarMetadataValue(values.avatarUrl || "");
  const nextMetadata: Record<string, unknown> = {
    ...currentMetadata,
    name: validation.normalized.fullName,
    full_name: validation.normalized.fullName,
    fullName: validation.normalized.fullName,
    phone: validation.normalized.phone,
    phone_number: validation.normalized.phone,
  };

  if (avatarUrl !== undefined) {
    nextMetadata.avatarUrl = avatarUrl;
    nextMetadata.avatar_url = avatarUrl;
  }

  const { data, error } = await supabase.auth.updateUser({
    data: nextMetadata,
  });

  if (error || !data.user) {
    return {
      status: "error",
      error: "Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại sau.",
    };
  }

  revalidatePath("/account/profile");

  return {
    status: "success",
    message: "Cập nhật hồ sơ thành công.",
    user: toPublicUser(data.user),
  };
}
