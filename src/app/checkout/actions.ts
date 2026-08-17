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
 * Toàn bộ thao tác xoá giỏ cũ + thêm các dòng mới chạy trong một RPC/transaction.
 */
export async function syncCartToServer(
  lines: CartLine[]
): Promise<SyncCartResult> {
  await requireCurrentUser();

  if (lines.length === 0) {
    return { ok: false, error: "Giỏ hàng đang trống." };
  }

  const supabase = await createClient();

  const items = lines.map((line) => ({
    food_id: line.foodId,
    quantity: line.quantity,
    food_size_id: line.size?.id ?? null,
    topping_ids: line.toppings
      .map((topping) => topping.id)
      .filter((id): id is string => Boolean(id)),
    note: line.note ?? null,
  }));

  const { data, error } = await supabase.rpc("api_sync_cart", {
    p_items: items,
  });

  if (error) {
    console.error("syncCartToServer error:", error.message);
    return { ok: false, error: error.message };
  }

  const result = data as unknown as { cart_id?: string } | null;
  const cartId = result?.cart_id ?? null;

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

export type CheckoutVoucher = {
  id: string;
  code: string;
  name: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  discountScope: "items" | "shipping";
  expiredAt: string;
};

type CheckoutVoucherRow = {
  id: string;
  code: string;
  name: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order_value: number;
  discount_scope: "items" | "shipping";
  expired_at: string;
};

export type ListCheckoutVouchersResult =
  | { ok: true; vouchers: CheckoutVoucher[] }
  | { ok: false; error: string };

export async function listCheckoutVouchers(
  cartId: string
): Promise<ListCheckoutVouchersResult> {
  await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("api_list_checkout_vouchers", {
    p_cart_id: cartId,
  });

  if (error) {
    console.error("listCheckoutVouchers error:", error.message);
    return {
      ok: false,
      error: "Không thể tải voucher. Vui lòng thử lại.",
    };
  }

  const rows = (data ?? []) as unknown as CheckoutVoucherRow[];
  return {
    ok: true,
    vouchers: rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      discountType: row.discount_type,
      discountValue: Number(row.discount_value),
      maxDiscount:
        row.max_discount === null ? null : Number(row.max_discount),
      minOrderValue: Number(row.min_order_value),
      discountScope: row.discount_scope,
      expiredAt: row.expired_at,
    })),
  };
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
