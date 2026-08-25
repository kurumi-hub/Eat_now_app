"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { confirmShipperPickupAction, transitionOwnerOrderAction } from "@/app/owner/actions";
import type { OwnerActionResult, OwnerOrderItem, OwnerOrderList } from "@/types/owner";
import { createClient } from "@/utils/supabase/client";

const STATUS: Record<string, string> = { pending: "Đơn mới", confirmed: "Đã nhận", preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng giao", delivering: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };
const DELIVERY: Record<string, string> = { unassigned: "Chưa tìm tài xế", searching: "Đang tìm tài xế",
  assigned: "Đã gán tài xế", arrived_at_restaurant: "Tài xế đã đến", picked_up: "Đã lấy món",
  delivering: "Đang giao", proof_submitted: "Chờ khách xác nhận", delivery_review: "Đang tranh chấp",
  delivered: "Đã giao", cancelled: "Đã hủy", failed: "Giao thất bại" };
const FILTERS = [["all", "Tất cả"], ["new", "Đơn mới"], ["active", "Đang xử lý"],
  ["ready", "Sẵn sàng"], ["delivering", "Đang giao"], ["incident", "Có sự cố"],
  ["completed", "Hoàn thành"], ["cancelled", "Đã hủy"]] as const;
function money(value: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value); }
function time(value?: string) { return value ? new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—"; }
function searchDeadline(item: OwnerOrderItem) {
  const acceptedAt = item.events.find((event) => event.toOrderStatus === "confirmed")?.createdAt;
  if (!acceptedAt) return undefined;
  const value = new Date(acceptedAt).getTime() + 30 * 60 * 1000;
  return Number.isFinite(value) ? new Date(value).toISOString() : undefined;
}

type PickupFeedback = {
  orderId: string;
  state: "pending" | "success" | "error";
  message: string;
};

export default function OwnerOrderConsole({ restaurantId, data, canReject }: { restaurantId: string; data: OwnerOrderList; canReject: boolean }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all"); const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<OwnerActionResult | null>(null); const [sound, setSound] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState("");
  const [pickupFeedback, setPickupFeedback] = useState<PickupFeedback | null>(null);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`restaurant-orders-${restaurantId}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "order_events", filter: `restaurant_id=eq.${restaurantId}`,
    }, () => {
      if (sound) { const audio = new AudioContext(); const oscillator = audio.createOscillator();
        oscillator.connect(audio.destination); oscillator.frequency.value = 880; oscillator.start(); oscillator.stop(audio.currentTime + .12); }
      router.refresh();
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [restaurantId, router, sound]);
  const items = useMemo(() => data.items.filter((item) => {
    const matchesSearch = !search.trim() || `${item.code} ${item.receiverName} ${item.receiverPhone}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesFilter = filter === "all" || filter === "new" && item.status === "pending" ||
      filter === "active" && ["confirmed", "preparing", "ready", "delivering"].includes(item.status) ||
      filter === "incident" && item.incidentStatus === "open" || item.status === filter || item.deliveryStatus === filter;
    return matchesSearch && matchesFilter;
  }), [data.items, filter, search]);
  const run = (item: OwnerOrderItem, action: "accept" | "reject" | "start_preparing" | "ready") => {
    let reason = ""; let etaMinutes: number | undefined;
    if (action === "accept") { const raw = window.prompt("Thời gian chuẩn bị dự kiến sau khi có tài xế (phút):", "25"); if (!raw) return; etaMinutes = Number(raw); }
    if (action === "reject") { reason = window.prompt("Lý do từ chối đơn (ít nhất 5 ký tự):") || ""; if (!reason) return; }
    startTransition(async () => { const result = await transitionOwnerOrderAction({ restaurantId, orderId: item.id,
      action, reason, etaMinutes, expectedVersion: item.version }); setNotice(result); if (result.ok) router.refresh(); });
  };
  const confirmPickup = (item: OwnerOrderItem) => {
    if (pending || confirmingOrderId) return;
    setConfirmingOrderId(item.id);
    setPickupFeedback({ orderId: item.id, state: "pending", message: "Đang xác nhận bàn giao món…" });
    startTransition(async () => {
      try {
        const result = await confirmShipperPickupAction({
          restaurantId, orderId: item.id, expectedVersion: item.version,
        });
        setNotice(result);
        setPickupFeedback({
          orderId: item.id,
          state: result.ok ? "success" : "error",
          message: result.message,
        });
        if (result.ok) router.refresh();
      } catch (error) {
        console.error("[owner] Không thể gọi thao tác xác nhận bàn giao", error);
        const result: OwnerActionResult = {
          ok: false,
          message: "Kết nối tới máy chủ bị gián đoạn. Hãy tải lại trang và thử xác nhận lần nữa.",
        };
        setNotice(result);
        setPickupFeedback({ orderId: item.id, state: "error", message: result.message });
      } finally {
        setConfirmingOrderId("");
      }
    });
  };
  return <section className="owner-orders">
    <div className="owner-orders__heading"><div><p>Điều hành theo thời gian thực</p><h2>Đơn hàng nhà hàng</h2><span>{data.total} đơn · thao tác được khóa phiên bản để tránh xử lý trùng</span></div><button type="button" className={sound ? "is-on" : ""} onClick={() => setSound((value) => !value)}>{sound ? "Âm báo đang bật" : "Bật âm báo"}</button></div>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`}><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)}>×</button></div>}
    <div className="owner-orders__tools"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, khách hoặc số điện thoại"/><div>{FILTERS.map(([value,label]) => <button type="button" key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    <div className="owner-order-list">{items.length ? items.map((item) => <article key={item.id} className={`owner-order-card${item.incidentStatus === "open" ? " has-incident" : ""}`}>
      <header><div><span>{item.code}</span><h3>{item.receiverName}</h3><small>{time(item.createdAt)} · {item.receiverPhone}</small></div><div><b>{STATUS[item.status] || item.status}</b><em>{DELIVERY[item.deliveryStatus] || item.deliveryStatus}</em></div></header>
      {item.incidentStatus === "open" && <div className="owner-order-incident"><strong>Cần hỗ trợ</strong><span>{item.incidentReason || "Đơn đang được Admin kiểm tra."}</span></div>}
      {item.deliveryStatus === "arrived_at_restaurant" && item.pickupConfirmationRequestedAt && <div className="owner-order-pickup"><strong>Tài xế đang chờ xác nhận lấy món</strong><span>Kiểm tra đúng tài xế và biển số trước khi xác nhận bàn giao.</span></div>}
      <div className="owner-order-card__body"><div><h4>Món ăn</h4>{item.items.map((food,index) => <p key={`${food.name}-${index}`}><strong>{food.quantity}× {food.name}{food.size ? ` · ${food.size}` : ""}</strong><span>{money(food.lineTotal)}</span>{food.note && <small>{food.note}</small>}</p>)}</div><dl><div><dt>Giao đến</dt><dd>{item.deliveryAddress}</dd></div><div><dt>Thanh toán</dt><dd>{item.payment.method.toUpperCase()} · {item.payment.status}</dd></div><div><dt>Tổng tiền</dt><dd>{money(item.totalPrice)}</dd></div>{item.status === "pending" && item.responseDueAt && <div><dt>Phản hồi trước</dt><dd>{time(item.responseDueAt)}</dd></div>}{item.status === "confirmed" && !item.shipper && <div><dt>Thời hạn tìm tài xế</dt><dd>{time(searchDeadline(item))}</dd></div>}{item.shipper && <div><dt>Tài xế</dt><dd>{item.shipper.name} · {item.shipper.plateNumber}</dd></div>}{item.preparationDueAt && <div><dt>Dự kiến xong</dt><dd>{time(item.preparationDueAt)}</dd></div>}</dl></div>
      {item.note && <blockquote>Ghi chú khách: {item.note}</blockquote>}
      <details><summary>Lịch sử trạng thái ({item.events.length})</summary><ol>{item.events.map((event) => <li key={event.id}><span>{event.toOrderStatus || event.toDeliveryStatus || event.eventType}</span><small>{event.source} · {time(event.createdAt)}{event.note ? ` · ${event.note}` : ""}</small></li>)}</ol></details>
      {pickupFeedback?.orderId === item.id && <div className={`owner-order-pickup-feedback is-${pickupFeedback.state}`} role="status" aria-live="polite">{pickupFeedback.message}</div>}
      <footer>{item.status === "pending" && <><button type="button" disabled={pending} onClick={() => run(item,"accept")}>Nhận đơn</button>{canReject && <button type="button" className="is-danger" disabled={pending} onClick={() => run(item,"reject")}>Từ chối</button>}</>}{item.status === "confirmed" && <button type="button" disabled={pending || !item.shipper || !["assigned", "arrived_at_restaurant"].includes(item.deliveryStatus)} onClick={() => run(item,"start_preparing")}>{item.shipper ? "Bắt đầu chuẩn bị" : "Đang tìm tài xế · tối đa 30 phút"}</button>}{item.status === "preparing" && <button type="button" disabled={pending || !item.shipper} onClick={() => run(item,"ready")}>{item.shipper ? "Món đã sẵn sàng" : "Đang tìm tài xế thay thế"}</button>}{item.status === "ready" && item.deliveryStatus === "arrived_at_restaurant" && item.pickupConfirmationRequestedAt && <button type="button" className="is-primary" disabled={pending || confirmingOrderId === item.id} onClick={() => confirmPickup(item)}>{confirmingOrderId === item.id ? "Đang xác nhận…" : "Xác nhận đã giao món cho tài xế"}</button>}</footer>
    </article>) : <div className="owner-menu-empty"><strong>Không có đơn phù hợp</strong><span>Thử chọn bộ lọc khác.</span></div>}</div>
  </section>;
}
