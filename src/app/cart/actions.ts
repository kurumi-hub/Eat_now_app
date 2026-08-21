"use server";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const VIETNAMESE_MOBILE_REGEX = /^0(?:3|5|7|8|9)\d{8}$/;

// Phí ship tạm thời cố định vì UI chưa lấy toạ độ giao hàng thực tế.
// Khi có bản đồ/geocoding, thay bằng public.calc_shipping_fee(distance_km).
const FLAT_SHIPPING_FEE = 15000;

export type CreateOrderLineInput = {
  foodId: string;
  foodName: string;
  sizeId?: string;
  sizeName?: string;
  toppings: { id?: string; name: string; price: number }[];
  unitPrice: number;
  quantity: number;
  note?: string;
};

export type CreateOrderInput = {
  restaurantId: string;
  lines: CreateOrderLineInput[];
  deliveryAddress: string;
  receiverName: string;
  receiverPhone: string;
  note?: string;
};

export type CreateOrderResult =
  | { ok: true; orderId: string; orderCode: string }
  | { ok: false; error: string };

function validateInput(input: CreateOrderInput): string | null {
  if (!input.restaurantId) return "Thiếu thông tin nhà hàng.";
  if (!input.lines || input.lines.length === 0) return "Giỏ hàng đang trống.";
  if (!input.deliveryAddress?.trim()) return "Vui lòng nhập địa chỉ giao hàng.";
  if (!input.receiverName?.trim()) return "Vui lòng nhập tên người nhận.";
  if (!VIETNAMESE_MOBILE_REGEX.test(input.receiverPhone?.trim() ?? "")) {
    return "Số điện thoại người nhận không hợp lệ.";
  }
  return null;
}

/**
 * Tạo đơn hàng thật trong Supabase từ giỏ hàng phía client.
 * Chỉ được gọi ở bước xác nhận đặt đơn -- đây là nơi duy nhất bắt buộc đăng nhập.
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  // requireCurrentUser() redirect thẳng sang /login nếu chưa đăng nhập,
  // nên bản thân hàm server action này đã là lớp chắn phòng thủ cuối cùng
  // (kể cả nếu ai đó gọi trực tiếp action mà bỏ qua check ở UI).
  const user = await requireCurrentUser();

  const validationError = validateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const supabase = await createClient();

  const subtotal = input.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );
  const shippingFee = FLAT_SHIPPING_FEE;
  const discountAmount = 0;
  const totalPrice = subtotal + shippingFee - discountAmount;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      restaurant_id: input.restaurantId,
      status: "pending",
      delivery_address: input.deliveryAddress.trim(),
      receiver_name: input.receiverName.trim(),
      receiver_phone: input.receiverPhone.trim(),
      note: input.note?.trim() || null,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_price: totalPrice,
    })
    .select("id, code")
    .single();

  if (orderError || !order) {
    console.error("createOrder error:", {
      message: orderError?.message,
      code: orderError?.code,
      details: orderError?.details,
      hint: orderError?.hint,
    });
    return {
      ok: false,
      error: "Không thể tạo đơn hàng. Vui lòng thử lại.",
    };
  }

  for (const line of input.lines) {
    const lineTotal = line.unitPrice * line.quantity;

    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        food_id: line.foodId,
        food_name: line.foodName,
        size_name: line.sizeName ?? null,
        unit_price: line.unitPrice,
        quantity: line.quantity,
        line_total: lineTotal,
        note: line.note ?? null,
      })
      .select("id")
      .single();

    if (itemError || !orderItem) {
      console.error("createOrder order_items error:", {
        message: itemError?.message,
        code: itemError?.code,
      });
      // Đơn đã được tạo nhưng thiếu món -- báo lỗi để người dùng liên hệ hỗ trợ
      // thay vì âm thầm mất dữ liệu món ăn.
      return {
        ok: false,
        error:
          "Đơn hàng đã được ghi nhận một phần, vui lòng liên hệ hỗ trợ để được kiểm tra.",
      };
    }

    if (line.toppings.length > 0) {
      const { error: toppingsError } = await supabase
        .from("order_item_toppings")
        .insert(
          line.toppings.map((topping) => ({
            order_item_id: orderItem.id,
            topping_id: topping.id ?? null,
            topping_name: topping.name,
            topping_price: topping.price,
          }))
        );

      if (toppingsError) {
        console.error("createOrder order_item_toppings error:", {
          message: toppingsError.message,
          code: toppingsError.code,
        });
      }
    }
  }

  return { ok: true, orderId: order.id, orderCode: order.code };
}
