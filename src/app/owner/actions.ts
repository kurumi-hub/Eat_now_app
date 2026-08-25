"use server";

import { revalidatePath, updateTag } from "next/cache";

import type {
  OwnerActionResult,
  OwnerFoodActionResult,
  OwnerFoodInput,
  RestaurantHour,
} from "@/types/owner";
import { verifyGoogleAddressSelection } from "@/lib/geocoding";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { voucherPayload } from "@/lib/voucherInput";
import type { VoucherActionResult, VoucherSaveInput, VoucherStoredStatus } from "@/types/voucher";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BUCKET = "restaurant-media";
const FOOD_BUCKET = "food-media";
const FOOD_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
};

export type ImageUploadTicketResult =
  | { ok: true; objectPath: string; token: string }
  | { ok: false; message: string };

export type RestaurantProfileInput = {
  id: string; name: string; description: string; address: string; phone: string;
  googlePlaceId: string; lat: number; lon: number; timezone: string;
};

function errorMessage(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  if (["22023", "23505", "23514", "40001", "P0002"].includes(error.code ?? "")) return error.message || fallback;
  console.error("[owner] RPC thất bại", error);
  return fallback;
}

async function authorized() {
  await requireAnyRole(["RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  return createClient();
}

async function canManageRestaurantMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string
) {
  const { data, error } = await supabase.rpc("api_get_owner_restaurant_dashboard", {
    p_restaurant_id: restaurantId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data) ||
      !("permissions" in data) || !Array.isArray(data.permissions)) return false;
  return data.permissions.includes("restaurant.media.manage");
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
  const { data: currentData } = await supabase.rpc("api_get_owner_restaurant_dashboard", {
    p_restaurant_id: input.id,
  });
  const currentRestaurant = currentData && typeof currentData === "object" &&
    !Array.isArray(currentData) && "restaurant" in currentData &&
    currentData.restaurant && typeof currentData.restaurant === "object" &&
    !Array.isArray(currentData.restaurant)
      ? currentData.restaurant as Record<string, unknown>
      : null;
  const unchangedPublishedLocation = Boolean(
    currentRestaurant?.published_at &&
    currentRestaurant.address === input.address.trim() &&
    Number(currentRestaurant.lat) === input.lat &&
    Number(currentRestaurant.lon) === input.lon
  );
  let verifiedAddress = input.address.trim();
  if (!unchangedPublishedLocation) {
    try {
      const verified = await verifyGoogleAddressSelection({
        address: input.address,
        placeId: input.googlePlaceId,
        lat: input.lat,
        lon: input.lon,
      });
      verifiedAddress = verified.formattedAddress || verifiedAddress;
    } catch (error) {
      console.error("[owner] Xác minh Google Maps thất bại", error);
      return {
        ok: false,
        message: error instanceof Error && error.message.includes("GOOGLE_MAPS_SERVER_API_KEY")
          ? "Máy chủ chưa cấu hình GOOGLE_MAPS_SERVER_API_KEY."
          : error instanceof Error ? error.message : "Không thể xác minh địa chỉ Google Maps.",
      };
    }
  }
  const { error } = await supabase.rpc("api_update_restaurant_profile", {
    p_restaurant_id: input.id, p_name: input.name.trim(),
    p_description: input.description.trim() || null, p_address: verifiedAddress,
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

export async function transitionOwnerOrderAction(input: {
  restaurantId: string; orderId: string; action: "accept" | "reject" | "start_preparing" | "ready";
  reason?: string; etaMinutes?: number; expectedVersion: number;
}): Promise<OwnerActionResult> {
  if (!UUID.test(input.restaurantId) || !UUID.test(input.orderId) ||
      !Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    return { ok: false, message: "Thông tin đơn hàng không hợp lệ." };
  }
  if (input.action === "accept" && (!Number.isInteger(input.etaMinutes) || input.etaMinutes! < 5 || input.etaMinutes! > 180)) {
    return { ok: false, message: "Thời gian chuẩn bị phải từ 5 đến 180 phút." };
  }
  if (input.action === "reject" && (input.reason?.trim().length ?? 0) < 5) {
    return { ok: false, message: "Lý do từ chối phải có ít nhất 5 ký tự." };
  }
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_restaurant_transition_order", {
    p_restaurant_id: input.restaurantId, p_order_id: input.orderId, p_action: input.action,
    p_reason: input.reason?.trim() || null, p_eta_minutes: input.etaMinutes || null,
    p_expected_version: input.expectedVersion,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể cập nhật đơn hàng.") };
  refresh(); revalidatePath(`/orders/${input.orderId}`);
  return { ok: true, message: input.action === "accept" ? "Đã nhận đơn và bắt đầu tìm tài xế." :
    input.action === "reject" ? "Đã từ chối đơn." : input.action === "start_preparing" ?
      "Đã chuyển sang chuẩn bị món." : "Món đã sẵn sàng để shipper nhận." };
}

export async function confirmShipperPickupAction(input: {
  restaurantId: string;
  orderId: string;
  expectedVersion: number;
}): Promise<OwnerActionResult> {
  if (!UUID.test(input.restaurantId) || !UUID.test(input.orderId) ||
      !Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    return { ok: false, message: "Thông tin đơn hàng không hợp lệ." };
  }
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_restaurant_confirm_shipper_pickup", {
    p_restaurant_id: input.restaurantId,
    p_order_id: input.orderId,
    p_expected_version: input.expectedVersion,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể xác nhận bàn giao món.") };
  refresh(); revalidatePath(`/orders/${input.orderId}`);
  return { ok: true, message: "Đã xác nhận bàn giao món cho tài xế." };
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

export async function applyRestaurantMediaAction(restaurantId: string, kind: "logo" | "cover" | "gallery", objectPath: string, altText: string): Promise<OwnerActionResult> {
  const expected = `restaurants/${restaurantId}/${kind}/`;
  if (!UUID.test(restaurantId) || !objectPath.startsWith(expected) || objectPath.includes("..") ||
      !/\.(?:jpg|jpeg|png|webp|avif)$/i.test(objectPath)) {
    return { ok: false, message: "Thông tin ảnh không hợp lệ." };
  }
  const supabase = await authorized();
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  const { data, error } = await supabase.rpc("api_add_restaurant_media", { p_restaurant_id: restaurantId, p_kind: kind, p_object_path: objectPath, p_url: publicUrl, p_alt_text: altText.trim() || null });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu ảnh nhà hàng.") };
  const oldPaths = data && typeof data === "object" && "old_object_paths" in data &&
    Array.isArray(data.old_object_paths)
      ? data.old_object_paths.filter((item: unknown): item is string => typeof item === "string" && item !== objectPath)
      : [];
  if (oldPaths.length) {
    try {
      const { error: storageError } = await createAdminClient().storage.from(BUCKET).remove(oldPaths);
      if (storageError) console.error("[owner] Đã thay metadata nhưng chưa xóa được ảnh nhà hàng cũ", storageError);
    } catch (storageError) {
      console.error("[owner] Chưa thể khởi tạo cleanup ảnh nhà hàng cũ", storageError);
    }
  }
  refresh(); return { ok: true, message: "Đã cập nhật ảnh nhà hàng." };
}

export async function createRestaurantMediaUploadTicketAction(
  restaurantId: string,
  kind: "logo" | "cover" | "gallery",
  mimeType: string
): Promise<ImageUploadTicketResult> {
  if (!UUID.test(restaurantId) || !["logo", "cover", "gallery"].includes(kind) ||
      !FOOD_IMAGE_TYPES[mimeType]) {
    return { ok: false, message: "Nhà hàng, loại ảnh hoặc định dạng ảnh không hợp lệ." };
  }
  const supabase = await authorized();
  if (!await canManageRestaurantMedia(supabase, restaurantId)) {
    return { ok: false, message: "Bạn không có quyền tải ảnh cho nhà hàng này." };
  }
  const objectPath = `restaurants/${restaurantId}/${kind}/${crypto.randomUUID()}.${FOOD_IMAGE_TYPES[mimeType]}`;
  try {
    const { data, error } = await createAdminClient().storage.from(BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error || !data?.token) {
      console.error("[owner] Không thể tạo vé upload ảnh nhà hàng", error);
      return { ok: false, message: "Không thể khởi tạo phiên tải ảnh nhà hàng." };
    }
    return { ok: true, objectPath, token: data.token };
  } catch (error) {
    console.error("[owner] Không thể khởi tạo Storage admin cho ảnh nhà hàng", error);
    return { ok: false, message: "Server chưa đọc được SUPABASE_SECRET_KEY." };
  }
}

export async function discardRestaurantMediaUploadAction(
  restaurantId: string,
  kind: "logo" | "cover" | "gallery",
  objectPath: string
): Promise<void> {
  const expected = `restaurants/${restaurantId}/${kind}/`;
  if (!UUID.test(restaurantId) || !objectPath.startsWith(expected) || objectPath.includes("..")) return;
  const supabase = await authorized();
  if (!await canManageRestaurantMedia(supabase, restaurantId)) return;
  try {
    const { error } = await createAdminClient().storage.from(BUCKET).remove([objectPath]);
    if (error) console.error("[owner] Chưa dọn được ảnh nhà hàng chưa gắn metadata", error);
  } catch (error) {
    console.error("[owner] Không thể khởi tạo cleanup ảnh nhà hàng", error);
  }
}

export async function deleteRestaurantMediaAction(mediaId: string): Promise<OwnerActionResult> {
  if (!UUID.test(mediaId)) return { ok: false, message: "Mã ảnh không hợp lệ." };
  const supabase = await authorized();
  const { data, error } = await supabase.rpc("api_delete_restaurant_media", { p_media_id: mediaId });
  if (error) return { ok: false, message: errorMessage(error, "Không thể xóa ảnh.") };
  const objectPath = data && typeof data === "object" && "object_path" in data && typeof data.object_path === "string" ? data.object_path : null;
  if (objectPath) {
    try {
      const { error: storageError } = await createAdminClient().storage.from(BUCKET).remove([objectPath]);
      if (storageError) console.error("[owner] Đã xóa metadata nhưng chưa xóa được object", storageError);
    } catch (storageError) {
      console.error("[owner] Chưa thể khởi tạo cleanup ảnh nhà hàng", storageError);
    }
  }
  refresh(); return { ok: true, message: "Đã xóa ảnh nhà hàng." };
}

function validMoney(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100_000_000;
}

export async function saveOwnerFoodAction(
  restaurantId: string,
  input: OwnerFoodInput
): Promise<OwnerFoodActionResult> {
  if (!UUID.test(restaurantId) || (input.id && !UUID.test(input.id))) {
    return { ok: false, message: "Mã nhà hàng hoặc món ăn không hợp lệ." };
  }
  if (input.name.trim().length < 2 || input.name.trim().length > 120 ||
      input.description.trim().length > 1000 || !validMoney(input.basePrice)) {
    return { ok: false, message: "Tên, mô tả hoặc giá bán chưa hợp lệ." };
  }
  if (!UUID.test(input.categoryId) || input.tagIds.length > 20 ||
      input.tagIds.some((id) => !UUID.test(id))) {
    return { ok: false, message: "Hãy chọn một category và danh sách tag hợp lệ." };
  }
  if (input.sizes.length > 20 || input.sizes.some((size) =>
    (size.id && !UUID.test(size.id)) || !size.name.trim() || !validMoney(size.price))) {
    return { ok: false, message: "Danh sách size chưa hợp lệ." };
  }
  if (input.isAvailable && input.sizes.length > 0 &&
      !input.sizes.some((size) => size.isAvailable)) {
    return { ok: false, message: "Món có size phải có ít nhất một size còn hàng." };
  }
  if (input.toppingGroups.length > 20 || input.toppingGroups.some((group) =>
    (group.id && !UUID.test(group.id)) || !group.name.trim() || group.minSelect < 0 ||
    group.maxSelect < 1 || group.minSelect > group.maxSelect || group.toppings.length > 50 ||
    group.toppings.some((item) => (item.id && !UUID.test(item.id)) ||
      !item.name.trim() || !validMoney(item.price)) ||
    (group.isAvailable && group.toppings.filter((item) => item.isAvailable).length < group.minSelect)
  )) {
    return { ok: false, message: "Nhóm topping, giới hạn chọn hoặc giá topping chưa hợp lệ." };
  }

  const payload = {
    expected_updated_at: input.expectedUpdatedAt || null,
    name: input.name.trim(), description: input.description.trim(),
    base_price: input.basePrice, is_available: input.isAvailable,
    category_id: input.categoryId, tag_ids: [...new Set(input.tagIds)],
    sizes: input.sizes.map((size, index) => ({ id: size.id || null,
      name: size.name.trim(), price: size.price, is_available: size.isAvailable,
      display_order: index * 10 })),
    topping_groups: input.toppingGroups.map((group, groupIndex) => ({
      id: group.id || null, name: group.name.trim(), description: group.description.trim(),
      min_select: group.minSelect, max_select: group.maxSelect,
      is_available: group.isAvailable, display_order: groupIndex * 10,
      toppings: group.toppings.map((item, itemIndex) => ({ id: item.id || null,
        name: item.name.trim(), price: item.price, is_available: item.isAvailable,
        display_order: itemIndex * 10 })),
    })),
  };
  const supabase = await authorized();
  const { data, error } = await supabase.rpc("api_upsert_owner_food", {
    p_restaurant_id: restaurantId, p_food_id: input.id || null, p_payload: payload,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu món ăn.") };
  const foodId = data && typeof data === "object" && "food_id" in data &&
    typeof data.food_id === "string" ? data.food_id : input.id;
  if (!foodId) return { ok: false, message: "Đã lưu nhưng chưa nhận được mã món ăn." };
  refresh();
  return { ok: true, message: input.id ? "Đã cập nhật món ăn." : "Đã tạo món mới ở trạng thái ẩn.", foodId };
}

export async function setOwnerFoodStateAction(
  foodId: string,
  isPublic: boolean,
  isAvailable: boolean
): Promise<OwnerActionResult> {
  if (!UUID.test(foodId)) return { ok: false, message: "Mã món ăn không hợp lệ." };
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_set_owner_food_state", {
    p_food_id: foodId, p_is_public: isPublic, p_is_available: isAvailable,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể đổi trạng thái món.") };
  refresh(); return { ok: true, message: "Đã cập nhật trạng thái món." };
}

export async function reorderOwnerFoodsAction(
  restaurantId: string,
  items: Array<{ id: string; displayOrder: number }>
): Promise<OwnerActionResult> {
  if (!UUID.test(restaurantId) || items.length > 500 || items.some((item) =>
    !UUID.test(item.id) || !Number.isInteger(item.displayOrder) || item.displayOrder < 0)) {
    return { ok: false, message: "Danh sách sắp xếp không hợp lệ." };
  }
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_reorder_owner_foods", {
    p_restaurant_id: restaurantId,
    p_items: items.map((item) => ({ id: item.id, display_order: item.displayOrder })),
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu thứ tự menu.") };
  refresh(); return { ok: true, message: "Đã lưu thứ tự menu." };
}

export async function applyFoodImageAction(
  foodId: string,
  objectPath: string,
  altText: string
): Promise<OwnerActionResult> {
  if (!UUID.test(foodId) || objectPath.includes("..") ||
      !objectPath.includes(`/foods/${foodId}/`) ||
      !/\.(?:jpg|jpeg|png|webp|avif)$/i.test(objectPath)) {
    return { ok: false, message: "Thông tin ảnh món không hợp lệ." };
  }
  const supabase = await authorized();
  const publicUrl = supabase.storage.from(FOOD_BUCKET).getPublicUrl(objectPath).data.publicUrl;
  const { data, error } = await supabase.rpc("api_replace_food_primary_image", {
    p_food_id: foodId, p_object_path: objectPath, p_url: publicUrl,
    p_alt_text: altText.trim() || null,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu ảnh món.") };
  const oldPaths = data && typeof data === "object" && "old_object_paths" in data &&
    Array.isArray(data.old_object_paths) ? (data.old_object_paths as unknown[]).filter((item: unknown): item is string =>
      typeof item === "string" && item !== objectPath) : [];
  if (oldPaths.length) {
    try {
      const { error: storageError } = await createAdminClient().storage.from(FOOD_BUCKET).remove(oldPaths);
      if (storageError) console.error("[owner] Chưa xóa được ảnh món cũ", storageError);
    } catch (storageError) { console.error("[owner] Chưa xóa được ảnh món cũ", storageError); }
  }
  refresh(); return { ok: true, message: "Đã cập nhật ảnh chính của món." };
}

export async function deleteFoodImageAction(imageId: string): Promise<OwnerActionResult> {
  if (!UUID.test(imageId)) return { ok: false, message: "Mã ảnh món không hợp lệ." };
  const supabase = await authorized();
  const { data, error } = await supabase.rpc("api_delete_food_image", { p_image_id: imageId });
  if (error) return { ok: false, message: errorMessage(error, "Không thể xóa ảnh món.") };
  const objectPath = data && typeof data === "object" && "object_path" in data &&
    typeof data.object_path === "string" ? data.object_path : null;
  if (objectPath) {
    try {
      const { error: storageError } = await createAdminClient().storage.from(FOOD_BUCKET).remove([objectPath]);
      if (storageError) console.error("[owner] Đã xóa metadata nhưng chưa xóa được ảnh món", storageError);
    } catch (storageError) { console.error("[owner] Đã xóa metadata nhưng chưa xóa được ảnh món", storageError); }
  }
  refresh(); return { ok: true, message: "Đã xóa ảnh và ẩn món khỏi khách hàng." };
}

export async function createFoodImageUploadTicketAction(
  foodId: string,
  mimeType: string
): Promise<ImageUploadTicketResult> {
  if (!UUID.test(foodId) || !FOOD_IMAGE_TYPES[mimeType]) {
    return { ok: false, message: "Mã món hoặc định dạng ảnh không hợp lệ." };
  }
  const supabase = await authorized();
  const { data: food, error: foodError } = await supabase.from("foods")
    .select("restaurant_id").eq("id", foodId).maybeSingle();
  if (foodError || !food?.restaurant_id || !UUID.test(food.restaurant_id)) {
    return { ok: false, message: "Không tìm thấy món hoặc bạn không có quyền tải ảnh." };
  }
  const objectPath = `restaurants/${food.restaurant_id}/foods/${foodId}/${crypto.randomUUID()}.${FOOD_IMAGE_TYPES[mimeType]}`;
  try {
    const { data, error } = await createAdminClient().storage.from(FOOD_BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error || !data?.token) {
      console.error("[owner] Không thể tạo vé upload ảnh món", error);
      return { ok: false, message: "Không thể khởi tạo phiên tải ảnh. Hãy thử lại." };
    }
    return { ok: true, objectPath, token: data.token };
  } catch (error) {
    console.error("[owner] Storage service chưa sẵn sàng", error);
    return { ok: false, message: "Máy chủ chưa cấu hình dịch vụ tải ảnh." };
  }
}

export async function discardFoodImageUploadAction(
  foodId: string,
  objectPath: string
): Promise<void> {
  if (!UUID.test(foodId) || !objectPath.includes(`/foods/${foodId}/`)) return;
  const supabase = await authorized();
  const { data: food } = await supabase.from("foods").select("restaurant_id")
    .eq("id", foodId).maybeSingle();
  if (!food?.restaurant_id || objectPath.indexOf(`restaurants/${food.restaurant_id}/foods/${foodId}/`) !== 0) return;
  try {
    const { error } = await createAdminClient().storage.from(FOOD_BUCKET).remove([objectPath]);
    if (error) console.error("[owner] Chưa dọn được ảnh món chưa gắn metadata", error);
  } catch (error) { console.error("[owner] Chưa dọn được ảnh món chưa gắn metadata", error); }
}

export async function saveOwnerVoucherAction(
  restaurantId: string,
  input: VoucherSaveInput
): Promise<VoucherActionResult> {
  if (!UUID.test(restaurantId)) return { ok: false, message: "Mã nhà hàng không hợp lệ." };
  const cleaned = voucherPayload(input, true);
  if ("error" in cleaned) return { ok: false, message: cleaned.error };
  const supabase = await authorized();
  const { data, error } = await supabase.rpc("api_owner_save_voucher_v2", {
    p_restaurant_id: restaurantId, p_payload: cleaned.payload,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể lưu voucher nhà hàng.") };
  updateTag("vouchers"); refresh(); revalidatePath("/vouchers"); revalidatePath("/checkout");
  return { ok: true, message: input.id ? "Đã cập nhật voucher." : "Đã tạo voucher nhà hàng.", voucherId: String(data) };
}

export async function setOwnerVoucherStatusAction(
  restaurantId: string,
  voucherId: string,
  status: VoucherStoredStatus
): Promise<VoucherActionResult> {
  if (!UUID.test(restaurantId) || !UUID.test(voucherId) ||
      !["draft", "active", "paused", "archived"].includes(status)) {
    return { ok: false, message: "Voucher hoặc trạng thái không hợp lệ." };
  }
  const supabase = await authorized();
  const { error } = await supabase.rpc("api_set_voucher_status", {
    p_voucher_id: voucherId, p_status: status,
  });
  if (error) return { ok: false, message: errorMessage(error, "Không thể đổi trạng thái voucher.") };
  updateTag("vouchers"); refresh(); revalidatePath("/vouchers"); revalidatePath("/checkout");
  return { ok: true, message: status === "active" ? "Voucher đã hoạt động." : status === "paused" ? "Đã tạm dừng voucher." : status === "archived" ? "Đã lưu trữ voucher." : "Đã chuyển voucher về bản nháp." };
}
