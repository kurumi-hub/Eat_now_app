"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { confirmShipperPickupAction, transitionOwnerOrderAction } from "@/app/owner/actions";
import type { OwnerActionResult, OwnerMenuData, OwnerOrderItem, OwnerOrderList } from "@/types/owner";
import { createClient } from "@/utils/supabase/client";
import OrderJourneyTimeline from "@/components/order/OrderJourneyTimeline";
import { parseOwnerOrders } from "@/lib/data/owner";

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

export default function OwnerOrderConsole({ restaurantId, data: initialData, menu, canReject }: { restaurantId: string; data: OwnerOrderList; menu: OwnerMenuData; canReject: boolean }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all"); const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<OwnerActionResult | null>(null); const [sound, setSound] = useState(false);
  const [realtimeState, setRealtimeState] = useState<"connecting" | "live" | "retrying">("connecting");
  const [confirmingOrderId, setConfirmingOrderId] = useState("");
  const [pickupFeedback, setPickupFeedback] = useState<PickupFeedback | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState(initialData.items[0]?.id ?? "");
  const syncOrders = useCallback(async () => {
    const supabase = createClient();
    const { data: next, error } = await supabase.rpc("api_list_restaurant_orders", {
      p_restaurant_id: restaurantId,
      p_status: null,
      p_search: null,
      p_limit: 100,
      p_offset: 0,
    });
    if (error) {
      setRealtimeState("retrying");
      return;
    }
    setData(parseOwnerOrders(next));
  }, [restaurantId]);
  useEffect(() => setData(initialData), [initialData]);
  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: number | undefined;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void syncOrders(), 200);
    };
    const pollTimer = window.setInterval(refresh, 15_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("online", refresh);
    const channel = supabase
      .channel(`restaurant:${restaurantId}:orders`, { config: { private: true } })
      .on("broadcast", { event: "order_changed" }, (message) => {
      const event = message.payload as {
        order_id?: string;
        to_order_status?: string;
        to_delivery_status?: string;
        event_id?: string | number;
        event_type?: string;
        created_at?: string;
      };
      if (event.order_id) {
        setData((current) => ({
          ...current,
          items: current.items.map((item) => item.id !== event.order_id ? item : {
            ...item,
            status: event.to_order_status || item.status,
            deliveryStatus: event.to_delivery_status || item.deliveryStatus,
            events: event.event_id ? [...item.events, {
              id: String(event.event_id),
              eventType: event.event_type || "order_changed",
              toOrderStatus: event.to_order_status,
              toDeliveryStatus: event.to_delivery_status,
              source: "realtime",
              createdAt: event.created_at || new Date().toISOString(),
            }] : item.events,
          }),
        }));
      }
      if (sound) { const audio = new AudioContext(); const oscillator = audio.createOscillator();
        oscillator.connect(audio.destination); oscillator.frequency.value = 880; oscillator.start(); oscillator.stop(audio.currentTime + .12); }
      refresh();
    })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeState("live");
        else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) setRealtimeState("retrying");
      });
    return () => {
      window.clearTimeout(refreshTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("online", refresh);
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, sound, syncOrders]);
  const items = useMemo(() => data.items.filter((item) => {
    const matchesSearch = !search.trim() || `${item.code} ${item.receiverName} ${item.receiverPhone}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesFilter = filter === "all" || filter === "new" && item.status === "pending" ||
      filter === "active" && ["confirmed", "preparing", "ready", "delivering"].includes(item.status) ||
      filter === "incident" && item.incidentStatus === "open" || item.status === filter || item.deliveryStatus === filter;
    return matchesSearch && matchesFilter;
  }), [data.items, filter, search]);
  const menuImages = useMemo(() => new Map(menu.foods.map((food) => {
    const image = food.images.find((item) => item.isPrimary) ?? food.images[0];
    return [food.name.trim().toLocaleLowerCase("vi"), image] as const;
  })), [menu.foods]);
  const selectedOrder = items.find((item) => item.id === selectedOrderId) ?? items[0];
  const run = (item: OwnerOrderItem, action: "accept" | "reject" | "start_preparing" | "ready") => {
    let reason = ""; let etaMinutes: number | undefined;
    if (action === "accept") { const raw = window.prompt("Thời gian chuẩn bị dự kiến sau khi có tài xế (phút):", "25"); if (!raw) return; etaMinutes = Number(raw); }
    if (action === "reject") { reason = window.prompt("Lý do từ chối đơn (ít nhất 5 ký tự):") || ""; if (!reason) return; }
    startTransition(async () => { const result = await transitionOwnerOrderAction({ restaurantId, orderId: item.id,
      action, reason, etaMinutes, expectedVersion: item.version }); setNotice(result); if (result.ok) { await syncOrders(); router.refresh(); } });
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
        if (result.ok) { await syncOrders(); router.refresh(); }
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
    <div className="owner-orders__heading"><div><p>Điều hành theo thời gian thực</p><h2>Quản lý đơn hàng</h2><span>{data.total} đơn · <b className={`realtime-status is-${realtimeState}`}>{realtimeState === "live" ? "Đang trực tiếp" : realtimeState === "retrying" ? "Đang kết nối lại" : "Đang kết nối"}</b></span></div><button type="button" className={sound ? "is-on" : ""} onClick={() => setSound((value) => !value)}>{sound ? "Âm báo đang bật" : "Bật âm báo"}</button></div>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`}><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)}>×</button></div>}
    <div className="owner-orders__tools"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, khách hoặc số điện thoại"/><div>{FILTERS.map(([value,label]) => <button type="button" key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    {items.length && selectedOrder ? <div className="owner-orders__split">
      <div className="owner-order-list owner-order-list--compact">{items.map((item) => {
        const preview = menuImages.get(item.items[0]?.name.trim().toLocaleLowerCase("vi") ?? "");
        return <button type="button" key={item.id} className={`owner-order-list-card${item.id === selectedOrder.id ? " is-selected" : ""}${item.incidentStatus === "open" ? " has-incident" : ""}`} onClick={() => setSelectedOrderId(item.id)}>
          <span className="owner-order-list-card__top"><strong>{item.code}</strong><small>{time(item.createdAt)}</small></span>
          <span className="owner-order-list-card__summary"><span className="owner-order-list-card__preview">{preview ? <img src={preview.url} alt={preview.altText || item.items[0]?.name || "Món ăn"} /> : <b>{item.items[0]?.name.slice(0, 1).toUpperCase() || "E"}</b>}</span><span className="owner-order-list-card__customer"><b>{item.receiverName}</b><small>{item.items.reduce((sum, food) => sum + food.quantity, 0)} món · {money(item.totalPrice)}</small><em>{item.items.slice(0, 2).map((food) => food.name).join(", ")}</em></span></span>
          <span className="owner-order-list-card__status"><mark>{STATUS[item.status] || item.status}</mark><em>{DELIVERY[item.deliveryStatus] || item.deliveryStatus}</em></span>
        </button>;
      })}</div>
      <article className={`owner-order-card owner-order-detail${selectedOrder.incidentStatus === "open" ? " has-incident" : ""}`}>
        <header><div><span>{selectedOrder.code}</span><h3>{selectedOrder.receiverName}</h3><small>{time(selectedOrder.createdAt)} · {selectedOrder.receiverPhone}</small></div><div><b>{STATUS[selectedOrder.status] || selectedOrder.status}</b><em>{DELIVERY[selectedOrder.deliveryStatus] || selectedOrder.deliveryStatus}</em></div></header>
        {selectedOrder.incidentStatus === "open" && <div className="owner-order-incident"><strong>Cần hỗ trợ</strong><span>{selectedOrder.incidentReason || "Đơn đang được Admin kiểm tra."}</span></div>}
        {selectedOrder.deliveryStatus === "arrived_at_restaurant" && selectedOrder.pickupConfirmationRequestedAt && <div className="owner-order-pickup"><strong>Tài xế đang chờ xác nhận lấy món</strong><span>Kiểm tra đúng tài xế và biển số trước khi xác nhận bàn giao.</span></div>}
        <OrderJourneyTimeline orderStatus={selectedOrder.status} deliveryStatus={selectedOrder.deliveryStatus} events={selectedOrder.events} />
        <div className="owner-order-card__body"><div><h4>Chi tiết món ăn</h4><div className="owner-order-food-list">{selectedOrder.items.map((food,index) => { const image = menuImages.get(food.name.trim().toLocaleLowerCase("vi")); return <article className="owner-order-food-row" key={`${food.name}-${index}`}><span className="owner-order-food-row__image">{image ? <img src={image.url} alt={image.altText || food.name} /> : <b>{food.name.slice(0, 1).toUpperCase()}</b>}</span><span><strong>{food.quantity}× {food.name}{food.size ? ` · ${food.size}` : ""}</strong>{food.note && <small>{food.note}</small>}</span><b>{money(food.lineTotal)}</b></article>; })}</div></div><dl><div><dt>Giao đến</dt><dd>{selectedOrder.deliveryAddress}</dd></div><div><dt>Thanh toán</dt><dd>{selectedOrder.payment.method.toUpperCase()} · {selectedOrder.payment.status}</dd></div><div><dt>Tổng tiền</dt><dd>{money(selectedOrder.totalPrice)}</dd></div>{selectedOrder.status === "pending" && selectedOrder.responseDueAt && <div><dt>Phản hồi trước</dt><dd>{time(selectedOrder.responseDueAt)}</dd></div>}{selectedOrder.status === "confirmed" && !selectedOrder.shipper && <div><dt>Thời hạn tìm tài xế</dt><dd>{time(searchDeadline(selectedOrder))}</dd></div>}{selectedOrder.shipper && <div><dt>Tài xế</dt><dd>{selectedOrder.shipper.name} · {selectedOrder.shipper.plateNumber}</dd></div>}{selectedOrder.preparationDueAt && <div><dt>Dự kiến xong</dt><dd>{time(selectedOrder.preparationDueAt)}</dd></div>}</dl></div>
        {selectedOrder.note && <blockquote>Ghi chú khách: {selectedOrder.note}</blockquote>}
        <details><summary>Lịch sử trạng thái ({selectedOrder.events.length})</summary><ol>{selectedOrder.events.map((event) => <li key={event.id}><span>{event.toOrderStatus || event.toDeliveryStatus || event.eventType}</span><small>{event.source} · {time(event.createdAt)}{event.note ? ` · ${event.note}` : ""}</small></li>)}</ol></details>
        {pickupFeedback?.orderId === selectedOrder.id && <div className={`owner-order-pickup-feedback is-${pickupFeedback.state}`} role="status" aria-live="polite">{pickupFeedback.message}</div>}
        <footer>{selectedOrder.status === "pending" && <><button type="button" disabled={pending} onClick={() => run(selectedOrder,"accept")}>Nhận đơn</button>{canReject && <button type="button" className="is-danger" disabled={pending} onClick={() => run(selectedOrder,"reject")}>Từ chối</button>}</>}{selectedOrder.status === "confirmed" && <button type="button" disabled={pending || !selectedOrder.shipper || !["assigned", "arrived_at_restaurant"].includes(selectedOrder.deliveryStatus)} onClick={() => run(selectedOrder,"start_preparing")}>{selectedOrder.shipper ? "Bắt đầu chuẩn bị" : "Đang tìm tài xế · tối đa 30 phút"}</button>}{selectedOrder.status === "preparing" && <button type="button" disabled={pending || !selectedOrder.shipper} onClick={() => run(selectedOrder,"ready")}>{selectedOrder.shipper ? "Món đã sẵn sàng" : "Đang tìm tài xế thay thế"}</button>}{selectedOrder.status === "ready" && selectedOrder.deliveryStatus === "arrived_at_restaurant" && selectedOrder.pickupConfirmationRequestedAt && <button type="button" className="is-primary" disabled={pending || confirmingOrderId === selectedOrder.id} onClick={() => confirmPickup(selectedOrder)}>{confirmingOrderId === selectedOrder.id ? "Đang xác nhận…" : "Xác nhận đã giao món cho tài xế"}</button>}</footer>
      </article>
    </div> : <div className="owner-menu-empty"><strong>Không có đơn phù hợp</strong><span>Thử chọn bộ lọc khác.</span></div>}
  </section>;
}
