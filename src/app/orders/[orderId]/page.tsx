import { notFound } from "next/navigation";

import CustomerHeader from "@/components/home/CustomerHeader";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type OrderDetailRouteProps = {
  params: Promise<{ orderId: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ quán xác nhận",
  confirmed: "Quán đã nhận đơn",
  preparing: "Đang chuẩn bị món",
  ready: "Sẵn sàng giao",
  delivering: "Đang giao hàng",
  completed: "Đã giao thành công",
  cancelled: "Đã huỷ",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OrderDetailRoute({
  params,
}: OrderDetailRouteProps) {
  const { orderId } = await params;
  // Trang này bắt buộc đăng nhập vì hiển thị đơn hàng vừa đặt.
  const user = await requireCurrentUser();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `id, code, status, user_id, restaurant_id, delivery_address,
       receiver_name, receiver_phone, note, subtotal, shipping_fee,
       discount_amount, total_price, created_at,
       restaurants ( name ),
       order_items (
         id, food_name, size_name, unit_price, quantity, line_total, note,
         order_item_toppings ( topping_name, topping_price )
       )`
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("OrderDetailRoute error:", {
      message: error.message,
      code: error.code,
    });
  }

  // Không lộ đơn của người khác: chỉ hiện nếu là chủ đơn.
  if (!order || order.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="restaurant-detail-page">
      <CustomerHeader
        user={user}
        onPlaceholder={() => undefined}
        onSectionNavigate={() => undefined}
      />

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px 96px" }}>
        <p style={{ color: "var(--color-text-secondary, #6b7280)", marginBottom: 4 }}>
          Đơn hàng #{order.code}
        </p>
        <h1 style={{ marginTop: 0 }}>
          {STATUS_LABELS[order.status] ?? order.status}
        </h1>

        <p>
          Đặt tại <strong>{order.restaurants?.name ?? "Nhà hàng"}</strong>
        </p>

        <section style={{ marginTop: 24 }}>
          <h2>Món đã đặt</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {order.order_items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <div>
                  <strong>
                    {item.quantity} × {item.food_name}
                  </strong>
                  {item.size_name && <div>Size: {item.size_name}</div>}
                  {item.order_item_toppings.length > 0 && (
                    <div>
                      {item.order_item_toppings
                        .map((t) => t.topping_name)
                        .join(", ")}
                    </div>
                  )}
                  {item.note && <div>Ghi chú: {item.note}</div>}
                </div>
                <div>{formatCurrency(item.line_total)}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Giao đến</h2>
          <p>
            {order.receiver_name} · {order.receiver_phone}
          </p>
          <p>{order.delivery_address}</p>
          {order.note && <p>Ghi chú: {order.note}</p>}
        </section>

        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tạm tính</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Phí giao hàng</span>
            <span>{formatCurrency(order.shipping_fee)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Giảm giá</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            <span>Tổng cộng</span>
            <span>{formatCurrency(order.total_price)}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
