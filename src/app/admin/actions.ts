"use server";

import { revalidatePath, updateTag } from "next/cache";

import type {
  AdminActionResult,
  AdminCatalogOrderItem,
  CreateFinanceOverrideInput,
  CreateFinanceVersionInput,
  FinanceSimulationActionResult,
  FinanceSimulationInput,
  FinanceTaxRule,
} from "@/types/admin";
import { parseFinanceSimulation } from "@/lib/data/adminFinance";
import {
  SITE_MEDIA_SLOTS,
  type SiteMediaSlot,
} from "@/types/siteMedia";
import { requirePermission } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { voucherPayload } from "@/lib/voucherInput";
import type { VoucherActionResult, VoucherSaveInput, VoucherStoredStatus } from "@/types/voucher";

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
  if (["22023", "23503", "23505", "23P01"].includes(error?.code ?? "")) {
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

function validFinanceDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function validFinanceNumber(value: unknown, max = Number.MAX_SAFE_INTEGER) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;
}

function validCycleDay(cycle: string, day: number) {
  if (!Number.isInteger(day)) return false;
  if (cycle === "daily") return day === 1;
  if (cycle === "weekly") return day >= 1 && day <= 7;
  if (cycle === "biweekly") return day >= 1 && day <= 14;
  return cycle === "monthly" && day >= 1 && day <= 28;
}

function cleanFinanceTaxes(taxes: FinanceTaxRule[]) {
  if (!Array.isArray(taxes) || taxes.length > 12) return null;
  const codes = new Set<string>();
  const cleaned: FinanceTaxRule[] = [];
  for (const tax of taxes) {
    const code = tax.code.trim().toUpperCase();
    const name = tax.name.trim();
    if (!/^[A-Z][A-Z0-9_]{0,29}$/.test(code) || !name || name.length > 120) {
      return null;
    }
    if (codes.has(code) || !validFinanceNumber(tax.rate_percent, 100)) return null;
    if (!["platform_fees", "owner_revenue", "order_subtotal"].includes(tax.basis)) {
      return null;
    }
    codes.add(code);
    cleaned.push({ code, name, rate_percent: tax.rate_percent, basis: tax.basis });
  }
  return cleaned;
}

function cleanVersionSettings(input: CreateFinanceVersionInput) {
  const settings = input.settings;
  const percentages = [
    settings.commission_percent,
    settings.gateway_fee_percent,
    settings.refund_fee_percent,
    settings.voucher_platform_percent,
    settings.hold_percent,
  ];
  const amounts = [
    settings.fixed_order_fee,
    settings.gateway_fixed_fee,
    settings.refund_fixed_fee,
    settings.minimum_payout,
    settings.hold_fixed_amount,
  ];
  const taxes = cleanFinanceTaxes(settings.taxes);
  if (percentages.some((value) => !validFinanceNumber(value, 100))) return null;
  if (amounts.some((value) => !validFinanceNumber(value))) return null;
  if (!Number.isInteger(settings.hold_days) || settings.hold_days < 0 || settings.hold_days > 365) {
    return null;
  }
  if (!validCycleDay(settings.settlement_cycle, settings.settlement_day) || !taxes) {
    return null;
  }
  return { ...settings, taxes };
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

export async function reviewShipperApplicationAction(
  applicationId: string,
  decision: "start_review" | "needs_changes" | "approve" | "reject",
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("shippers.verify");
  if (!validId(applicationId) || !["start_review", "needs_changes", "approve", "reject"].includes(decision)) {
    return { ok: false, message: "Hồ sơ hoặc quyết định xét duyệt không hợp lệ." };
  }
  const note = reason.trim();
  if (["needs_changes", "reject"].includes(decision) && (note.length < 5 || note.length > 1000)) {
    return { ok: false, message: "Lý do phải từ 5 đến 1.000 ký tự." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_review_shipper_application", {
    p_application_id: applicationId, p_decision: decision, p_note: note || null,
  });
  if (error) return { ok: false, message: failure("Không thể xét duyệt hồ sơ tài xế.", error) };
  revalidatePath("/admin"); revalidatePath("/shipper");
  return { ok: true, message: decision === "approve" ? "Đã duyệt và cấp quyền Shipper." :
    decision === "reject" ? "Đã từ chối hồ sơ tài xế." :
    decision === "needs_changes" ? "Đã yêu cầu tài xế bổ sung hồ sơ." : "Đã tiếp nhận hồ sơ để xét duyệt." };
}

export async function setShipperActiveAction(
  shipperId: string,
  active: boolean,
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("shippers.verify");
  if (!validId(shipperId)) {
    return { ok: false, message: "Mã tài xế không hợp lệ." };
  }
  const note = cleanNote(reason);
  if (!note.ok) return { ok: false, message: note.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_admin_set_shipper_active", {
    p_shipper_id: shipperId,
    p_active: active,
    p_reason: note.value,
  });
  if (error) {
    return {
      ok: false,
      message: failure("Không thể cập nhật trạng thái tài xế.", error),
    };
  }
  revalidatePath("/admin");
  revalidatePath("/shipper");
  return {
    ok: true,
    message: active ? "Đã mở lại tài xế." : "Đã tạm ngưng tài xế.",
  };
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

export async function reviewShipperWithdrawalAction(
  withdrawalId: string, decision: "approve" | "reject" | "paid" | "failed",
  noteValue: string, transferReference = ""
): Promise<AdminActionResult> {
  await requirePermission("shippers.finance.manage");
  if (!validId(withdrawalId)) return { ok: false, message: "Mã yêu cầu rút tiền không hợp lệ." };
  const note = cleanNote(noteValue); if (!note.ok) return { ok: false, message: note.error };
  const reference = transferReference.trim();
  if (decision === "paid" && (reference.length < 3 || reference.length > 120)) {
    return { ok: false, message: "Mã giao dịch ngân hàng phải từ 3 đến 120 ký tự." };
  }
  const supabase = await createClient(); const { error } = await supabase.rpc("api_admin_review_shipper_withdrawal", {
    p_withdrawal_id: withdrawalId, p_decision: decision, p_note: note.value,
    p_transfer_reference: reference || null,
  });
  if (error) return { ok: false, message: failure("Không thể xử lý yêu cầu rút tiền.", error) };
  revalidatePath("/admin"); revalidatePath("/shipper");
  return { ok: true, message: decision === "approve" ? "Đã duyệt yêu cầu rút tiền." :
    decision === "paid" ? "Đã ghi nhận chuyển khoản thành công." :
    decision === "reject" ? "Đã từ chối và hoàn số dư cho tài xế." : "Đã ghi nhận thất bại và hoàn số dư." };
}

export async function recordShipperCodRemittanceAction(
  shipperId: string, amount: number, referenceValue: string, noteValue: string
): Promise<AdminActionResult> {
  await requirePermission("shippers.finance.manage");
  const note = cleanNote(noteValue); const reference = referenceValue.trim();
  if (!validId(shipperId) || !Number.isFinite(amount) || amount <= 0 ||
      reference.length < 3 || reference.length > 120) {
    return { ok: false, message: "Thông tin đối soát COD không hợp lệ." };
  }
  if (!note.ok) return { ok: false, message: note.error };
  const supabase = await createClient(); const { error } = await supabase.rpc("api_admin_record_shipper_cod_remittance", {
    p_shipper_id: shipperId, p_amount: amount, p_reference: reference, p_note: note.value,
  });
  if (error) return { ok: false, message: failure("Không thể ghi nhận tiền COD.", error) };
  revalidatePath("/admin"); revalidatePath("/shipper");
  return { ok: true, message: "Đã ghi nhận khoản COD tài xế nộp." };
}

export async function interveneOrderAction(
  orderId: string,
  action: "redispatch" | "mark_failed" | "cancel_refund" | "resolve_complete" | "resend_notification",
  noteValue: string,
  expectedVersion: number
): Promise<AdminActionResult> {
  await requirePermission("orders.intervene");
  const note = cleanNote(noteValue);
  if (!validId(orderId) || !Number.isInteger(expectedVersion) || expectedVersion < 1) {
    return { ok: false, message: "Thông tin đơn hàng không hợp lệ." };
  }
  if (!note.ok) return { ok: false, message: note.error };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_admin_intervene_order", {
    p_order_id: orderId, p_action: action, p_note: note.value, p_expected_version: expectedVersion,
  });
  if (error) return { ok: false, message: failure("Không thể can thiệp đơn hàng.", error) };
  revalidatePath("/admin"); revalidatePath("/owner"); revalidatePath(`/orders/${orderId}`); revalidatePath("/shipper");
  return { ok: true, message: action === "redispatch" ? "Đã đưa đơn về hàng tìm tài xế." :
    action === "resolve_complete" ? "Đã xác nhận hoàn tất và đóng sự cố." :
    action === "resend_notification" ? "Đã gửi lại thông báo cho khách." :
    action === "mark_failed" ? "Đã ghi nhận giao thất bại." : "Đã hủy đơn và khởi tạo xử lý hoàn tiền nếu cần." };
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

export async function createFinanceVersionAction(
  input: CreateFinanceVersionInput
): Promise<AdminActionResult> {
  await requirePermission("finance.settings.manage");
  const name = input.name.trim();
  const note = input.note.trim();
  const effectiveFrom = validFinanceDate(input.effective_from);
  const effectiveTo = input.effective_to ? validFinanceDate(input.effective_to) : null;
  const settings = cleanVersionSettings(input);

  if (!name || name.length > 120) {
    return { ok: false, message: "Tên phiên bản phải từ 1 đến 120 ký tự." };
  }
  if (note.length > 1000) {
    return { ok: false, message: "Ghi chú không được vượt quá 1.000 ký tự." };
  }
  if (!effectiveFrom || (input.effective_to && !effectiveTo)) {
    return { ok: false, message: "Khoảng thời gian áp dụng không hợp lệ." };
  }
  if (effectiveTo && effectiveTo <= effectiveFrom) {
    return { ok: false, message: "Ngày kết thúc phải sau ngày bắt đầu." };
  }
  if (!settings) {
    return { ok: false, message: "Thông số biểu phí không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_create_finance_version", {
    p_name: name,
    p_effective_from: effectiveFrom,
    p_effective_to: effectiveTo,
    p_settings: settings,
    p_note: note || null,
  });
  if (error) {
    return { ok: false, message: failure("Không thể tạo phiên bản biểu phí.", error) };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Đã tạo phiên bản biểu phí mới." };
}

export async function createFinanceOverrideAction(
  input: CreateFinanceOverrideInput
): Promise<AdminActionResult> {
  await requirePermission("finance.settings.manage");
  const name = input.name.trim();
  const note = input.note.trim();
  const effectiveFrom = validFinanceDate(input.effective_from);
  const effectiveTo = input.effective_to ? validFinanceDate(input.effective_to) : null;
  if (!validId(input.restaurant_id)) {
    return { ok: false, message: "Nhà hàng không hợp lệ." };
  }
  if (!name || name.length > 120) {
    return { ok: false, message: "Tên ngoại lệ phải từ 1 đến 120 ký tự." };
  }
  if (note.length > 1000) {
    return { ok: false, message: "Ghi chú không được vượt quá 1.000 ký tự." };
  }
  if (!effectiveFrom || (input.effective_to && !effectiveTo)) {
    return { ok: false, message: "Khoảng thời gian áp dụng không hợp lệ." };
  }
  if (effectiveTo && effectiveTo <= effectiveFrom) {
    return { ok: false, message: "Ngày kết thúc phải sau ngày bắt đầu." };
  }

  const source = input.settings;
  const settings: Record<string, unknown> = {};
  const percentageKeys = [
    "commission_percent",
    "gateway_fee_percent",
    "refund_fee_percent",
    "voucher_platform_percent",
    "hold_percent",
  ] as const;
  const amountKeys = [
    "fixed_order_fee",
    "gateway_fixed_fee",
    "refund_fixed_fee",
    "minimum_payout",
    "hold_fixed_amount",
  ] as const;
  for (const key of percentageKeys) {
    const value = source[key];
    if (value == null) continue;
    if (!validFinanceNumber(value, 100)) {
      return { ok: false, message: `Tỷ lệ ${key} không hợp lệ.` };
    }
    settings[key] = value;
  }
  for (const key of amountKeys) {
    const value = source[key];
    if (value == null) continue;
    if (!validFinanceNumber(value)) {
      return { ok: false, message: `Số tiền ${key} không hợp lệ.` };
    }
    settings[key] = value;
  }
  if (source.hold_days != null) {
    if (!Number.isInteger(source.hold_days) || source.hold_days < 0 || source.hold_days > 365) {
      return { ok: false, message: "Số ngày tạm giữ không hợp lệ." };
    }
    settings.hold_days = source.hold_days;
  }
  if (source.settlement_cycle != null || source.settlement_day != null) {
    if (!source.settlement_cycle || source.settlement_day == null
        || !validCycleDay(source.settlement_cycle, source.settlement_day)) {
      return { ok: false, message: "Chu kỳ đối soát ngoại lệ không hợp lệ." };
    }
    settings.settlement_cycle = source.settlement_cycle;
    settings.settlement_day = source.settlement_day;
  }
  if (source.taxes != null) {
    const taxes = cleanFinanceTaxes(source.taxes);
    if (!taxes) return { ok: false, message: "Danh sách thuế ngoại lệ không hợp lệ." };
    settings.taxes = taxes;
  }
  if (Object.keys(settings).length === 0) {
    return { ok: false, message: "Hãy chọn ít nhất một thông số cần ghi đè." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_create_finance_override", {
    p_restaurant_id: input.restaurant_id,
    p_name: name,
    p_effective_from: effectiveFrom,
    p_effective_to: effectiveTo,
    p_settings: settings,
    p_note: note || null,
  });
  if (error) {
    return { ok: false, message: failure("Không thể tạo ngoại lệ nhà hàng.", error) };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Đã tạo phiên bản ngoại lệ nhà hàng." };
}

export async function simulateFinancePayoutAction(
  input: FinanceSimulationInput
): Promise<FinanceSimulationActionResult> {
  await requirePermission("finance.settings.manage");
  const at = validFinanceDate(input.at);
  if (input.restaurant_id && !validId(input.restaurant_id)) {
    return { ok: false, message: "Nhà hàng mô phỏng không hợp lệ." };
  }
  if (!at || !validFinanceNumber(input.order_subtotal) || input.order_subtotal <= 0
      || !validFinanceNumber(input.voucher_discount)
      || !validFinanceNumber(input.refund_amount)) {
    return { ok: false, message: "Dữ liệu mô phỏng không hợp lệ." };
  }
  if (input.voucher_discount > input.order_subtotal) {
    return { ok: false, message: "Voucher không được lớn hơn giá trị món." };
  }
  if (input.refund_amount > input.order_subtotal) {
    return { ok: false, message: "Tiền hoàn không được lớn hơn giá trị món." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_simulate_owner_payout", {
    p_restaurant_id: input.restaurant_id,
    p_at: at,
    p_order_subtotal: input.order_subtotal,
    p_voucher_discount: input.voucher_discount,
    p_refund_amount: input.refund_amount,
  });
  if (error) {
    return { ok: false, message: failure("Không thể mô phỏng khoản Owner nhận.", error) };
  }
  const simulation = parseFinanceSimulation(data);
  if (!simulation) {
    return { ok: false, message: "Kết quả mô phỏng không hợp lệ." };
  }
  return { ok: true, message: "Đã tính khoản Owner dự kiến nhận.", data: simulation };
}

export async function reviewRestaurantApplicationAction(
  applicationId: string,
  decision: "start_review" | "request_changes" | "approve" | "reject",
  reason: string
): Promise<AdminActionResult> {
  await requirePermission("restaurants.verify");
  if (!validId(applicationId)) return { ok: false, message: "Mã hồ sơ không hợp lệ." };
  if (!["start_review", "request_changes", "approve", "reject"].includes(decision)) {
    return { ok: false, message: "Quyết định xét duyệt không hợp lệ." };
  }
  const note = reason.trim();
  if (["request_changes", "reject"].includes(decision) && note.length < 5) {
    return { ok: false, message: "Vui lòng nhập lý do ít nhất 5 ký tự." };
  }
  if (note.length > 1000) return { ok: false, message: "Ghi chú không được quá 1.000 ký tự." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_review_restaurant_application", {
    p_application_id: applicationId, p_decision: decision, p_note: note || null,
  });
  if (error) return { ok: false, message: failure("Không thể xét duyệt hồ sơ.", error) };
  revalidatePath("/admin");
  revalidatePath("/account/seller");
  revalidatePath("/owner");
  return { ok: true, message: decision === "approve" ? "Đã duyệt và tạo nhà hàng." : "Đã cập nhật trạng thái hồ sơ." };
}

export async function saveAdminVoucherAction(input: VoucherSaveInput): Promise<VoucherActionResult> {
  await requirePermission("vouchers.manage");
  const cleaned = voucherPayload(input, false);
  if ("error" in cleaned) return { ok: false, message: cleaned.error };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_admin_save_voucher_v2", { p_payload: cleaned.payload });
  if (error) return { ok: false, message: failure("Không thể lưu voucher nền tảng.", error) };
  updateTag("vouchers");
  revalidatePath("/admin"); revalidatePath("/vouchers"); revalidatePath("/checkout");
  return { ok: true, message: input.id ? "Đã cập nhật voucher." : "Đã tạo voucher nền tảng.", voucherId: String(data) };
}

export async function assignVoucherByEmailAction(
  voucherId: string,
  email: string
): Promise<VoucherActionResult> {
  await requirePermission("vouchers.manage");
  const normalizedEmail = email.trim().toLowerCase();
  if (!validId(voucherId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, message: "Voucher hoặc email khách hàng không hợp lệ." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_assign_voucher_by_email", {
    p_voucher_id: voucherId,
    p_email: normalizedEmail,
    p_source: "admin",
  });
  if (error) return { ok: false, message: failure("Không thể tặng voucher.", error) };
  updateTag("vouchers");
  revalidatePath("/admin"); revalidatePath("/vouchers"); revalidatePath("/checkout");
  return { ok: true, message: `Đã tặng voucher cho ${normalizedEmail}.` };
}

export async function setAdminVoucherStatusAction(
  voucherId: string,
  status: VoucherStoredStatus
): Promise<VoucherActionResult> {
  await requirePermission("vouchers.manage");
  if (!validId(voucherId) || !["draft", "active", "paused", "archived"].includes(status)) {
    return { ok: false, message: "Voucher hoặc trạng thái không hợp lệ." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_set_voucher_status", { p_voucher_id: voucherId, p_status: status });
  if (error) return { ok: false, message: failure("Không thể đổi trạng thái voucher.", error) };
  updateTag("vouchers");
  revalidatePath("/admin"); revalidatePath("/vouchers"); revalidatePath("/checkout");
  return { ok: true, message: status === "active" ? "Voucher đã hoạt động." : status === "paused" ? "Đã tạm dừng voucher." : status === "archived" ? "Đã lưu trữ voucher." : "Đã chuyển voucher về bản nháp." };
}
