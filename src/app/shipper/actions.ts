"use server";

import { revalidatePath } from "next/cache";

import type { DeliveryStatus, ShipperActionResult, ShipperApplicationInput } from "@/types/shipper";
import { requireAnyRole, requireCurrentUser } from "@/utils/auth/guards";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DELIVERY_PROOF_BUCKET = "delivery-proof";
const DELIVERY_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

async function getDeliveryProofContext(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_get_shipper_dashboard");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
  const source = data as Record<string, unknown>;
  const profile = source.profile && typeof source.profile === "object" && !Array.isArray(source.profile)
    ? source.profile as Record<string, unknown> : null;
  const shipperId = typeof profile?.id === "string" ? profile.id : null;
  const deliveries = Array.isArray(source.active_deliveries) ? source.active_deliveries : [];
  const delivery = deliveries.find((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const item = value as Record<string, unknown>;
    return item.order_id === orderId && item.delivery_status === "delivering";
  });
  return shipperId && delivery ? { shipperId } : null;
}

export async function createDeliveryProofUploadTicketAction(orderId: string, mimeType: string): Promise<
  | { ok: true; objectPath: string; token: string }
  | { ok: false; message: string }
> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || !DELIVERY_PROOF_TYPES[mimeType]) {
    return { ok: false, message: "Đơn hàng hoặc định dạng ảnh không hợp lệ." };
  }
  const context = await getDeliveryProofContext(orderId);
  if (!context) {
    return { ok: false, message: "Đơn không ở trạng thái đang giao hoặc không thuộc tài xế hiện tại." };
  }
  const objectPath = `orders/${orderId}/${context.shipperId}/${crypto.randomUUID()}.${DELIVERY_PROOF_TYPES[mimeType]}`;
  try {
    const { data, error } = await createAdminClient().storage.from(DELIVERY_PROOF_BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error || !data?.token) {
      console.error("[shipper] Không thể tạo vé tải ảnh giao hàng", error);
      return { ok: false, message: "Không thể khởi tạo phiên tải ảnh giao hàng." };
    }
    return { ok: true, objectPath, token: data.token };
  } catch (error) {
    console.error("[shipper] Không thể khởi tạo Storage cho ảnh giao hàng", error);
    return { ok: false, message: "Server chưa đọc được SUPABASE_SECRET_KEY." };
  }
}

export async function discardDeliveryProofUploadAction(orderId: string, objectPath: string): Promise<void> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || !objectPath.startsWith(`orders/${orderId}/`) || objectPath.includes("..")) return;
  const context = await getDeliveryProofContext(orderId);
  if (!context || !objectPath.startsWith(`orders/${orderId}/${context.shipperId}/`)) return;
  try {
    const { error } = await createAdminClient().storage.from(DELIVERY_PROOF_BUCKET).remove([objectPath]);
    if (error) console.error("[shipper] Chưa dọn được ảnh giao hàng chưa gắn bằng chứng", error);
  } catch (error) {
    console.error("[shipper] Không thể khởi tạo cleanup ảnh giao hàng", error);
  }
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

const NEXT: DeliveryStatus[] = ["arrived_at_restaurant", "delivering"];
export async function updateDeliveryAction(orderId: string, status: DeliveryStatus): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId) || !NEXT.includes(status)) return { ok: false, message: "Bước giao hàng không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_update_delivery", { p_order_id: orderId, p_next_status: status });
  if (error) return { ok: false, message: message(error, "Không thể cập nhật chuyến giao.") };
  refresh(); return { ok: true, message: "Đã cập nhật trạng thái chuyến." };
}

export async function requestPickupConfirmationAction(orderId: string): Promise<ShipperActionResult> {
  await requireAnyRole(["SHIPPER"]);
  if (!UUID.test(orderId)) return { ok: false, message: "Mã chuyến không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_shipper_request_pickup_confirmation", {
    p_order_id: orderId,
  });
  if (error) return { ok: false, message: message(error, "Không thể gửi yêu cầu xác nhận lấy món.") };
  refresh();
  return { ok: true, message: "Đã báo lấy món. Đang chờ nhà hàng xác nhận bàn giao." };
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
