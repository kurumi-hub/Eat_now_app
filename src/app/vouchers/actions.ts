"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ClaimVoucherResult =
  | { ok: true; message: string; walletId: string }
  | { ok: false; message: string };

export async function claimVoucherAction(voucherId: string): Promise<ClaimVoucherResult> {
  await requireCurrentUser();
  if (!UUID.test(voucherId)) return { ok: false, message: "Voucher không hợp lệ." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_claim_voucher", {
    p_voucher_id: voucherId,
  });
  if (error) {
    console.error("claimVoucherAction error:", error.message);
    return { ok: false, message: error.message || "Không thể nhận voucher." };
  }
  const result = data as { wallet_id?: string; message?: string } | null;
  updateTag("vouchers");
  revalidatePath("/vouchers");
  revalidatePath("/checkout");
  return {
    ok: true,
    message: result?.message || "Đã lưu voucher vào kho.",
    walletId: result?.wallet_id || "",
  };
}
