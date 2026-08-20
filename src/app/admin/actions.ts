"use server";

import { revalidatePath } from "next/cache";

import type { AdminActionResult } from "@/types/admin";
import { requirePermission } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function failure(message: string, error?: { code?: string; message?: string }) {
  console.error("[admin] RPC thất bại", {
    code: error?.code,
    message: error?.message,
  });

  if (error?.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  if (error?.code === "P0002") return "Không tìm thấy dữ liệu cần xử lý.";
  return message;
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
