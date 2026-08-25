"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import SiteFooter from "@/components/common/SiteFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import CustomerDeliveryPanel, { type CustomerDeliveryData } from "@/components/order/CustomerDeliveryPanel";
import { customerOrderStatus } from "@/lib/data/customerOrders";
import type { PublicUser } from "@/types/auth";
import type { CustomerOrderJourney } from "@/types/customerOrders";

export type CustomerOrderDetailView = {
  id: string;
  code: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  restaurant: { id: string; name: string; address: string; phone?: string; imageUrl?: string };
  shipper: { name: string; phone?: string; vehicle?: string; plate?: string } | null;
  delivery: { address: string; receiver: string; phone: string; note?: string };
  items: Array<{
    id: string; foodId?: string; name: string; size?: string; quantity: number;
    unitPrice: number; lineTotal: number; note?: string; imageUrl?: string;
    toppings: Array<{ name: string; price: number }>;
  }>;
  payment: { method: string; status: string; paidAt?: string } | null;
  pricing: {
    subtotal: number; shippingFee: number; packagingFee: number; serviceFee: number;
    smallOrderFee: number; paymentFee: number; otherFee: number; taxAmount: number;
    tipAmount: number; discount: number; total: number;
  };
  voucherCharges: Array<{ code: string; name: string; amount: number }>;
};

const PAYMENT_METHODS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)", vnpay: "VNPay", momo: "Ví MoMo",
  zalopay: "ZaloPay", card: "Thẻ ngân hàng",
};
const PAYMENT_STATUSES: Record<string, string> = {
  pending: "Chờ thanh toán", success: "Đã thanh toán", failed: "Thanh toán thất bại", refunded: "Đã hoàn tiền",
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(value);
}

function time(value?: string) {
  if (!value) return "Chưa đến bước này";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("vi-VN", {
    dateStyle: "short", timeStyle: "short",
  });
}

function stages(journey: CustomerOrderJourney) {
  const deliveryStarted = ["delivering", "proof_submitted", "awaiting_customer_confirmation", "delivery_review", "disputed", "delivered"].includes(journey.deliveryStatus);
  return [
    { id: "placed", title: "Đã đặt hàng", description: "EatNow đã ghi nhận đơn hàng.", at: journey.createdAt, reached: true },
    { id: "accepted", title: "Nhà hàng xác nhận", description: "Nhà hàng đã tiếp nhận đơn.", at: journey.acceptedAt, reached: Boolean(journey.acceptedAt) },
    { id: "preparing", title: "Đang chuẩn bị món", description: "Bếp đang chuẩn bị các món trong đơn.", at: journey.preparingAt, reached: Boolean(journey.preparingAt) },
    { id: "ready", title: "Món đã sẵn sàng", description: "Đơn đang chờ tài xế nhận món.", at: journey.readyAt, reached: Boolean(journey.readyAt) },
    { id: "assigned", title: "Tài xế nhận chuyến", description: "Tài xế đang di chuyển đến nhà hàng.", at: journey.shipperAssignedAt, reached: Boolean(journey.shipperAssignedAt) },
    { id: "picked", title: "Đã nhận món", description: "Nhà hàng đã xác nhận bàn giao món.", at: journey.pickupConfirmedAt || journey.pickedUpAt, reached: Boolean(journey.pickupConfirmedAt || journey.pickedUpAt) },
    { id: "delivering", title: "Đang giao đến bạn", description: "Tài xế đang di chuyển đến địa chỉ nhận hàng.", at: deliveryStarted ? journey.events.find((event) => event.toDeliveryStatus === "delivering")?.createdAt : undefined, reached: deliveryStarted },
    { id: "proof", title: "Chờ xác nhận nhận hàng", description: "Tài xế đã gửi ảnh giao hàng.", at: journey.proofSubmittedAt, reached: Boolean(journey.proofSubmittedAt) },
    { id: "completed", title: "Hoàn thành", description: "Bạn đã xác nhận nhận hàng thành công.", at: journey.deliveredAt, reached: Boolean(journey.deliveredAt || journey.status === "completed") },
  ];
}

function statusDescription(order: CustomerOrderDetailView) {
  if (["proof_submitted", "awaiting_customer_confirmation"].includes(order.deliveryStatus)) return "Tài xế đã gửi ảnh giao hàng. Hãy kiểm tra và xác nhận bên dưới.";
  if (["delivery_review", "disputed"].includes(order.deliveryStatus)) return "Phản hồi của bạn đã được ghi nhận và đang được EatNow xử lý.";
  if (order.status === "cancelled") return "Đơn hàng đã dừng. Xem lý do trong hành trình bên dưới.";
  if (order.status === "completed") return "Đơn đã được giao thành công. Cảm ơn bạn đã sử dụng EatNow.";
  if (order.deliveryStatus === "delivering") return "Tài xế đang trên đường giao món đến bạn.";
  return "Trạng thái được cập nhật tự động khi nhà hàng và tài xế xử lý đơn.";
}

export default function CustomerOrderDetailPage({
  user, order, journey, deliveryPanel,
}: {
  user: PublicUser;
  order: CustomerOrderDetailView;
  journey: CustomerOrderJourney;
  deliveryPanel: CustomerDeliveryData | null;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const presentation = customerOrderStatus({ status: order.status, deliveryStatus: order.deliveryStatus });
  const timeline = stages(journey);
  const lastReached = timeline.reduce((last, step, index) => step.reached ? index : last, 0);
  const extraFees = order.pricing.packagingFee + order.pricing.serviceFee + order.pricing.smallOrderFee
    + order.pricing.paymentFee + order.pricing.otherFee + order.pricing.taxAmount + order.pricing.tipAmount;
  const placeholder = (message: string) => setNotice(message);

  return <div className="customer-order-detail-page">
    <CustomerHeader user={user} onPlaceholder={placeholder} onSectionNavigate={(id) => router.push(`/#${id}`)} />
    <main className="customer-order-detail-main">
      <header className="customer-order-detail-title"><Link href="/orders" aria-label="Quay lại danh sách đơn"><ArrowBackOutlinedIcon /></Link><div><span>#{order.code}</span><h1>Hành trình đơn hàng</h1><p>Đặt lúc {time(order.createdAt)}</p></div></header>
      {notice && <div className="customer-orders-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}
      <div className="customer-order-detail-layout">
        <section className="customer-order-detail-content">
          <article className={`customer-order-hero is-${presentation.tone}`}>
            <div><span>Trạng thái hiện tại</span><h2>{presentation.label}</h2><p>{statusDescription(order)}</p></div>
            {presentation.tone === "completed" ? <CheckCircleOutlinedIcon /> : presentation.tone === "cancelled" || presentation.tone === "issue" ? <ScheduleOutlinedIcon /> : <LocalShippingOutlinedIcon />}
          </article>
          <article className="customer-order-section">
            <div className="customer-order-section__heading"><div><span>Cập nhật theo thời gian thực</span><h2>Tiến trình xử lý</h2></div><ReceiptLongOutlinedIcon /></div>
            {order.status === "cancelled" && <div className="customer-order-cancel-reason"><strong>Đơn đã hủy</strong><span>{journey.cancelReason || journey.incidentReason || "Không có lý do chi tiết."}</span></div>}
            <div className="customer-order-timeline">{timeline.map((step, index) => <div key={step.id} className={`customer-order-timeline__step${step.reached ? " is-complete" : ""}${index === lastReached && order.status !== "completed" && order.status !== "cancelled" ? " is-current" : ""}`}><span>{step.reached ? <CheckCircleOutlinedIcon fontSize="small" /> : index === lastReached + 1 ? <ScheduleOutlinedIcon fontSize="small" /> : null}</span><div><h3>{step.title}</h3><p>{step.reached ? time(step.at) : step.description}</p></div></div>)}</div>
          </article>
          {deliveryPanel && order.shipper && <CustomerDeliveryPanel initial={deliveryPanel} />}
          <article className="customer-order-section">
            <div className="customer-order-section__heading"><div><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} món</span><h2>Món ăn đã đặt</h2></div><RestaurantOutlinedIcon /></div>
            <div className="customer-order-item-list">{order.items.map((item) => <div className="customer-order-item" key={item.id}><div className="customer-order-item__media">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <RestaurantOutlinedIcon />}</div><div><h3>{item.quantity}× {item.name}{item.size ? ` · ${item.size}` : ""}</h3>{item.toppings.length ? <p>{item.toppings.map((topping) => topping.name).join(", ")}</p> : null}{item.note && <small>Ghi chú: {item.note}</small>}</div><strong>{money(item.lineTotal)}</strong></div>)}</div>
          </article>
          {journey.events.length > 0 && <details className="customer-order-event-log"><summary>Nhật ký trạng thái chi tiết ({journey.events.length})</summary><ol>{journey.events.map((event) => <li key={event.id}><strong>{event.toDeliveryStatus || event.toOrderStatus || event.eventType}</strong><span>{time(event.createdAt)} · {event.source}{event.note ? ` · ${event.note}` : ""}</span></li>)}</ol></details>}
        </section>
        <aside className="customer-order-sidebar">
          <article className="customer-order-summary-card">
            <div className="customer-order-restaurant"><div className="customer-order-restaurant__media">{order.restaurant.imageUrl ? <img src={order.restaurant.imageUrl} alt={order.restaurant.name} /> : <StorefrontOutlinedIcon />}</div><div><span>Đặt tại</span><h2>{order.restaurant.name}</h2><p>{order.restaurant.address}</p></div></div>
            <div className="customer-order-price-rows"><div><span>Tạm tính</span><strong>{money(order.pricing.subtotal)}</strong></div><div><span>Phí giao hàng</span><strong>{money(order.pricing.shippingFee)}</strong></div>{extraFees > 0 && <div><span>Thuế và phụ phí</span><strong>{money(extraFees)}</strong></div>}{order.voucherCharges.map((charge) => <div className="is-discount" key={`${charge.code}-${charge.name}`}><span>{charge.name} · {charge.code}</span><strong>-{money(Math.abs(charge.amount))}</strong></div>)}{order.pricing.discount > 0 && order.voucherCharges.length === 0 && <div className="is-discount"><span>Giảm giá</span><strong>-{money(order.pricing.discount)}</strong></div>}</div>
            <div className="customer-order-total"><span>Tổng thanh toán</span><strong>{money(order.pricing.total)}</strong></div>
            {order.payment && <div className="customer-order-payment"><PaymentsOutlinedIcon /><div><strong>{PAYMENT_METHODS[order.payment.method] || order.payment.method}</strong><span>{PAYMENT_STATUSES[order.payment.status] || order.payment.status}{order.payment.paidAt ? ` · ${time(order.payment.paidAt)}` : ""}</span></div></div>}
          </article>
          <article className="customer-order-side-card"><h2><LocationOnOutlinedIcon fontSize="small" /> Giao hàng đến</h2><strong>{order.delivery.receiver} · {order.delivery.phone}</strong><p>{order.delivery.address}</p>{order.delivery.note && <blockquote>{order.delivery.note}</blockquote>}</article>
          {order.shipper && <article className="customer-order-side-card"><h2><LocalShippingOutlinedIcon fontSize="small" /> Tài xế</h2><strong>{order.shipper.name}</strong><p>{[order.shipper.vehicle, order.shipper.plate].filter(Boolean).join(" · ")}</p>{order.shipper.phone && <a href={`tel:${order.shipper.phone}`}>Gọi tài xế</a>}</article>}
          <Link className="customer-order-back-list" href="/orders"><ReceiptLongOutlinedIcon fontSize="small" /> Tất cả đơn hàng</Link>
        </aside>
      </div>
    </main>
    <SiteFooter onPlaceholder={placeholder} />
  </div>;
}
