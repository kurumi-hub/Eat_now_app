"use server";

import { cookies } from "next/headers";

import { getCurrentUserAddresses } from "@/lib/data/addresses";
import {
  DELIVERY_SELECTION_COOKIE,
  type DeliverySelection,
} from "@/lib/deliverySelection";
import { isValidCoordinate, reverseGeocode } from "@/lib/geocoding";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";

export type DeliverySelectionResult = {
  ok: boolean;
  message: string;
  selection?: DeliverySelection;
};

async function saveSelection(selection: DeliverySelection) {
  (await cookies()).set(
    DELIVERY_SELECTION_COOKIE,
    encodeURIComponent(JSON.stringify(selection)),
    { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 }
  );
}

export async function selectSavedDeliveryAddressAction(
  addressId: string
): Promise<DeliverySelectionResult> {
  const user = await getCurrentPublicUser();
  if (!user || !hasRole(user, "CUSTOMER")) {
    return { ok: false, message: "Vui lòng đăng nhập bằng tài khoản khách hàng." };
  }
  const address = (await getCurrentUserAddresses()).find((item) => item.id === addressId);
  if (!address) return { ok: false, message: "Địa chỉ này không còn tồn tại." };

  const selection: DeliverySelection = {
    kind: "saved",
    addressId: address.id,
    label: address.line1,
    lat: typeof address.lat === "number" ? address.lat : null,
    lon: typeof address.lon === "number" ? address.lon : null,
  };
  await saveSelection(selection);
  return { ok: true, message: "Đã đổi địa chỉ giao hàng.", selection };
}

export async function selectCurrentDeliveryLocationAction(
  lat: number,
  lon: number
): Promise<DeliverySelectionResult> {
  if (!isValidCoordinate(lat, lon)) {
    return { ok: false, message: "Tọa độ hiện tại không hợp lệ." };
  }
  try {
    const location = await reverseGeocode(lat, lon);
    if (!location) return { ok: false, message: "Không nhận diện được địa chỉ hiện tại." };
    const selection: DeliverySelection = {
      kind: "current",
      label: location.formattedAddress,
      lat,
      lon,
    };
    await saveSelection(selection);
    return { ok: true, message: "Đã dùng vị trí hiện tại để khám phá món ăn.", selection };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Không thể lấy địa chỉ hiện tại.",
    };
  }
}
