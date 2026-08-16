"use server";

import { revalidatePath } from "next/cache";

import type { AccountAddress, AddressFormValues } from "@/types/account";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { validateAddressValues, type AddressField } from "@/utils/validation";
import {
  distanceKm,
  geocodeAddress,
  isValidCoordinate,
} from "@/lib/geocoding";

export type AddressActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AddressField, string>>;
};

type AddressRow = {
  id: string;
  label: string | null;
  address: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  delivery_note: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  lat: number | null;
  lon: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function rowToAddress(row: AddressRow): AccountAddress {
  return {
    id: row.id,
    recipientName: row.recipient_name ?? "",
    phone: row.recipient_phone ?? "",
    line1: row.address,
    ward: row.ward ?? "",
    district: row.district ?? "",
    city: row.province ?? "",
    note: row.delivery_note ?? undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildFullAddress(values: AddressFormValues) {
  return [values.line1, values.ward, values.district, values.city]
    .filter(Boolean)
    .join(", ");
}

export async function listAddressesAction(): Promise<AccountAddress[]> {
  const user = await requireAnyRole(["CUSTOMER"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_addresses")
    .select(
      "id, label, address, recipient_name, recipient_phone, delivery_note, " +
        "ward, district, province, lat, lon, is_default, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("listAddressesAction error:", error?.message);
    return [];
  }

  return data.map(rowToAddress);
}

export async function createAddressAction(
  _prevState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const user = await requireAnyRole(["CUSTOMER"]);

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

  const validation = validateAddressValues(values);
  if (!validation.isValid) {
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại thông tin địa chỉ.",
      fieldErrors: validation.errors,
    };
  }

  const fullAddress = buildFullAddress(validation.normalized);

  let geo;
  try {
    geo = await geocodeAddress(fullAddress);
  } catch (err) {
    console.error("createAddressAction geocode error:", err);
    return {
      status: "error",
      message:
        "Không thể xác định vị trí địa chỉ này lúc này. Vui lòng thử lại.",
    };
  }

  if (!geo) {
    return {
      status: "error",
      message:
        "Không tìm thấy địa chỉ này trên bản đồ. Vui lòng kiểm tra lại địa chỉ.",
      fieldErrors: { line1: "Địa chỉ không xác định được vị trí." },
    };
  }

  let lat = geo.lat;
  let lon = geo.lon;
  if (selectedLatText || selectedLonText) {
    const selectedLat = Number(selectedLatText);
    const selectedLon = Number(selectedLonText);
    if (
      !selectedLatText ||
      !selectedLonText ||
      !isValidCoordinate(selectedLat, selectedLon)
    ) {
      return {
        status: "error",
        message: "Tọa độ được chọn trên bản đồ không hợp lệ.",
      };
    }

    // Không tin hoàn toàn lat/lon từ client vì nó quyết định phí giao hàng.
    // Cho phép kéo ghim quanh địa chỉ, nhưng chặn vị trí giả quá xa kết quả Google.
    if (distanceKm(geo.lat, geo.lon, selectedLat, selectedLon) > 3) {
      return {
        status: "error",
        message:
          "Vị trí ghim cách địa chỉ đã nhập quá xa. Hãy kiểm tra địa chỉ hoặc chọn lại ghim.",
        fieldErrors: { line1: "Ghim bản đồ phải nằm gần địa chỉ đã nhập." },
      };
    }
    lat = selectedLat;
    lon = selectedLon;
  }

  const supabase = await createClient();

  // Nếu đặt làm mặc định, bỏ cờ mặc định của địa chỉ cũ trước
  // (DB có unique index chỉ cho 1 địa chỉ mặc định/user).
  if (values.isDefault) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { error } = await supabase.from("user_addresses").insert({
    user_id: user.id,
    label,
    address: fullAddress,
    recipient_name: validation.normalized.recipientName,
    recipient_phone: validation.normalized.phone,
    delivery_note: validation.normalized.note || null,
    ward: validation.normalized.ward,
    district: validation.normalized.district,
    province: validation.normalized.city,
    lat,
    lon,
    is_default: values.isDefault ?? false,
  });

  if (error) {
    console.error("createAddressAction insert error:", error.message);
    return {
      status: "error",
      message: "Không thể lưu địa chỉ. Vui lòng thử lại.",
    };
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return { status: "success", message: "Đã lưu địa chỉ mới." };
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const user = await requireAnyRole(["CUSTOMER"]);
  const supabase = await createClient();

  await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<void> {
  const user = await requireAnyRole(["CUSTOMER"]);
  const supabase = await createClient();

  await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
