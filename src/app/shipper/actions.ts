"use server";

import { revalidatePath } from "next/cache";

import type { DeliveryStatus, ShipperActionResult, ShipperApplicationInput } from "@/types/shipper";
import { requireAnyRole, requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function message(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (["22023", "23505", "23514", "40001", "42501", "P0002"].includes(error.code ?? "")) {
    return error.message || fallback;
  }
  console.error("[shipper] RPC thất bại", error);
  return fallback;
}

function refresh() {
  revalidatePath("/shipper"); revalidatePath("/admin"); revalidatePath("/orders", "layout");
}

export async function submitShipperApplicationAction(input: ShipperApplicationInput): Promise<ShipperActionResult> {
  await requireCurrentUser();
  const birth = new Date(input.dateOfBirth);
  const ageLimit = new Date(); ageLimit.setFullYear(ageLimit.getFullYear() - 18);
  if (input.fullName.trim().length < 2 || !/^(\+84|0)\d{9,10}$/.test(input.phone.replace(/[\s().-]/g, "")) ||
      Number.isNaN(birth.getTime()) || birth > ageLimit || input.identityNumber.trim().length < 9 ||
      input.driverLicenseNumber.trim().length < 6 || input.vehicleType.trim().length < 2 ||
      input.plateNumber.trim().length < 6) {
    return { ok: false, message: "Thông tin đăng ký tài xế chưa hợp lệ." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_submit_shipper_application", { p_payload: {
    full_name: input.fullName.trim(), phone: input.phone.trim(), date_of_birth: input.dateOfBirth,
    identity_number: input.identityNumber.trim(), driver_license_number: input.driverLicenseNumber.trim(),
    vehicle_type: input.vehicleType.trim(), plate_number: input.plateNumber.trim(),
  } });
  if (error) return { ok: false, message: message(error, "Không thể gửi hồ sơ tài xế.") };
  refresh(); return { ok: true, message: "Đã gửi hồ sơ tài xế để xét duyệt." };
}

export async function setShipperOnlineAction(online: boolean): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]); const supabase = await createClient();
  const { error } = await supabase.rpc("api_set_shipper_online", { p_online: online });
  if (error) return { ok: false, message: message(error, "Không thể đổi trạng thái hoạt động.") };
  refresh(); return { ok: true, message: online ? "Bạn đang online và có thể nhận chuyến." : "Bạn đã chuyển sang offline." };
}

export async function updateShipperLocationAction(lat: number, lon: number): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    return { ok: false, message: "Tọa độ không hợp lệ." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_update_shipper_location", { p_lat: lat, p_lon: lon });
  if (error) return { ok: false, message: message(error, "Không thể cập nhật vị trí.") };
  refresh(); return { ok: true, message: "Đã cập nhật vị trí hiện tại." };
}

export async function acceptDeliveryAction(orderId: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]); if (!UUID.test(orderId)) return { ok: false, message: "Mã chuyến không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_accept_delivery", { p_order_id: orderId });
  if (error) return { ok: false, message: message(error, "Không thể nhận chuyến.") };
  refresh(); return { ok: true, message: "Đã nhận chuyến. Thông tin người nhận đã được mở khóa." };
}

export async function acceptDeliveryOfferAction(offerId: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]); if (!UUID.test(offerId)) return { ok: false, message: "Mã đề xuất không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_accept_offer", { p_offer_id: offerId });
  if (error) return { ok: false, message: message(error, "Không thể nhận đề xuất chuyến.") };
  refresh(); return { ok: true, message: "Đã nhận chuyến do hệ thống đề xuất." };
}

export async function rejectDeliveryOfferAction(offerId: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]); if (!UUID.test(offerId)) return { ok: false, message: "Mã đề xuất không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_reject_offer", { p_offer_id: offerId });
  if (error) return { ok: false, message: message(error, "Không thể bỏ qua đề xuất.") };
  refresh(); return { ok: true, message: "Đã bỏ qua đề xuất chuyến." };
}

const NEXT: DeliveryStatus[] = ["arrived_at_restaurant", "picked_up", "delivering"];
export async function updateDeliveryAction(orderId: string, status: DeliveryStatus): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || !NEXT.includes(status)) return { ok: false, message: "Bước giao hàng không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_update_delivery", { p_order_id: orderId, p_next_status: status });
  if (error) return { ok: false, message: message(error, "Không thể cập nhật chuyến giao.") };
  refresh(); return { ok: true, message: "Đã cập nhật trạng thái chuyến." };
}

export async function submitDeliveryProofAction(orderId: string, objectPath: string, note: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || !objectPath.startsWith(`orders/${orderId}/`) || note.trim().length > 300) {
    return { ok: false, message: "Thông tin bằng chứng giao hàng không hợp lệ." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_submit_delivery_proof", {
    p_order_id: orderId, p_object_path: objectPath, p_note: note.trim() || null,
  });
  if (error) return { ok: false, message: message(error, "Không thể gửi bằng chứng giao hàng.") };
  refresh(); revalidatePath(`/orders/${orderId}`);
  return { ok: true, message: "Đã gửi ảnh. Đơn đang chờ khách xác nhận." };
}

export async function releaseDeliveryAction(orderId: string, reason: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || reason.trim().length < 5 || reason.trim().length > 300) {
    return { ok: false, message: "Lý do bỏ chuyến phải từ 5 đến 300 ký tự." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_release_delivery", { p_order_id: orderId, p_reason: reason.trim() });
  if (error) return { ok: false, message: message(error, "Không thể trả chuyến về danh sách.") };
  refresh(); return { ok: true, message: "Đã trả chuyến về danh sách để tài xế khác nhận." };
}

export async function saveShipperBankAccountAction(input: {
  bankCode: string; bankName: string; accountHolder: string; accountNumber: string;
}): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  const bankCode = input.bankCode.trim().toUpperCase(); const bankName = input.bankName.trim();
  const holder = input.accountHolder.trim().toUpperCase(); const number = input.accountNumber.replace(/\D/g, "");
  if (!/^[A-Z0-9_-]{2,20}$/.test(bankCode) || bankName.length < 2 || bankName.length > 120 ||
      holder.length < 2 || holder.length > 120 || !/^\d{6,25}$/.test(number)) {
    return { ok: false, message: "Thông tin tài khoản ngân hàng không hợp lệ." };
  }
  const supabase = await createClient(); const { error } = await supabase.rpc("api_upsert_shipper_bank_account", {
    p_bank_code: bankCode, p_bank_name: bankName, p_account_holder: holder, p_account_number: number,
  });
  if (error) return { ok: false, message: message(error, "Không thể lưu tài khoản ngân hàng.") };
  refresh(); return { ok: true, message: "Đã lưu tài khoản nhận tiền." };
}

export async function requestShipperWithdrawalAction(amount: number, note: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!Number.isFinite(amount) || amount <= 0 || note.trim().length > 300) {
    return { ok: false, message: "Số tiền hoặc ghi chú không hợp lệ." };
  }
  const supabase = await createClient(); const { error } = await supabase.rpc("api_request_shipper_withdrawal", {
    p_amount: amount, p_note: note.trim() || null,
  });
  if (error) return { ok: false, message: message(error, "Không thể gửi yêu cầu rút tiền.") };
  refresh(); return { ok: true, message: "Đã gửi yêu cầu và khóa số tiền chờ chuyển khoản." };
}

export async function cancelShipperWithdrawalAction(withdrawalId: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]); if (!UUID.test(withdrawalId)) return { ok: false, message: "Mã yêu cầu không hợp lệ." };
  const supabase = await createClient(); const { error } = await supabase.rpc("api_cancel_shipper_withdrawal", {
    p_withdrawal_id: withdrawalId,
  });
  if (error) return { ok: false, message: message(error, "Không thể hủy yêu cầu rút tiền.") };
  refresh(); return { ok: true, message: "Đã hủy yêu cầu và hoàn lại số dư." };
}
