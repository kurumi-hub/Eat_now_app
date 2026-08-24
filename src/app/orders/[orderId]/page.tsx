import { notFound } from "next/navigation";

import CustomerDeliveryPanel, { type CustomerDeliveryData } from "@/components/order/CustomerDeliveryPanel";
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  momo: "Ví MoMo",
  vnpay: "VNPay",
  zalopay: "ZaloPay",
  card: "Thẻ ngân hàng",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  success: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// Kiểu dữ liệu trả về từ RPC get_order_detail -- khớp với jsonb_build_object
// trong 03_rpc.sql. Giữ optional ở những field có thể null (shipper chưa nhận,
// payment/timeline có thể rỗng) để tránh crash khi render.
type OrderDetail = {
  id: string;
  code: string;
  status: string;
  created_at: string;
  delivered_at: string | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
  };
  shipper: {
    id: string;
    name: string;
    phone: string | null;
    vehicle: string | null;
    plate: string | null;
    lat: number | null;
    lon: number | null;
  } | null;
  delivery: {
    address: string;
    receiver: string;
    phone: string;
    note: string | null;
    distance_km: number | null;
  };
  items: {
    name: string;
    size: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
    note: string | null;
    toppings: { name: string; price: number }[];
  }[];
  payment: {
    method: string;
    status: string;
    amount: number;
    paid_at: string | null;
  } | null;
  pricing: {
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total: number;
  };
  charges?: {
    type: string;
    code: string;
    name: string;
    amount: number;
  }[];
  timeline: {
    status: string;
    at: string;
    note: string | null;
  }[];
  can_review: boolean;
};

export default async function OrderDetailRoute({
  params,
}: OrderDetailRouteProps) {
  const { orderId } = await params;
  // Trang này bắt buộc đăng nhập vì hiển thị đơn hàng vừa đặt.
  await requireCurrentUser();
  const supabase = await createClient();

  // Dùng RPC get_order_detail thay vì truy vấn bảng trực tiếp:
  // RPC đã xử lý sẵn quyền xem (chủ đơn / chủ quán / shipper / admin), trả về
  // đúng shape object (không bị suy luận nhầm thành mảng như PostgREST join),
  // và có thêm dữ liệu shipper/payment/timeline mà query cũ không có.
  const { data, error } = await supabase.rpc("get_order_detail", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("get_order_detail error:", {
      message: error.message,
      code: error.code,
    });
    notFound();
  }

  const order = data as OrderDetail | null;

  if (!order) {
    notFound();
  }

  const voucherCharges = (order.charges ?? []).filter(
    (charge) => charge.type === "voucher_discount" && charge.amount < 0
  );

  const { data: deliveryRaw, error: deliveryError } = await supabase.rpc("api_get_customer_delivery", {
    p_order_id: orderId,
  });
  if (deliveryError) console.error("api_get_customer_delivery error:", deliveryError.message);
  const deliverySource = deliveryRaw && typeof deliveryRaw === "object" && !Array.isArray(deliveryRaw)
    ? deliveryRaw as Record<string, unknown> : {};
  const proofSource = deliverySource.proof && typeof deliverySource.proof === "object" && !Array.isArray(deliverySource.proof)
    ? deliverySource.proof as Record<string, unknown> : null;
  const locationSource = deliverySource.latest_location && typeof deliverySource.latest_location === "object" && !Array.isArray(deliverySource.latest_location)
    ? deliverySource.latest_location as Record<string, unknown> : null;
  let proofUrl: string | undefined;
  if (proofSource?.object_path && typeof proofSource.object_path === "string") {
    const { data: signed } = await supabase.storage.from("delivery-proof").createSignedUrl(proofSource.object_path, 600);
    proofUrl = signed?.signedUrl;
  }
  const deliveryPanel: CustomerDeliveryData | null = typeof deliverySource.delivery_status === "string" ? {
    orderId,
    deliveryStatus: deliverySource.delivery_status,
    canConfirm: deliverySource.can_confirm === true,
    proof: proofSource ? {
      note: typeof proofSource.note === "string" ? proofSource.note : undefined,
      status: String(proofSource.status || "submitted"),
      submittedAt: String(proofSource.submitted_at || ""),
    } : null,
    proofUrl,
    latestLocation: locationSource && Number.isFinite(Number(locationSource.lat)) && Number.isFinite(Number(locationSource.lon)) ? {
      lat: Number(locationSource.lat), lon: Number(locationSource.lon),
      accuracyM: locationSource.accuracy_m == null ? undefined : Number(locationSource.accuracy_m),
      recordedAt: String(locationSource.recorded_at || ""),
    } : null,
  } : null;

  return (
    <div className="restaurant-detail-page">
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px 96px" }}>
        <p style={{ color: "var(--color-text-secondary, #6b7280)", marginBottom: 4 }}>
          Đơn hàng #{order.code}
        </p>
        <h1 style={{ marginTop: 0 }}>
          {STATUS_LABELS[order.status] ?? order.status}
        </h1>

        <p>
          Đặt tại <strong>{order.restaurant?.name ?? "Nhà hàng"}</strong>
        </p>

        {order.payment && (
          <section
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background:
                order.payment.status === "success"
                  ? "#e8f5e9"
                  : order.payment.status === "failed"
                    ? "#fdecea"
                    : "#fff8e1",
            }}
          >
            <strong>
              {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
            </strong>
            {" · "}
            {PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}
            {order.payment.paid_at && (
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Thanh toán lúc {formatDateTime(order.payment.paid_at)}
              </div>
            )}
          </section>
        )}

        {order.shipper && (
          <section style={{ marginTop: 24 }}>
            <h2>Tài xế giao hàng</h2>
            <p>
              {order.shipper.name}
              {order.shipper.phone && ` · ${order.shipper.phone}`}
            </p>
            {(order.shipper.vehicle || order.shipper.plate) && (
              <p>
                {order.shipper.vehicle} {order.shipper.plate && `- ${order.shipper.plate}`}
              </p>
            )}
          </section>
        )}

        {deliveryPanel && order.shipper && <CustomerDeliveryPanel initial={deliveryPanel} />}

        <section style={{ marginTop: 24 }}>
          <h2>Món đã đặt</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <div>
                  <strong>
                    {item.quantity} × {item.name}
                  </strong>
                  {item.size && <div>Size: {item.size}</div>}
                  {item.toppings.length > 0 && (
                    <div>
                      {item.toppings.map((t) => t.name).join(", ")}
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
            {order.delivery.receiver} · {order.delivery.phone}
          </p>
          <p>{order.delivery.address}</p>
          {order.delivery.note && <p>Ghi chú: {order.delivery.note}</p>}
        </section>

        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tạm tính</span>
            <span>{formatCurrency(order.pricing.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Phí giao hàng</span>
            <span>{formatCurrency(order.pricing.shipping_fee)}</span>
          </div>
          {voucherCharges.map((charge) => (
            <div key={`${charge.code}-${charge.name}`} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{charge.name} · {charge.code}</span>
              <span>-{formatCurrency(Math.abs(charge.amount))}</span>
            </div>
          ))}
          {order.pricing.discount > 0 && voucherCharges.length === 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Giảm giá</span>
              <span>-{formatCurrency(order.pricing.discount)}</span>
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
            <span>{formatCurrency(order.pricing.total)}</span>
          </div>
        </section>

        {order.timeline.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2>Lịch sử đơn hàng</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.timeline.map((step, index) => (
                <div key={index} style={{ fontSize: 14 }}>
                  <strong>{STATUS_LABELS[step.status] ?? step.status}</strong>
                  {" — "}
                  {formatDateTime(step.at)}
                  {step.note && <div>{step.note}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
