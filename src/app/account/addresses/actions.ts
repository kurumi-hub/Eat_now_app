"use server";

import { revalidatePath } from "next/cache";

import type { AccountAddress, AddressFormValues } from "@/types/account";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { validateAddressValues, type AddressField } from "@/utils/validation";
import { geocodeAddress } from "@/lib/geocoding";

export type AddressActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AddressField, string>>;
};

type AddressRow = {
  id: string;
  label: string | null;
  address: string;
  lat: number | null;
  lon: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function rowToAddress(row: AddressRow): AccountAddress {
  // Bảng DB chỉ lưu 1 cột "address" gộp sẵn -- UI vẫn hiển thị theo dòng đầy đủ,
  // các field line1/ward/district/city chỉ tồn tại ở tầng form nhập liệu.
  return {
    id: row.id,
    recipientName: "",
    phone: "",
    line1: row.address,
    ward: "",
    district: "",
    city: "",
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
    .select("id, label, address, lat, lon, is_default, created_at, updated_at")
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
    lat: geo.lat,
    lon: geo.lon,
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
