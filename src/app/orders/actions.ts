"use server";

import { revalidatePath } from "next/cache";

import type { ShipperActionResult } from "@/types/shipper";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function confirmDeliveryAction(orderId: string, received: boolean, reason = ""): Promise<ShipperActionResult> {
  await requireCurrentUser();
  if (!UUID.test(orderId) || (!received && (reason.trim().length < 5 || reason.trim().length > 500))) {
    return { ok: false, message: received ? "Mã đơn không hợp lệ." : "Vui lòng nhập lý do từ 5 đến 500 ký tự." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("api_customer_confirm_delivery", {
    p_order_id: orderId, p_received: received, p_reason: reason.trim() || null,
  });
  if (error) {
    if (["22023", "23514", "42501"].includes(error.code ?? "")) return { ok: false, message: error.message };
    console.error("[orders] confirm delivery failed", error);
    return { ok: false, message: "Không thể xác nhận giao hàng lúc này." };
  }
  revalidatePath(`/orders/${orderId}`); revalidatePath("/shipper");
  return { ok: true, message: received ? "Cảm ơn bạn đã xác nhận nhận hàng." : "Đã ghi nhận phản hồi và chuyển đơn sang xử lý." };
}
