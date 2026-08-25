"use client";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { cancelPendingOrderAction } from "@/app/orders/actions";
import { customerOrderStatus } from "@/lib/data/customerOrders";
import type { PublicUser } from "@/types/auth";
import type { CustomerOrderList, CustomerOrderSummary } from "@/types/customerOrders";
import { createClient } from "@/utils/supabase/client";

type Filter = "all" | "active" | "completed" | "cancelled" | "issue";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang xử lý" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "issue", label: "Cần hỗ trợ" },
];

const PAYMENT_METHODS: Record<string, string> = {
  cod: "Tiền mặt (COD)", vnpay: "VNPay", momo: "MoMo", zalopay: "ZaloPay", card: "Thẻ ngân hàng",
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(value);
}

function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("vi-VN", {
    dateStyle: "medium", timeStyle: "short",
  });
}

function matchesFilter(order: CustomerOrderSummary, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "active") return !["completed", "cancelled"].includes(order.status)
    && !["delivery_review", "disputed", "failed"].includes(order.deliveryStatus);
  if (filter === "completed") return order.status === "completed";
  if (filter === "cancelled") return order.status === "cancelled";
  return ["delivery_review", "disputed", "failed"].includes(order.deliveryStatus);
}

export default function CustomerOrderHistoryPage({
  user, data, loadError, paymentNotice,
}: {
  user: PublicUser;
  data: CustomerOrderList;
  loadError?: string;
  paymentNotice?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(paymentNotice || loadError || "");
  const [cancellingId, setCancellingId] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`customer-orders-${user.id}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "notifications", filter: `receiver_id=eq.${user.id}`,
    }, () => router.refresh()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [router, user.id]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return data.items.filter((order) => matchesFilter(order, filter)
      && (!query || order.code.toLocaleLowerCase("vi").includes(query)
        || order.restaurant.name.toLocaleLowerCase("vi").includes(query)));
  }, [data.items, filter, search]);
  const cancelOrder = (order: CustomerOrderSummary) => {
    if (!window.confirm(`Hủy đơn #${order.code}? Nhà hàng chưa xác nhận nên bạn có thể hủy ngay.`)) return;
    setCancellingId(order.id);
    startTransition(async () => {
      const result = await cancelPendingOrderAction(order.id);
      setNotice(result.message);
      setCancellingId("");
      if (result.ok) router.refresh();
    });
  };

  return <div className="customer-orders-page">
    <main className="customer-orders-main">
      <header className="customer-orders-title">
        <div><span>Hành trình của bạn</span><h1>Đơn hàng của tôi</h1><p>Theo dõi đơn đang xử lý và xem lại lịch sử đặt món.</p></div>
        <Link href="/cart"><ReceiptLongOutlinedIcon fontSize="small" /> Giỏ hàng</Link>
      </header>
      {notice && <div className={`customer-orders-notice${loadError ? " is-error" : ""}`} role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}
      <div className="customer-orders-toolbar">
        <div className="customer-orders-filters">{FILTERS.map((item) => <button type="button" key={item.value} className={filter === item.value ? "is-active" : ""} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
        <label className="customer-orders-search"><SearchOutlinedIcon fontSize="small" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn hoặc nhà hàng..." /></label>
      </div>
      {visible.length ? <section className="customer-order-grid">{visible.map((order) => {
        const status = customerOrderStatus(order);
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return <article key={order.id} className="customer-order-card">
          <div className="customer-order-card__media">{order.restaurant.imageUrl ? <img src={order.restaurant.imageUrl} alt={order.restaurant.name} /> : <StorefrontOutlinedIcon />}</div>
          <div className="customer-order-card__content">
            <div className="customer-order-card__top"><span className={`customer-order-status is-${status.tone}`}>{status.label}</span><strong>{money(order.pricing.total)}</strong></div>
            <div><h2>{order.restaurant.name}</h2><p>#{order.code} · {date(order.createdAt)}</p></div>
            <p className="customer-order-card__items">{order.items.slice(0, 3).map((item) => `${item.quantity}× ${item.name}`).join(" · ")}{order.items.length > 3 ? ` · +${order.items.length - 3} món` : ""}</p>
            <div className="customer-order-card__meta"><span>{itemCount} món</span><span>{PAYMENT_METHODS[order.payment.method] || order.payment.method}</span></div>
            <div className="customer-order-card__actions">
              <div>{order.restaurant.slug && <Link className="is-secondary" href={`/restaurants/${order.restaurant.slug}`}>Xem chi tiết nhà hàng</Link>}</div>
              <div>{order.status === "pending" && <button type="button" className="is-danger" disabled={pending} onClick={() => cancelOrder(order)}>{cancellingId === order.id ? "Đang hủy..." : "Hủy đơn"}</button>}<Link className="is-primary" href={`/orders/${order.id}`}><LocalShippingOutlinedIcon fontSize="small" /> Theo dõi hành trình</Link></div>
            </div>
          </div>
        </article>;
      })}</section> : <section className="customer-orders-empty"><StorefrontOutlinedIcon /><h2>Không có đơn hàng phù hợp</h2><p>Thử chọn bộ lọc khác hoặc đặt món đầu tiên của bạn.</p><Link href="/">Khám phá nhà hàng</Link></section>}
    </main>
  </div>;
}
