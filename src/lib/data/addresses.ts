import "server-only";

import { cache } from "react";

import type { AccountAddress } from "@/types/account";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

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
    lat: row.lat,
    lon: row.lon,
    note: row.delivery_note ?? undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Request-scoped address lookup. React cache prevents nested layouts/pages
 * from repeating the same role check and address RPC during one render.
 */
export const getCurrentUserAddresses = cache(
  async (): Promise<AccountAddress[]> => {
    await requireAnyRole(["CUSTOMER"]);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("api_list_addresses");

    if (error || !data) {
      console.error("getCurrentUserAddresses error:", error?.message);
      return [];
    }

    return ((data ?? []) as unknown as AddressRow[]).map(rowToAddress);
  }
);
