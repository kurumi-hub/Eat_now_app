"use server";

import { revalidatePath } from "next/cache";

import type { ProfileFormValues } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { toPublicUser } from "@/utils/auth/publicUser";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import type { ProfileField, ValidationErrors } from "@/utils/validation";
import { validateProfileValues } from "@/utils/validation";

const AVATAR_BUCKET = "user-avatars";
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  fieldErrors?: ValidationErrors<ProfileField>;
  user?: PublicUser;
};

export type AvatarUploadTicketResult =
  | { ok: true; objectPath: string; token: string }
  | { ok: false; message: string };

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

function isOwnedAvatarPath(userId: string, objectPath: string) {
  return (
    objectPath.startsWith(`users/${userId}/`) &&
    !objectPath.includes("..") &&
    /\.(?:jpg|png|webp)$/i.test(objectPath)
  );
}

function readOwnedAvatarPath(userId: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const markerIndex = value.indexOf(marker);
  const candidate = markerIndex >= 0
    ? decodeURIComponent(value.slice(markerIndex + marker.length))
    : value;
  return isOwnedAvatarPath(userId, candidate) ? candidate : null;
}

async function removeAvatarObject(userId: string, objectPath: string) {
  if (!isOwnedAvatarPath(userId, objectPath)) return;
  try {
    const { error } = await createAdminClient().storage
      .from(AVATAR_BUCKET)
      .remove([objectPath]);
    if (error) {
      console.error("[profile] Không thể xóa ảnh đại diện khỏi Storage", error);
    }
  } catch (error) {
    console.error("[profile] Không thể khởi tạo Storage admin", error);
  }
}

export async function createAvatarUploadTicketAction(
  mimeType: string
): Promise<AvatarUploadTicketResult> {
  const extension = AVATAR_EXTENSIONS[mimeType];
  if (!extension) {
    return { ok: false, message: "Ảnh đại diện cần là JPG, PNG hoặc WebP." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const objectPath = `users/${user.id}/${crypto.randomUUID()}.${extension}`;
  try {
    const { data, error } = await createAdminClient().storage
      .from(AVATAR_BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error || !data?.token) {
      console.error("[profile] Không thể tạo vé upload avatar", error);
      return { ok: false, message: "Không thể khởi tạo phiên tải ảnh đại diện." };
    }
    return { ok: true, objectPath, token: data.token };
  } catch (error) {
    console.error("[profile] Không thể khởi tạo Storage admin", error);
    return {
      ok: false,
      message: "Máy chủ chưa cấu hình dịch vụ tải ảnh đại diện.",
    };
  }
}

export async function discardAvatarUploadAction(objectPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await removeAvatarObject(user.id, objectPath);
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const values: ProfileFormValues = {
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
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
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return {
      status: "error",
      error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const avatarObjectPath = formString(formData, "avatarObjectPath").trim();
  const removeAvatar = formString(formData, "removeAvatar") === "true";
  if (
    (avatarObjectPath && removeAvatar) ||
    (avatarObjectPath && !isOwnedAvatarPath(currentUser.id, avatarObjectPath))
  ) {
    return { status: "error", error: "Thông tin ảnh đại diện không hợp lệ." };
  }

  const { data: oldProfile, error: readError } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", currentUser.id)
    .single();
  if (readError || !oldProfile) {
    return { status: "error", error: "Không thể đọc hồ sơ hiện tại." };
  }

  let nextAvatarUrl: string | undefined;
  if (avatarObjectPath) {
    nextAvatarUrl = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(avatarObjectPath).data.publicUrl;
  } else if (removeAvatar) {
    // Chuỗi rỗng là lựa chọn xóa có chủ đích, tránh fallback về ảnh OAuth cũ.
    nextAvatarUrl = "";
  }

  const profilePatch: Record<string, string> = {
    full_name: validation.normalized.fullName,
    phone: validation.normalized.phone,
  };
  if (nextAvatarUrl !== undefined) profilePatch.avatar_url = nextAvatarUrl;

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profilePatch)
    .eq("id", currentUser.id);
  if (profileError) {
    console.error("[profile] Không thể cập nhật profiles", profileError);
    return { status: "error", error: "Không thể cập nhật hồ sơ lúc này." };
  }

  const currentMetadata = readMetadata(currentUser.user_metadata);
  const nextMetadata: Record<string, unknown> = {
    ...currentMetadata,
    name: validation.normalized.fullName,
    full_name: validation.normalized.fullName,
    fullName: validation.normalized.fullName,
    phone: validation.normalized.phone,
    phone_number: validation.normalized.phone,
  };
  if (nextAvatarUrl !== undefined) {
    nextMetadata.avatarUrl = nextAvatarUrl;
    nextMetadata.avatar_url = nextAvatarUrl;
  }

  const { data, error } = await supabase.auth.updateUser({ data: nextMetadata });
  if (error || !data.user) {
    await supabase.from("profiles").update({
      full_name: oldProfile.full_name,
      phone: oldProfile.phone,
      avatar_url: oldProfile.avatar_url,
    }).eq("id", currentUser.id);
    return {
      status: "error",
      error: "Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại sau.",
    };
  }

  const oldObjectPath = readOwnedAvatarPath(currentUser.id, oldProfile.avatar_url);
  if (oldObjectPath && oldObjectPath !== avatarObjectPath) {
    await removeAvatarObject(currentUser.id, oldObjectPath);
  }

  revalidatePath("/", "layout");
  revalidatePath("/account/profile");

  return {
    status: "success",
    message: avatarObjectPath
      ? "Đã tải lên và cập nhật ảnh đại diện."
      : removeAvatar
        ? "Đã xóa ảnh đại diện."
        : "Cập nhật hồ sơ thành công.",
    user: toPublicUser(data.user),
  };
}
