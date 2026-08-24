"use server";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import type { CartLine } from "@/store/cartStore";

export type SyncCartResult =
  | { ok: true; cartId: string }
  | { ok: false; error: string };

function cartItems(lines: CartLine[]) {
  return lines.map((line) => ({
    food_id: line.foodId,
    quantity: line.quantity,
    food_size_id: line.size?.id ?? null,
    topping_ids: line.toppings
      .map((topping) => topping.id)
      .filter((id): id is string => Boolean(id)),
    note: line.note ?? null,
  }));
}

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

  const { data, error } = await supabase.rpc("api_sync_cart", {
    p_items: cartItems(lines),
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

export type VoucherSelection = {
  restaurant?: string;
  platform?: string;
  shipping?: string;
};

export async function previewOrder(
  cartId: string,
  addressId: string,
  paymentMethod: "cod" | "vnpay",
  voucherCodes: VoucherSelection = {}
): Promise<PreviewOrderResult> {
  await requireCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("preview_order_v3", {
    p_cart_id: cartId,
    p_address_id: addressId,
    p_payment_method: paymentMethod,
    p_restaurant_voucher_code: voucherCodes.restaurant || null,
    p_platform_voucher_code: voucherCodes.platform || null,
    p_shipping_voucher_code: voucherCodes.shipping || null,
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
  issuerType: "platform" | "restaurant";
  slot: "restaurant" | "platform" | "shipping";
  targetScope: "system" | "restaurant" | "category" | "food";
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
  issuer_type: "platform" | "restaurant";
  slot: "restaurant" | "platform" | "shipping";
  target_scope: "system" | "restaurant" | "category" | "food";
  expired_at: string;
};

function mapVoucherRows(data: unknown): CheckoutVoucher[] {
  const rows = (data ?? []) as unknown as CheckoutVoucherRow[];
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    maxDiscount: row.max_discount === null ? null : Number(row.max_discount),
    minOrderValue: Number(row.min_order_value),
    discountScope: row.discount_scope,
    issuerType: row.issuer_type,
    slot: row.slot,
    targetScope: row.target_scope,
    expiredAt: row.expired_at,
  }));
}

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

  return {
    ok: true,
    vouchers: mapVoucherRows(data),
  };
}

export type InitializeCheckoutResult =
  | {
      ok: true;
      cartId: string;
      vouchers: CheckoutVoucher[];
      preview: Record<string, unknown> | null;
      voucherError?: string;
      previewError?: string;
    }
  | { ok: false; error: string };

/**
 * Khởi tạo checkout trong một Server Action: chỉ xác thực một lần, đồng bộ
 * giỏ một lần, sau đó tải voucher và preview song song.
 */
export async function initializeCheckout(
  lines: CartLine[],
  addressId: string | null,
  paymentMethod: "cod" | "vnpay"
): Promise<InitializeCheckoutResult> {
  await requireCurrentUser();

  if (lines.length === 0) {
    return { ok: false, error: "Giỏ hàng đang trống." };
  }

  const supabase = await createClient();
  const syncResult = await supabase.rpc("api_sync_cart", {
    p_items: cartItems(lines),
  });

  if (syncResult.error) {
    console.error("initializeCheckout sync error:", syncResult.error.message);
    return { ok: false, error: syncResult.error.message };
  }

  const cartId = (syncResult.data as { cart_id?: string } | null)?.cart_id;
  if (!cartId) {
    return { ok: false, error: "Không thể tạo giỏ hàng. Vui lòng thử lại." };
  }

  const [voucherResult, previewResult] = await Promise.all([
    supabase.rpc("api_list_checkout_vouchers", { p_cart_id: cartId }),
    addressId
      ? supabase.rpc("preview_order_v3", {
          p_cart_id: cartId,
          p_address_id: addressId,
          p_payment_method: paymentMethod,
          p_restaurant_voucher_code: null,
          p_platform_voucher_code: null,
          p_shipping_voucher_code: null,
        })
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (voucherResult.error) {
    console.error(
      "initializeCheckout voucher error:",
      voucherResult.error.message
    );
  }
  if (previewResult.error) {
    console.error(
      "initializeCheckout preview error:",
      previewResult.error.message
    );
  }

  return {
    ok: true,
    cartId,
    vouchers: voucherResult.error ? [] : mapVoucherRows(voucherResult.data),
    preview: previewResult.error
      ? null
      : (previewResult.data as Record<string, unknown> | null),
    voucherError: voucherResult.error
      ? "Không thể tải voucher. Vui lòng thử lại."
      : undefined,
    previewError: previewResult.error
      ? previewResult.error.message
      : undefined,
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
  voucherCodes: VoucherSelection = {},
  idempotencyKey?: string
): Promise<PlaceOrderResult> {
  await requireCurrentUser();
  if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return { ok: false, error: "Phiên đặt hàng không hợp lệ. Vui lòng tải lại trang." };
  }
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("api_place_order_idempotent_v3", {
    p_idempotency_key: idempotencyKey,
    p_cart_id: cartId,
    p_address_id: addressId,
    p_payment_method: paymentMethod,
    p_note: note || null,
    p_restaurant_voucher_code: voucherCodes.restaurant || null,
    p_platform_voucher_code: voucherCodes.platform || null,
    p_shipping_voucher_code: voucherCodes.shipping || null,
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
