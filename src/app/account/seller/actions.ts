"use server";

import { revalidatePath } from "next/cache";

import type { OwnerActionResult } from "@/types/owner";
import { verifyGoogleAddressSelection } from "@/lib/geocoding";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SellerApplicationInput = {
  applicationId?: string;
  restaurantName: string;
  description: string;
  address: string;
  googlePlaceId?: string;
  phone: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  businessLicenseNumber: string;
  taxCode: string;
  legalRepresentativeName: string;
};

function message(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  if (["22023", "23505", "P0002"].includes(error.code ?? "")) {
    return error.message || fallback;
  }
  console.error("[seller] RPC thất bại", error);
  return fallback;
}

function refresh() {
  revalidatePath("/account/seller");
  revalidatePath("/admin");
  revalidatePath("/owner");
}

export async function saveSellerApplicationAction(
  input: SellerApplicationInput
): Promise<OwnerActionResult> {
  await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  const name = input.restaurantName.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  if (name.length < 2 || name.length > 160) return { ok: false, message: "Tên quán phải từ 2 đến 160 ký tự." };
  if (address.length < 5 || address.length > 500) return { ok: false, message: "Địa chỉ chưa hợp lệ." };
  if (phone.length < 8 || phone.length > 20) return { ok: false, message: "Số điện thoại chưa hợp lệ." };
  const hasClientCoordinate = input.lat != null || input.lon != null;
  if (hasClientCoordinate && (
      !Number.isFinite(input.lat) || Number(input.lat) < -90 || Number(input.lat) > 90 ||
      !Number.isFinite(input.lon) || Number(input.lon) < -180 || Number(input.lon) > 180)) {
    return { ok: false, message: "Tọa độ nhà hàng chưa hợp lệ." };
  }
  if (input.applicationId && !UUID.test(input.applicationId)) {
    return { ok: false, message: "Mã hồ sơ không hợp lệ." };
  }
  let verifiedAddress;
  try {
    verifiedAddress = await verifyGoogleAddressSelection({
      address, placeId: input.googlePlaceId, lat: input.lat, lon: input.lon,
    });
  } catch (error) {
    console.error("[seller] Xác minh Google Maps thất bại", error);
    return {
      ok: false,
      message: error instanceof Error && error.message.includes("GOOGLE_MAPS_SERVER_API_KEY")
        ? "Máy chủ chưa cấu hình GOOGLE_MAPS_SERVER_API_KEY."
        : error instanceof Error ? error.message : "Không thể xác minh địa chỉ Google Maps.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_save_restaurant_application", {
    p_restaurant_name: name,
    p_description: input.description.trim() || null,
    p_address: verifiedAddress.formattedAddress || address,
    p_phone: phone,
    p_lat: verifiedAddress.lat,
    p_lon: verifiedAddress.lon,
    p_timezone: input.timezone || "Asia/Ho_Chi_Minh",
    p_application_id: input.applicationId || null,
    p_business_license_number: input.businessLicenseNumber.trim() || null,
    p_tax_code: input.taxCode.trim() || null,
    p_legal_representative_name: input.legalRepresentativeName.trim() || null,
  });
  if (error) return { ok: false, message: message(error, "Không thể lưu hồ sơ.") };
  refresh();
  return { ok: true, message: "Đã lưu bản nháp hồ sơ." };
}

export async function submitSellerApplicationAction(id: string): Promise<OwnerActionResult> {
  await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  if (!UUID.test(id)) return { ok: false, message: "Mã hồ sơ không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_submit_restaurant_application", { p_application_id: id });
  if (error) return { ok: false, message: message(error, "Không thể nộp hồ sơ.") };
  refresh();
  return { ok: true, message: "Đã nộp hồ sơ để EatNow xét duyệt." };
}

export async function withdrawSellerApplicationAction(
  id: string, note: string
): Promise<OwnerActionResult> {
  await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  if (!UUID.test(id)) return { ok: false, message: "Mã hồ sơ không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_withdraw_restaurant_application", {
    p_application_id: id, p_note: note.trim() || null,
  });
  if (error) return { ok: false, message: message(error, "Không thể rút hồ sơ.") };
  refresh();
  return { ok: true, message: "Đã rút hồ sơ." };
}

export async function respondStaffInvitationAction(
  id: string, accept: boolean
): Promise<OwnerActionResult> {
  await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  if (!UUID.test(id)) return { ok: false, message: "Mã lời mời không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_respond_staff_invitation", {
    p_invitation_id: id, p_accept: accept,
  });
  if (error) return { ok: false, message: message(error, "Không thể phản hồi lời mời.") };
  refresh();
  return { ok: true, message: accept ? "Đã tham gia nhà hàng." : "Đã từ chối lời mời." };
}
