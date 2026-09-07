"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { ProfileFormValues } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { toPublicUser } from "@/utils/auth/publicUser";
import { createClient } from "@/utils/supabase/server";
import type { ProfileField, ValidationErrors } from "@/utils/validation";
import { validateProfileValues } from "@/utils/validation";

const AVATAR_BUCKET = "user-avatars";
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function createAuthenticatedStorageClient(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

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

function errorDetails(error: unknown) {
  if (!error || typeof error !== "object") return "Không có chi tiết từ Supabase.";
  const value = error as Record<string, unknown>;
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const code = [value.statusCode, value.status, value.code]
    .find((item) => typeof item === "string" || typeof item === "number");
  return `${message || "Lỗi không xác định từ Supabase."}${code ? ` (mã ${String(code)})` : ""}`;
}

function avatarTicketError(error: unknown) {
  const details = errorDetails(error);
  const message = error && typeof error === "object" &&
    typeof (error as Record<string, unknown>).message === "string"
    ? String((error as Record<string, unknown>).message)
    : "";

  if (/row-level security|rls/i.test(message)) {
    return `Supabase Storage từ chối policy INSERT (RLS) cho đường dẫn users/{userId}/.... Chi tiết: ${details}`;
  }
  if (/unauthorized|jwt|authentication/i.test(message)) {
    return `Supabase Storage không chấp nhận phiên đăng nhập. Chi tiết: ${details}`;
  }
  if (/bucket.*not found|not found.*bucket/i.test(message)) {
    return `Không tìm thấy bucket user-avatars trên project Supabase hiện tại. Chi tiết: ${details}`;
  }
  return `Không thể tạo quyền tải ảnh trên Supabase Storage. Chi tiết: ${details}`;
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
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([objectPath]);
  if (error) {
    console.error("[profile] Không thể xóa ảnh đại diện khỏi Storage", error);
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== user.id) {
    return {
      ok: false,
      message: "Không tìm thấy access token hợp lệ. Vui lòng đăng xuất rồi đăng nhập lại.",
    };
  }

  const objectPath = `users/${user.id}/${crypto.randomUUID()}.${extension}`;
  const storageClient = createAuthenticatedStorageClient(session.access_token);
  const { data, error } = await storageClient.storage
    .from(AVATAR_BUCKET)
    .createSignedUploadUrl(objectPath);
  if (error || !data?.token) {
    console.error("[profile] Không thể tạo vé upload avatar", error);
    return {
      ok: false,
      message: avatarTicketError(error),
    };
  }
  return { ok: true, objectPath, token: data.token };
}

export async function discardAvatarUploadAction(objectPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await removeAvatarObject(user.id, objectPath);
}

export async function updateAvatarAction(
  formData: FormData
): Promise<ProfileActionState> {
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
    (!avatarObjectPath && !removeAvatar) ||
    (avatarObjectPath && removeAvatar) ||
    (avatarObjectPath && !isOwnedAvatarPath(currentUser.id, avatarObjectPath))
  ) {
    return { status: "error", error: "Thông tin ảnh đại diện không hợp lệ." };
  }

  const nextAvatarUrl = avatarObjectPath
    ? supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarObjectPath).data.publicUrl
    : "";
  const { data: oldAvatar, error: profileError } = await supabase.rpc(
    "api_set_my_avatar_url",
    { p_avatar_url: nextAvatarUrl }
  );
  if (profileError) {
    console.error("[profile] Không thể cập nhật avatar_url", profileError);
    return {
      status: "error",
      error: `Ảnh đã tải lên nhưng không thể lưu URL vào hồ sơ qua RPC. Chi tiết: ${errorDetails(profileError)}`,
    };
  }
  const oldAvatarUrl = typeof oldAvatar === "string" ? oldAvatar : "";

  const currentMetadata = readMetadata(currentUser.user_metadata);
  const { data, error: authError } = await supabase.auth.updateUser({
    data: {
      ...currentMetadata,
      avatarUrl: nextAvatarUrl,
      avatar_url: nextAvatarUrl,
    },
  });
  if (authError || !data.user) {
    await supabase.rpc("api_set_my_avatar_url", { p_avatar_url: oldAvatarUrl });
    return {
      status: "error",
      error: `Đã lưu URL vào hồ sơ nhưng không thể đồng bộ Supabase Auth. Chi tiết: ${errorDetails(authError)}`,
    };
  }

  const oldObjectPath = readOwnedAvatarPath(currentUser.id, oldAvatarUrl);
  if (oldObjectPath && oldObjectPath !== avatarObjectPath) {
    await removeAvatarObject(currentUser.id, oldObjectPath);
  }

  revalidatePath("/", "layout");
  revalidatePath("/account/profile");

  return {
    status: "success",
    message: avatarObjectPath
      ? "Đã cập nhật ảnh đại diện."
      : "Đã xóa ảnh đại diện.",
    user: toPublicUser(data.user),
  };
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

  const { data: oldProfile, error: profileError } = await supabase.rpc(
    "api_update_my_profile",
    {
      p_full_name: validation.normalized.fullName,
      p_phone: validation.normalized.phone,
    }
  );
  if (profileError) {
    console.error("[profile] Không thể cập nhật profiles", profileError);
    return {
      status: "error",
      error: `Không thể cập nhật hồ sơ. Chi tiết: ${errorDetails(profileError)}`,
    };
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

  const { data, error } = await supabase.auth.updateUser({ data: nextMetadata });
  if (error || !data.user) {
    if (oldProfile && typeof oldProfile === "object") {
      const previous = oldProfile as Record<string, unknown>;
      await supabase.rpc("api_update_my_profile", {
        p_full_name: String(previous.full_name || ""),
        p_phone: String(previous.phone || ""),
      });
    }
    return {
      status: "error",
      error: `Đã cập nhật hồ sơ nhưng không thể đồng bộ Supabase Auth. Chi tiết: ${errorDetails(error)}`,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/account/profile");

  return {
    status: "success",
    message: "Cập nhật hồ sơ thành công.",
    user: toPublicUser(data.user),
  };
}
