import "server-only";

import { cookies } from "next/headers";

import type { AccountAddress } from "@/types/account";
import { isValidCoordinate } from "@/lib/geocoding";

export const DELIVERY_SELECTION_COOKIE = "eatnow-delivery-selection";

export type DeliverySelection =
  | { kind: "saved"; addressId: string; label: string; lat: number | null; lon: number | null }
  | { kind: "current"; label: string; lat: number; lon: number };

function savedSelection(address: AccountAddress): DeliverySelection {
  return {
    kind: "saved",
    addressId: address.id,
    label: address.line1,
    lat: typeof address.lat === "number" ? address.lat : null,
    lon: typeof address.lon === "number" ? address.lon : null,
  };
}

export async function getDeliverySelection(
  addresses: AccountAddress[]
): Promise<DeliverySelection | null> {
  const raw = (await cookies()).get(DELIVERY_SELECTION_COOKIE)?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
      if (parsed.kind === "saved" && typeof parsed.addressId === "string") {
        const address = addresses.find((item) => item.id === parsed.addressId);
        if (address) return savedSelection(address);
      }
      if (
        parsed.kind === "current" &&
        typeof parsed.label === "string" &&
        typeof parsed.lat === "number" &&
        typeof parsed.lon === "number" &&
        isValidCoordinate(parsed.lat, parsed.lon)
      ) {
        return { kind: "current", label: parsed.label.slice(0, 240), lat: parsed.lat, lon: parsed.lon };
      }
    } catch {
      // Cookie cũ hoặc không hợp lệ sẽ được thay bằng địa chỉ mặc định.
    }
  }

  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  return defaultAddress ? savedSelection(defaultAddress) : null;
}
