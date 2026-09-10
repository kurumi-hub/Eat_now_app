"use server";

import { revalidatePath } from "next/cache";

import {
  readAccountPreferences,
  validateAccountPreferences,
  type AccountPreferenceField,
} from "@/lib/data/accountPreferences";
import type { AccountPreferences } from "@/types/account";
import { createClient } from "@/utils/supabase/server";

export type PreferencesActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  preferences?: AccountPreferences;
  fieldErrors?: Partial<Record<AccountPreferenceField, string>>;
};

function readMetadata(userMetadata: unknown) {
  return typeof userMetadata === "object" &&
    userMetadata !== null &&
    !Array.isArray(userMetadata)
    ? { ...userMetadata }
    : {};
}

function firstFieldError(
  fieldErrors: Partial<Record<AccountPreferenceField, string>>
) {
  return Object.values(fieldErrors).find(Boolean) || "";
}

export async function updatePreferencesAction(
  _prevState: PreferencesActionState,
  values: AccountPreferences
): Promise<PreferencesActionState> {
  const validation = validateAccountPreferences(values);

  if (!validation.isValid) {
    return {
      status: "error",
      message:
        firstFieldError(validation.errors) ||
        "Không thể lưu cài đặt vì dữ liệu chưa hợp lệ.",
      fieldErrors: validation.errors,
      preferences: validation.normalized,
    };
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return {
      status: "error",
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      preferences: validation.normalized,
    };
  }

  const currentMetadata = readMetadata(currentUser.user_metadata);
  const { data, error } = await supabase.auth.updateUser({
    data: {
      ...currentMetadata,
      accountPreferences: validation.normalized,
    },
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "Không thể lưu cài đặt lúc này. Vui lòng thử lại sau.",
      preferences: validation.normalized,
    };
  }

  revalidatePath("/account/preferences");
  revalidatePath("/account");

  return {
    status: "success",
    message: "Đã lưu cài đặt tài khoản.",
    preferences: readAccountPreferences(data.user.user_metadata),
  };
}
