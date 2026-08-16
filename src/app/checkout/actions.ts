"use server";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import type { CartLine } from "@/store/cartStore";

export type SyncCartResult =
  | { ok: true; cartId: string }
  | { ok: false; error: string };

/**
 * Đồng bộ giỏ hàng đang giữ ở client (Zustand) lên bảng carts/cart_items
 * trong Supabase, để RPC place_order có thể tự chốt giá từ DB (không tin
 * đơn giá do client gửi lên).
 *
 * Chiến lược: xoá sạch cart hiện có của user (mọi nhà hàng), rồi gọi lại
 * add_to_cart cho từng dòng -- add_to_cart tự tạo cart theo nhà hàng và tự
 * validate món/size/topping còn khả dụng hay không.
 */
export async function syncCartToServer(
  lines: CartLine[]
): Promise<SyncCartResult> {
  const user = await requireCurrentUser();

  if (lines.length === 0) {
    return { ok: false, error: "Giỏ hàng đang trống." };
  }

  const supabase = await createClient();

  // Dọn cart cũ của user để tránh lẫn dữ liệu cũ / trùng dòng khi đồng bộ lại.
  const { error: clearError } = await supabase
    .from("carts")
    .delete()
    .eq("user_id", user.id);

  if (clearError) {
    console.error("syncCartToServer clear error:", clearError.message);
    return { ok: false, error: "Không thể chuẩn bị giỏ hàng. Vui lòng thử lại." };
  }

  let cartId: string | null = null;

  for (const line of lines) {
    const toppingIds = line.toppings
      .map((t) => t.id)
      .filter((id): id is string => Boolean(id));

    const { data, error } = await supabase.rpc("add_to_cart", {
      p_food_id: line.foodId,
      p_quantity: line.quantity,
      p_food_size_id: line.size?.id ?? null,
      p_topping_ids: toppingIds,
      p_note: line.note ?? null,
    });

    if (error) {
      console.error("syncCartToServer add_to_cart error:", error.message);
      return {
        ok: false,
        error: `Món "${line.foodName}" hiện không khả dụng: ${error.message}`,
      };
    }

    if (!cartId && data) {
      // add_to_cart trả về cart_item id, không phải cart id -- lấy cart_id
      // qua truy vấn nhỏ để dùng cho preview_order/place_order.
      const { data: itemRow } = await supabase
        .from("cart_items")
        .select("cart_id")
        .eq("id", data)
        .single();
      cartId = itemRow?.cart_id ?? null;
    }
  }

  if (!cartId) {
    return { ok: false, error: "Không thể tạo giỏ hàng. Vui lòng thử lại." };
  }

  return { ok: true, cartId };
}

export type PreviewOrderResult =
  | { ok: true; preview: Record<string, unknown> }
  | { ok: false; error: string };

export async function previewOrder(
  cartId: string,
  addressId: string,
  paymentMethod: "cod" | "vnpay",
  voucherCode?: string
): Promise<PreviewOrderResult> {
  await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("preview_order_v2", {
    p_cart_id: cartId,
    p_address_id: addressId,
    p_payment_method: paymentMethod,
    p_voucher_code: voucherCode || null,
  });

  if (error) {
    console.error("previewOrder error:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, preview: data };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderCode: string; totalPrice: number }
  | { ok: false; error: string };

export async function placeOrder(
  cartId: string,
  addressId: string,
  paymentMethod: "cod" | "vnpay",
  note?: string,
  voucherCode?: string
): Promise<PlaceOrderResult> {
  await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("place_order", {
    p_cart_id: cartId,
    p_address_id: addressId,
    p_payment_method: paymentMethod,
    p_note: note || null,
    p_voucher_code: voucherCode || null,
  });

  if (error) {
    console.error("placeOrder error:", error.message);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    orderId: data.order_id,
    orderCode: data.code,
    totalPrice: data.total_price,
  };
}
