"use server";

import { revalidatePath } from "next/cache";

import type { AccountAddress, AddressFormValues } from "@/types/account";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { validateAddressValues, type AddressField } from "@/utils/validation";
import {
  distanceKm,
  geocodeAddress,
  geocodePlaceId,
  isValidCoordinate,
} from "@/lib/geocoding";

export type AddressActionState = {
  status: "idle" | "success" | "error";
  requestId?: string;
  addressId?: string;
  message?: string;
  fieldErrors?: Partial<Record<AddressField, string>>;
};

type AddressRpcError = {
  code?: string;
  message: string;
};

function buildFullAddress(values: AddressFormValues) {
  return [values.line1, values.ward, values.district, values.city]
    .filter(Boolean)
    .join(", ");
}

function isMissingCreateAddressV2(error: AddressRpcError) {
  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    (/api_create_address_v2/i.test(error.message) &&
      /(schema cache|could not find|does not exist)/i.test(error.message))
  );
}

function addressSaveErrorMessage(error: AddressRpcError) {
  if (error.code === "PGRST202" || error.code === "42883") {
    return "Cơ sở dữ liệu chưa có hàm lưu địa chỉ. Hãy chạy migration 10_fix_address_save.sql rồi thử lại.";
  }

  if (error.code === "42501") {
    return "Tài khoản chưa được cấp quyền lưu địa chỉ. Hãy chạy migration 10_fix_address_save.sql rồi thử lại.";
  }

  if (error.code === "23503") {
    return "Tài khoản chưa có hồ sơ tương ứng. Vui lòng đăng xuất, đăng nhập lại rồi thử lại.";
  }

  return "Không thể lưu địa chỉ. Vui lòng thử lại.";
}

export async function listAddressesAction(): Promise<AccountAddress[]> {
  return getCurrentUserAddresses();
}

export async function createAddressAction(
  _prevState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  await requireAnyRole(["CUSTOMER"]);

  const requestId = String(formData.get("requestId") || "");
  const fail = (
    message: string,
    fieldErrors?: Partial<Record<AddressField, string>>
  ): AddressActionState => ({
    status: "error",
    requestId,
    message,
    fieldErrors,
  });

  const values: AddressFormValues = {
    recipientName: String(formData.get("recipientName") || ""),
    phone: String(formData.get("phone") || ""),
    line1: String(formData.get("line1") || ""),
    ward: String(formData.get("ward") || ""),
    district: String(formData.get("district") || ""),
    city: String(formData.get("city") || ""),
    note: String(formData.get("note") || ""),
    isDefault: formData.get("isDefault") === "on",
  };
  const label = String(formData.get("label") || "").trim() || null;
  const selectedLatText = String(formData.get("lat") || "").trim();
  const selectedLonText = String(formData.get("lon") || "").trim();
  const googlePlaceId = String(formData.get("googlePlaceId") || "").trim();
  const formattedAddress = String(
    formData.get("formattedAddress") || ""
  ).trim();
  const addressDetail = String(formData.get("addressDetail") || "")
    .trim()
    .replace(/\s+/g, " ");

  const validation = validateAddressValues(values);
  if (!validation.isValid) {
    return fail(
      "Vui lòng kiểm tra lại thông tin địa chỉ.",
      validation.errors
    );
  }

  if (!selectedLatText || !selectedLonText || !formattedAddress) {
    return fail(
      "Hãy chọn địa chỉ trên Google Maps và xác nhận vị trí ghim trước khi lưu.",
      { line1: "Địa chỉ chưa được xác nhận trên bản đồ." }
    );
  }

  const selectedLat = Number(selectedLatText);
  const selectedLon = Number(selectedLonText);
  if (!isValidCoordinate(selectedLat, selectedLon)) {
    return fail("Tọa độ được chọn trên bản đồ không hợp lệ.");
  }

  const fullAddress = formattedAddress || buildFullAddress(validation.normalized);

  let geo;
  try {
    geo = googlePlaceId
      ? await geocodePlaceId(googlePlaceId)
      : await geocodeAddress(fullAddress);
  } catch (err) {
    console.error("createAddressAction geocode error:", err);
    const missingServerKey =
      err instanceof Error &&
      err.message.includes("GOOGLE_MAPS_SERVER_API_KEY");
    return fail(
      missingServerKey
        ? "Máy chủ chưa cấu hình GOOGLE_MAPS_SERVER_API_KEY nên chưa thể xác minh và lưu địa chỉ."
        : "Không thể xác định vị trí địa chỉ này lúc này. Vui lòng thử lại."
    );
  }

  if (!geo) {
    return fail(
      "Không tìm thấy địa chỉ này trên bản đồ. Vui lòng kiểm tra lại địa chỉ.",
      { line1: "Địa chỉ không xác định được vị trí." }
    );
  }

  // Không tin hoàn toàn lat/lon từ client vì nó quyết định phí giao hàng.
  if (distanceKm(geo.lat, geo.lon, selectedLat, selectedLon) > 1.5) {
    return fail(
      "Vị trí ghim cách địa chỉ Google quá xa. Hãy chọn lại địa chỉ hoặc ghim.",
      { line1: "Ghim bản đồ phải nằm gần địa chỉ đã chọn." }
    );
  }

  const supabase = await createClient();
  const deliveryAddress = [addressDetail, geo.formattedAddress || fullAddress]
    .filter(Boolean)
    .join(", ");

  const addressArgs = {
    p_label: label,
    p_address: deliveryAddress,
    p_recipient_name: validation.normalized.recipientName,
    p_recipient_phone: validation.normalized.phone,
    p_delivery_note: validation.normalized.note || null,
    p_ward: validation.normalized.ward || null,
    p_district: validation.normalized.district || null,
    p_province: validation.normalized.city || null,
    p_lat: selectedLat,
    p_lon: selectedLon,
    p_is_default: values.isDefault ?? false,
  };
  const result = await supabase.rpc("api_create_address_v2", {
    ...addressArgs,
    p_google_place_id: geo.placeId || googlePlaceId || null,
  });
  let { data, error } = result;

  // Cho phép deploy source trước migration 08/10 mà không làm gián đoạn lưu
  // địa chỉ. RPC v1 vẫn an toàn ở đây vì tọa độ đã được server xác minh ở trên.
  if (error && isMissingCreateAddressV2(error)) {
    console.warn(
      "api_create_address_v2 is unavailable; falling back to api_create_address"
    );
    const fallbackResult = await supabase.rpc("api_create_address", addressArgs);
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    console.error("createAddressAction insert error:", {
      code: error.code,
      message: error.message,
    });
    return fail(addressSaveErrorMessage(error));
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return {
    status: "success",
    requestId,
    addressId:
      typeof (data as { id?: unknown } | null)?.id === "string"
        ? ((data as { id: string }).id)
        : undefined,
    message: "Đã lưu địa chỉ mới.",
  };
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  await requireAnyRole(["CUSTOMER"]);
  const supabase = await createClient();

  const { error } = await supabase.rpc("api_delete_address", {
    p_address_id: addressId,
  });
  if (error) console.error("deleteAddressAction error:", error.message);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<void> {
  await requireAnyRole(["CUSTOMER"]);
  const supabase = await createClient();

  const { error } = await supabase.rpc("api_set_default_address", {
    p_address_id: addressId,
  });
  if (error) console.error("setDefaultAddressAction error:", error.message);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
