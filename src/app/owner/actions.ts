"use server";

import { revalidatePath, updateTag } from "next/cache";

import type { OwnerActionResult, RestaurantHour } from "@/types/owner";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BUCKET = "restaurant-media";

export type RestaurantProfileInput = {
  id: string; name: string; description: string; address: string; phone: string;
  lat: number; lon: number; timezone: string;
};

function errorMessage(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  if (["22023", "23505", "23514", "P0002"].includes(error.code ?? "")) return error.message || fallback;
  console.error("[owner] RPC thất bại", error);
  return fallback;
}

async function authorized() {
  await requireAnyRole(["RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  return createClient();
}

function refresh() {
  updateTag("catalog");
  revalidatePath("/owner"); revalidatePath("/restaurants", "layout");
  revalidatePath("/account/seller"); revalidatePath("/admin"); revalidatePath("/");
}

export async function updateRestaurantProfileAction(input: RestaurantProfileInput): Promise<OwnerActionResult> {
  if (!UUID.test(input.id)) return { ok: false, message: "Mã nhà hàng không hợp lệ." };
  if (input.name.trim().length < 2 || input.address.trim().length < 5) return { ok: false, message: "Tên hoặc địa chỉ chưa hợp lệ." };
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lon)) return { ok: false, message: "Tọa độ chưa hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_update_restaurant_profile", {
    p_restaurant_id: input.id, p_name: input.name.trim(),
    p_description: input.description.trim() || null, p_address: input.address.trim(),
    p_phone: input.phone.trim() || null, p_lat: input.lat, p_lon: input.lon,
    p_timezone: input.timezone || "Asia/Ho_Chi_Minh",
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể cập nhật hồ sơ.") };
  refresh(); return { ok: true, message: "Đã cập nhật hồ sơ nhà hàng." };
}

export async function replaceRestaurantHoursAction(id: string, hours: RestaurantHour[]): Promise<OwnerActionResult> {
  if (!UUID.test(id) || !Array.isArray(hours) || hours.length > 35) return { ok: false, message: "Lịch hoạt động không hợp lệ." };
  const normalized = hours.map((item) => ({ day_of_week: item.dayOfWeek, slot_no: item.slotNo, opens_at: item.opensAt, closes_at: item.closesAt }));
  const valid = normalized.every((item) => Number.isInteger(item.day_of_week) && item.day_of_week >= 0 && item.day_of_week <= 6 && Number.isInteger(item.slot_no) && item.slot_no >= 1 && item.slot_no <= 5 && /^\d{2}:\d{2}$/.test(item.opens_at) && /^\d{2}:\d{2}$/.test(item.closes_at));
  if (!valid) return { ok: false, message: "Một hoặc nhiều khung giờ không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_replace_restaurant_business_hours", { p_restaurant_id: id, p_hours: normalized });
  if (error) return { ok: false, message: errorMessage(error, "Không thể cập nhật giờ hoạt động.") };
  refresh(); return { ok: true, message: "Đã cập nhật giờ mở cửa." };
}

export async function setAcceptingOrdersAction(id: string, accepting: boolean, reason: string): Promise<OwnerActionResult> {
  if (!UUID.test(id)) return { ok: false, message: "Mã nhà hàng không hợp lệ." };
  if (!accepting && reason.trim().length < 3) return { ok: false, message: "Cần nhập lý do tạm dừng từ 3 ký tự." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_set_restaurant_accepting_orders", {
    p_restaurant_id: id, p_accepting: accepting, p_reason: accepting ? null : reason.trim(), p_paused_until: null,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể đổi trạng thái nhận đơn.") };
  refresh(); return { ok: true, message: accepting ? "Nhà hàng đang nhận đơn." : "Đã tạm dừng nhận đơn." };
}

export async function publishRestaurantAction(id: string): Promise<OwnerActionResult> {
  if (!UUID.test(id)) return { ok: false, message: "Mã nhà hàng không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_publish_restaurant", { p_restaurant_id: id });
  if (error) return { ok: false, message: errorMessage(error, "Không thể xuất bản nhà hàng.") };
  refresh(); return { ok: true, message: "Đã xuất bản nhà hàng. Bạn có thể bật nhận đơn." };
}

export async function inviteRestaurantStaffAction(id: string, email: string): Promise<OwnerActionResult> {
  if (!UUID.test(id) || !/^\S+@\S+\.\S+$/.test(email.trim())) return { ok: false, message: "Email hoặc nhà hàng không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_create_staff_invitation", { p_restaurant_id: id, p_email: email.trim(), p_expires_days: 7 });
  if (error) return { ok: false, message: errorMessage(error, "Không thể gửi lời mời.") };
  refresh(); return { ok: true, message: "Đã tạo lời mời có hiệu lực 7 ngày." };
}

export async function revokeStaffInvitationAction(id: string): Promise<OwnerActionResult> {
  if (!UUID.test(id)) return { ok: false, message: "Mã lời mời không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_revoke_staff_invitation", { p_invitation_id: id });
  if (error) return { ok: false, message: errorMessage(error, "Không thể thu hồi lời mời.") };
  refresh(); return { ok: true, message: "Đã thu hồi lời mời." };
}

export async function revokeRestaurantMemberAction(restaurantId: string, userId: string, reason: string): Promise<OwnerActionResult> {
  if (!UUID.test(restaurantId) || !UUID.test(userId)) return { ok: false, message: "Mã nhân sự không hợp lệ." };
  if (reason.trim().length < 5) return { ok: false, message: "Lý do phải có ít nhất 5 ký tự." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_revoke_restaurant_member", { p_restaurant_id: restaurantId, p_user_id: userId, p_reason: reason.trim() });
  if (error) return { ok: false, message: errorMessage(error, "Không thể thu hồi nhân sự.") };
  refresh(); return { ok: true, message: "Đã thu hồi quyền Restaurant Staff." };
}

export async function transferRestaurantOwnershipAction(restaurantId: string, userId: string): Promise<OwnerActionResult> {
  if (!UUID.test(restaurantId) || !UUID.test(userId)) return { ok: false, message: "Mã nhân sự không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_transfer_restaurant_ownership", { p_restaurant_id: restaurantId, p_new_owner_user_id: userId });
  if (error) return { ok: false, message: errorMessage(error, "Không thể chuyển Owner.") };
  refresh(); return { ok: true, message: "Đã chuyển quyền Owner. Bạn hiện là Restaurant Staff." };
}

export async function applyRestaurantMediaAction(restaurantId: string, kind: "logo" | "cover" | "gallery", objectPath: string, url: string, altText: string): Promise<OwnerActionResult> {
  const expected = `restaurants/${restaurantId}/${kind}/`;
  if (!UUID.test(restaurantId) || !objectPath.startsWith(expected) || !url) return { ok: false, message: "Thông tin ảnh không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_add_restaurant_media", { p_restaurant_id: restaurantId, p_kind: kind, p_object_path: objectPath, p_url: url, p_alt_text: altText.trim() || null });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu ảnh nhà hàng.") };
  refresh(); return { ok: true, message: "Đã cập nhật ảnh nhà hàng." };
}

export async function deleteRestaurantMediaAction(mediaId: string): Promise<OwnerActionResult> {
  if (!UUID.test(mediaId)) return { ok: false, message: "Mã ảnh không hợp lệ." };
  const supabase = await authorized();
  const { data, error } = await supabase.rpc("api_delete_restaurant_media", { p_media_id: mediaId });
  if (error) return { ok: false, message: errorMessage(error, "Không thể xóa ảnh.") };
  const objectPath = data && typeof data === "object" && "object_path" in data && typeof data.object_path === "string" ? data.object_path : null;
  if (objectPath) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([objectPath]);
    if (storageError) console.error("[owner] Đã xóa metadata nhưng chưa xóa được object", storageError);
  }
  refresh(); return { ok: true, message: "Đã xóa ảnh nhà hàng." };
}
