"use server";

import { revalidatePath, updateTag } from "next/cache";

import type {
  AdminActionResult,
  AdminCatalogOrderItem,
} from "@/types/admin";
import {
  SITE_MEDIA_SLOTS,
  type SiteMediaSlot,
} from "@/types/siteMedia";
import { requirePermission } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SITE_MEDIA_BUCKET = "site-media";
const CATALOG_MEDIA_BUCKET = "catalog-media";

type NoteResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

function cleanNote(value: string): NoteResult {
  const note = value.trim();
  if (note.length < 5) {
    return { ok: false, error: "Vui lòng nhập lý do ít nhất 5 ký tự." };
  }
  if (note.length > 1000) {
    return { ok: false, error: "Lý do không được vượt quá 1.000 ký tự." };
  }
  return { ok: true, value: note };
}

function validId(value: string) {
  return UUID_REGEX.test(value);
}

function isSiteMediaSlot(value: string): value is SiteMediaSlot {
  return SITE_MEDIA_SLOTS.includes(value as SiteMediaSlot);
}

function refreshSiteMedia() {
  updateTag("site-media");
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

function refreshCatalog() {
  updateTag("catalog");
  revalidatePath("/");
  revalidatePath("/restaurants", "layout");
  revalidatePath("/admin");
}

function failure(message: string, error?: { code?: string; message?: string }) {
  console.error("[admin] RPC thất bại", {
    code: error?.code,
    message: error?.message,
  });

  if (error?.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  if (error?.code === "P0002") return "Không tìm thấy dữ liệu cần xử lý.";
  if (["22023", "23503", "23505"].includes(error?.code ?? "")) {
    return error?.message?.trim() || message;
  }
  return message;
}

function cleanCatalogName(value: string, maxLength: number) {
  const name = value.trim();
  if (!name || name.length > maxLength) return null;
  return name;
}

function cleanDisplayOrder(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 2_147_483_647
    ? value
    : null;
}

function validOrderItems(items: AdminCatalogOrderItem[]) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) return false;
  const ids = new Set<string>();
  return items.every((item) => {
    if (!validId(item.id) || cleanDisplayOrder(item.display_order) === null) return false;
    if (ids.has(item.id)) return false;
    ids.add(item.id);
    return true;
  });
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("users.suspend");
  if (!validId(userId)) return { ok: false, message: "Mã tài khoản không hợp lệ." };

  const note = cleanNote(reason);
  if (!note.ok) return { ok: false, message: note.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_set_user_active", {
    p_user_id: userId,
    p_is_active: isActive,
    p_reason: note.value,
  });

  if (error) {
    return { ok: false, message: failure("Không thể cập nhật tài khoản.", error) };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    message: isActive ? "Đã mở lại tài khoản." : "Đã tạm khóa tài khoản.",
  };
}

export async function setModeratorRoleAction(
  userId: string,
  assign: boolean
): Promise<AdminActionResult> {
  await requirePermission("staff.moderator.manage");
  if (!validId(userId)) return { ok: false, message: "Mã tài khoản không hợp lệ." };

  const supabase = await createClient();
  const rpc = assign ? "api_assign_moderator" : "api_revoke_moderator";
  const { error } = await supabase.rpc(rpc, { p_user_id: userId });

  if (error) {
    return { ok: false, message: failure("Không thể cập nhật quyền Moderator.", error) };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    message: assign ? "Đã bổ nhiệm Moderator." : "Đã thu hồi quyền Moderator.",
  };
}

export async function setAdminRoleAction(
  userId: string,
  assign: boolean
): Promise<AdminActionResult> {
  await requirePermission("staff.admin.manage");
  if (!validId(userId)) return { ok: false, message: "Mã tài khoản không hợp lệ." };

  const supabase = await createClient();
  const rpc = assign ? "api_assign_admin" : "api_revoke_admin";
  const { error } = await supabase.rpc(rpc, { p_user_id: userId });

  if (error) {
    return { ok: false, message: failure("Không thể cập nhật quyền Admin.", error) };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    message: assign ? "Đã bổ nhiệm Admin." : "Đã thu hồi quyền Admin.",
  };
}

export async function transferOwnerAction(
  userId: string,
  confirmation: string
): Promise<AdminActionResult> {
  await requirePermission("ownership.transfer");
  if (!validId(userId)) return { ok: false, message: "Mã tài khoản không hợp lệ." };
  if (confirmation.trim().toUpperCase() !== "CHUYEN QUYEN") {
    return { ok: false, message: "Cụm từ xác nhận chưa chính xác." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_transfer_super_admin", {
    p_new_owner_id: userId,
  });

  if (error) {
    return { ok: false, message: failure("Không thể chuyển quyền Chủ nền tảng.", error) };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Đã chuyển quyền Chủ nền tảng." };
}

export async function reviewRestaurantAction(
  restaurantId: string,
  decision: "approve" | "reject" | "suspend" | "reactivate",
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("restaurants.verify");
  if (!validId(restaurantId)) return { ok: false, message: "Mã nhà hàng không hợp lệ." };
  const note = cleanNote(reason);
  if (!note.ok) return { ok: false, message: note.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_review_restaurant", {
    p_restaurant_id: restaurantId,
    p_decision: decision,
    p_reason: note.value,
  });

  if (error) {
    return { ok: false, message: failure("Không thể cập nhật nhà hàng.", error) };
  }

  revalidatePath("/admin");
  const messages = {
    approve: "Đã duyệt nhà hàng.",
    reject: "Đã từ chối nhà hàng.",
    suspend: "Đã tạm ngưng nhà hàng.",
    reactivate: "Đã mở lại nhà hàng.",
  };
  return { ok: true, message: messages[decision] };
}

export async function reviewRefundAction(
  refundId: string,
  decision: "approve" | "reject",
  amount: string,
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("refunds.manage");
  if (!validId(refundId)) return { ok: false, message: "Mã hoàn tiền không hợp lệ." };
  const note = cleanNote(reason);
  if (!note.ok) return { ok: false, message: note.error };

  const approvedAmount = Number(amount);
  if (decision === "approve" && (!Number.isFinite(approvedAmount) || approvedAmount <= 0)) {
    return { ok: false, message: "Số tiền duyệt hoàn không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_review_refund", {
    p_refund_id: refundId,
    p_decision: decision,
    p_approved_amount: decision === "approve" ? approvedAmount : null,
    p_note: note.value,
  });

  if (error) {
    return { ok: false, message: failure("Không thể xử lý yêu cầu hoàn tiền.", error) };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    message:
      decision === "approve"
        ? "Đã duyệt. Hệ thống thanh toán cần tiếp tục xử lý giao dịch hoàn tiền."
        : "Đã từ chối yêu cầu hoàn tiền.",
  };
}

export async function applySiteMediaAction(
  slot: string,
  objectPath: string,
  altText: string
): Promise<AdminActionResult> {
  await requirePermission("site_media.manage");

  if (!isSiteMediaSlot(slot)) {
    return { ok: false, message: "Vị trí ảnh không hợp lệ." };
  }
  const normalizedPath = objectPath.trim();
  if (
    normalizedPath.length > 500 ||
    !normalizedPath.startsWith(`${slot}/`) ||
    !/^[a-z0-9_/-]+\.(?:jpg|png|webp|avif)$/i.test(normalizedPath)
  ) {
    return { ok: false, message: "Đường dẫn ảnh Storage không hợp lệ." };
  }

  const supabase = await createClient();
  const { data: publicUrlData } = supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .getPublicUrl(normalizedPath);
  const { data, error } = await supabase.rpc("api_set_site_media", {
    p_slot: slot,
    p_object_path: normalizedPath,
    p_image_url: publicUrlData.publicUrl,
    p_alt_text: altText.trim().slice(0, 180) || null,
  });

  if (error) {
    return {
      ok: false,
      message: failure("Không thể lưu cấu hình ảnh.", error),
    };
  }

  const result = data as { old_object_path?: unknown } | null;
  const oldObjectPath =
    typeof result?.old_object_path === "string"
      ? result.old_object_path
      : null;
  if (oldObjectPath && oldObjectPath !== normalizedPath) {
    const { error: cleanupError } = await supabase.storage
      .from(SITE_MEDIA_BUCKET)
      .remove([oldObjectPath]);
    if (cleanupError) {
      console.warn("[admin] Không thể xóa ảnh site-media cũ", cleanupError.message);
    }
  }

  refreshSiteMedia();
  return { ok: true, message: "Đã cập nhật ảnh giao diện." };
}

export async function resetSiteMediaAction(
  slot: string
): Promise<AdminActionResult> {
  await requirePermission("site_media.manage");
  if (!isSiteMediaSlot(slot)) {
    return { ok: false, message: "Vị trí ảnh không hợp lệ." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_set_site_media", {
    p_slot: slot,
    p_object_path: null,
    p_image_url: null,
    p_alt_text: null,
  });

  if (error) {
    return {
      ok: false,
      message: failure("Không thể khôi phục ảnh mặc định.", error),
    };
  }

  const result = data as { old_object_path?: unknown } | null;
  const oldObjectPath =
    typeof result?.old_object_path === "string"
      ? result.old_object_path
      : null;
  if (oldObjectPath) {
    const { error: cleanupError } = await supabase.storage
      .from(SITE_MEDIA_BUCKET)
      .remove([oldObjectPath]);
    if (cleanupError) {
      console.warn("[admin] Không thể xóa ảnh site-media cũ", cleanupError.message);
    }
  }

  refreshSiteMedia();
  return { ok: true, message: "Đã khôi phục ảnh mặc định." };
}

export async function createCategoryAction(
  name: string,
  displayOrder: number,
  isActive: boolean
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  const normalizedName = cleanCatalogName(name, 120);
  const normalizedOrder = cleanDisplayOrder(displayOrder);
  if (!normalizedName) {
    return { ok: false, message: "Tên danh mục phải từ 1 đến 120 ký tự." };
  }
  if (normalizedOrder === null) {
    return { ok: false, message: "Thứ tự hiển thị không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_create_category", {
    p_name: normalizedName,
    p_display_order: normalizedOrder,
    p_is_active: isActive,
  });
  if (error) {
    return { ok: false, message: failure("Không thể tạo danh mục.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã tạo danh mục." };
}

export async function updateCategoryAction(
  categoryId: string,
  name: string,
  displayOrder: number
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  const normalizedName = cleanCatalogName(name, 120);
  const normalizedOrder = cleanDisplayOrder(displayOrder);
  if (!validId(categoryId)) {
    return { ok: false, message: "Mã danh mục không hợp lệ." };
  }
  if (!normalizedName) {
    return { ok: false, message: "Tên danh mục phải từ 1 đến 120 ký tự." };
  }
  if (normalizedOrder === null) {
    return { ok: false, message: "Thứ tự hiển thị không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_update_category", {
    p_category_id: categoryId,
    p_name: normalizedName,
    p_display_order: normalizedOrder,
  });
  if (error) {
    return { ok: false, message: failure("Không thể cập nhật danh mục.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã cập nhật danh mục." };
}

export async function setCategoryActiveAction(
  categoryId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(categoryId)) {
    return { ok: false, message: "Mã danh mục không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_set_category_active", {
    p_category_id: categoryId,
    p_is_active: isActive,
  });
  if (error) {
    return { ok: false, message: failure("Không thể cập nhật trạng thái danh mục.", error) };
  }

  refreshCatalog();
  return {
    ok: true,
    message: isActive ? "Đã bật danh mục." : "Đã tắt danh mục.",
  };
}

export async function applyCategoryMediaAction(
  categoryId: string,
  objectPath: string,
  altText: string
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(categoryId)) {
    return { ok: false, message: "Mã danh mục không hợp lệ." };
  }
  const normalizedPath = objectPath.trim();
  if (
    normalizedPath.length > 500 ||
    normalizedPath.includes("..") ||
    !normalizedPath.startsWith(`categories/${categoryId}/`) ||
    !/^[a-z0-9_./-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(normalizedPath)
  ) {
    return { ok: false, message: "Đường dẫn ảnh danh mục không hợp lệ." };
  }

  const supabase = await createClient();
  const { data: publicUrlData } = supabase.storage
    .from(CATALOG_MEDIA_BUCKET)
    .getPublicUrl(normalizedPath);
  const { data, error } = await supabase.rpc("api_set_category_media", {
    p_category_id: categoryId,
    p_object_path: normalizedPath,
    p_image_url: publicUrlData.publicUrl,
    p_alt_text: altText.trim().slice(0, 180),
  });
  if (error) {
    return { ok: false, message: failure("Không thể cập nhật ảnh danh mục.", error) };
  }

  const result = data as { old_object_path?: unknown } | null;
  const oldObjectPath =
    typeof result?.old_object_path === "string" ? result.old_object_path : null;
  if (oldObjectPath && oldObjectPath !== normalizedPath) {
    const { error: cleanupError } = await supabase.storage
      .from(CATALOG_MEDIA_BUCKET)
      .remove([oldObjectPath]);
    if (cleanupError) {
      console.warn("[admin] Không thể xóa ảnh danh mục cũ", cleanupError.message);
    }
  }

  refreshCatalog();
  return { ok: true, message: "Đã cập nhật ảnh danh mục." };
}

export async function removeCategoryMediaAction(
  categoryId: string
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(categoryId)) {
    return { ok: false, message: "Mã danh mục không hợp lệ." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_set_category_media", {
    p_category_id: categoryId,
    p_object_path: null,
    p_image_url: null,
    p_alt_text: null,
  });
  if (error) {
    return { ok: false, message: failure("Không thể gỡ ảnh danh mục.", error) };
  }

  const result = data as { old_object_path?: unknown } | null;
  const oldObjectPath =
    typeof result?.old_object_path === "string" ? result.old_object_path : null;
  if (oldObjectPath) {
    const { error: cleanupError } = await supabase.storage
      .from(CATALOG_MEDIA_BUCKET)
      .remove([oldObjectPath]);
    if (cleanupError) {
      console.warn("[admin] Không thể xóa ảnh danh mục", cleanupError.message);
    }
  }

  refreshCatalog();
  return { ok: true, message: "Đã gỡ ảnh danh mục." };
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(categoryId)) {
    return { ok: false, message: "Mã danh mục không hợp lệ." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_delete_category", {
    p_category_id: categoryId,
  });
  if (error) {
    return { ok: false, message: failure("Không thể xóa danh mục.", error) };
  }

  const result = data as { old_object_path?: unknown } | null;
  const oldObjectPath =
    typeof result?.old_object_path === "string" ? result.old_object_path : null;
  if (oldObjectPath) {
    const { error: cleanupError } = await supabase.storage
      .from(CATALOG_MEDIA_BUCKET)
      .remove([oldObjectPath]);
    if (cleanupError) {
      console.warn("[admin] Không thể xóa ảnh của danh mục đã xóa", cleanupError.message);
    }
  }

  refreshCatalog();
  return { ok: true, message: "Đã xóa danh mục." };
}

export async function reorderCategoriesAction(
  items: AdminCatalogOrderItem[]
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validOrderItems(items)) {
    return { ok: false, message: "Danh sách sắp xếp danh mục không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_reorder_categories", {
    p_items: items,
  });
  if (error) {
    return { ok: false, message: failure("Không thể sắp xếp danh mục.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã cập nhật thứ tự danh mục." };
}

export async function createTagAction(
  name: string,
  displayOrder: number,
  isActive: boolean
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  const normalizedName = cleanCatalogName(name, 80);
  const normalizedOrder = cleanDisplayOrder(displayOrder);
  if (!normalizedName) {
    return { ok: false, message: "Tên tag phải từ 1 đến 80 ký tự." };
  }
  if (normalizedOrder === null) {
    return { ok: false, message: "Thứ tự hiển thị không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_create_tag", {
    p_name: normalizedName,
    p_display_order: normalizedOrder,
    p_is_active: isActive,
  });
  if (error) {
    return { ok: false, message: failure("Không thể tạo tag.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã tạo tag." };
}

export async function updateTagAction(
  tagId: string,
  name: string,
  displayOrder: number
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  const normalizedName = cleanCatalogName(name, 80);
  const normalizedOrder = cleanDisplayOrder(displayOrder);
  if (!validId(tagId)) {
    return { ok: false, message: "Mã tag không hợp lệ." };
  }
  if (!normalizedName) {
    return { ok: false, message: "Tên tag phải từ 1 đến 80 ký tự." };
  }
  if (normalizedOrder === null) {
    return { ok: false, message: "Thứ tự hiển thị không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_update_tag", {
    p_tag_id: tagId,
    p_name: normalizedName,
    p_display_order: normalizedOrder,
  });
  if (error) {
    return { ok: false, message: failure("Không thể cập nhật tag.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã cập nhật tag." };
}

export async function setTagActiveAction(
  tagId: string,
  isActive: boolean
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(tagId)) {
    return { ok: false, message: "Mã tag không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_set_tag_active", {
    p_tag_id: tagId,
    p_is_active: isActive,
  });
  if (error) {
    return { ok: false, message: failure("Không thể cập nhật trạng thái tag.", error) };
  }

  refreshCatalog();
  return { ok: true, message: isActive ? "Đã bật tag." : "Đã tắt tag." };
}

export async function deleteTagAction(tagId: string): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validId(tagId)) {
    return { ok: false, message: "Mã tag không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_delete_tag", { p_tag_id: tagId });
  if (error) {
    return { ok: false, message: failure("Không thể xóa tag.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã xóa tag." };
}

export async function reorderTagsAction(
  items: AdminCatalogOrderItem[]
): Promise<AdminActionResult> {
  await requirePermission("catalog.manage");
  if (!validOrderItems(items)) {
    return { ok: false, message: "Danh sách sắp xếp tag không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_reorder_tags", { p_items: items });
  if (error) {
    return { ok: false, message: failure("Không thể sắp xếp tag.", error) };
  }

  refreshCatalog();
  return { ok: true, message: "Đã cập nhật thứ tự tag." };
}
