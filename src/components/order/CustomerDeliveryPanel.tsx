"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { confirmDeliveryAction } from "@/app/orders/actions";
import { createClient } from "@/utils/supabase/client";

const LiveOrderMap = dynamic(
  () => import("@/components/order/LiveOrderMap"),
  {
    ssr: false,
    loading: () => <div className="customer-live-map__loading">Đang tải bản đồ…</div>,
  }
);

type MapPoint = { lat: number; lon: number };
type LiveLocation = MapPoint & {
  accuracyM?: number;
  heading?: number;
  speedMps?: number;
  recordedAt: string;
};

export type CustomerDeliveryData = {
  orderId: string;
  deliveryStatus: string;
  canConfirm: boolean;
  proof: { note?: string; status: string; submittedAt: string } | null;
  proofUrl?: string;
  latestLocation: LiveLocation | null;
  restaurantLocation: MapPoint | null;
  destinationLocation: MapPoint | null;
};

function time(value?: string) { if (!value) return "—"; return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }); }

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseLocation(value: unknown): LiveLocation | null {
  const source = object(value);
  const lat = number(source.lat);
  const lon = number(source.lon);
  if (lat == null || lon == null) return null;
  return {
    lat,
    lon,
    accuracyM: number(source.accuracy_m),
    heading: number(source.heading),
    speedMps: number(source.speed_mps),
    recordedAt: String(source.recorded_at || new Date().toISOString()),
  };
}

function distanceKm(left: MapPoint, right: MapPoint) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(right.lat - left.lat);
  const dLon = radians(right.lon - left.lon);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(left.lat)) * Math.cos(radians(right.lat))
    * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateEta(distance: number) {
  const roadDistance = distance * 1.25;
  const min = Math.max(2, Math.round(roadDistance / 24 * 60));
  const max = Math.max(min + 2, Math.round(roadDistance / 16 * 60));
  return `${min}–${max} phút`;
}

const TO_RESTAURANT = new Set(["assigned", "arrived_at_restaurant"]);
const TO_CUSTOMER = new Set(["picked_up", "delivering"]);
const SHOW_LIVE_MAP = new Set([
  "assigned",
  "arrived_at_restaurant",
  "picked_up",
  "delivering",
]);

export default function CustomerDeliveryPanel({ initial }: { initial: CustomerDeliveryData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [location, setLocation] = useState(initial.latestLocation);
  const [notice, setNotice] = useState<string>();
  const [clock, setClock] = useState(() => Date.now());
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [proofImageFailed, setProofImageFailed] = useState(false);

  useEffect(() => { setProofImageFailed(false); }, [initial.proofUrl]);
  useEffect(() => { setLocation(initial.latestLocation); }, [initial.latestLocation]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`order-tracking-${initial.orderId}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "shipper_location_events", filter: `order_id=eq.${initial.orderId}`,
    }, (payload) => {
      const next = parseLocation(payload.new);
      if (next) setLocation(next);
    }).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${initial.orderId}`,
    }, () => router.refresh()).subscribe((status) => {
      setRealtimeConnected(status === "SUBSCRIBED");
    });
    return () => { void supabase.removeChannel(channel); };
  }, [initial.orderId, router]);

  const refreshLatestLocation = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("api_get_customer_delivery", {
      p_order_id: initial.orderId,
    });
    if (error) return;
    const source = object(data);
    const next = parseLocation(source.latest_location);
    if (next) setLocation(next);
    if (
      typeof source.delivery_status === "string" &&
      source.delivery_status !== initial.deliveryStatus
    ) {
      router.refresh();
    }
  }, [initial.deliveryStatus, initial.orderId, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const recordedAt = location?.recordedAt
        ? new Date(location.recordedAt).getTime()
        : 0;
      const stale = !recordedAt || Date.now() - recordedAt > 20_000;
      if (!realtimeConnected || stale) void refreshLatestLocation();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [location?.recordedAt, realtimeConnected, refreshLatestLocation]);

  const confirm = (received: boolean) => { let reason = ""; if (!received) { reason = window.prompt("Cho EatNow biết lý do bạn chưa nhận được hàng (ít nhất 5 ký tự):") || ""; if (!reason) return; } startTransition(async () => { const result = await confirmDeliveryAction(initial.orderId, received, reason); setNotice(result.message); if (result.ok) router.refresh(); }); };
  const mapUrl = location ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}` : undefined;
  const locationAge = location?.recordedAt
    ? Math.max(0, Math.floor((clock - new Date(location.recordedAt).getTime()) / 1000))
    : Number.POSITIVE_INFINITY;
  const signal = !location
    ? { label: "Chưa có tín hiệu", className: "" }
    : locationAge <= 20 && realtimeConnected
      ? { label: "Đang trực tiếp", className: "is-live" }
      : locationAge <= 60
        ? { label: "Đang chờ cập nhật", className: "is-delayed" }
        : { label: "Tạm mất tín hiệu", className: "is-offline" };
  const target = TO_RESTAURANT.has(initial.deliveryStatus)
    ? initial.restaurantLocation
    : initial.destinationLocation;
  const remainingDistance = useMemo(
    () => location && target ? distanceKm(location, target) : null,
    [location, target]
  );
  const targetLabel = TO_RESTAURANT.has(initial.deliveryStatus)
    ? "nhà hàng"
    : "điểm giao";
  const focus = TO_RESTAURANT.has(initial.deliveryStatus)
    ? "restaurant" as const
    : "destination" as const;
  const deliveryTitle = ["proof_submitted", "awaiting_customer_confirmation"].includes(initial.deliveryStatus)
    ? "Tài xế đang chờ bạn xác nhận"
    : ["delivery_review", "disputed"].includes(initial.deliveryStatus)
      ? "Đang xử lý phản hồi"
      : initial.deliveryStatus === "assigned"
        ? "Tài xế đang đến nhà hàng"
        : initial.deliveryStatus === "arrived_at_restaurant"
          ? "Tài xế đã đến nhà hàng"
          : initial.deliveryStatus === "picked_up"
            ? "Tài xế đã nhận món"
            : initial.deliveryStatus === "delivering"
              ? "Tài xế đang giao đến bạn"
              : initial.proof ? "Bằng chứng giao hàng" : "Vị trí tài xế";

  return <section className="customer-delivery-card">
    <div className="customer-delivery-heading"><div><span>Theo dõi giao hàng</span><h2>{deliveryTitle}</h2></div><i className={signal.className}>{signal.label}</i></div>
    {SHOW_LIVE_MAP.has(initial.deliveryStatus) && (location || initial.restaurantLocation || initial.destinationLocation) ? <>
      <LiveOrderMap
        shipper={location}
        restaurant={initial.restaurantLocation}
        destination={initial.destinationLocation}
        focus={focus}
      />
      {location && <div className="customer-live-summary">
        <div><span>Khoảng cách đến {targetLabel}</span><strong>{remainingDistance == null ? "Đang tính…" : `${remainingDistance.toFixed(1)} km`}</strong></div>
        <div><span>Thời gian dự kiến</span><strong>{remainingDistance == null || !TO_CUSTOMER.has(initial.deliveryStatus) ? "—" : estimateEta(remainingDistance)}</strong></div>
        <small>ETA là ước tính gần đúng theo vị trí hiện tại và có thể thay đổi theo giao thông.</small>
      </div>}
    </> : null}
    {location ? <div className="customer-location"><b>●</b><div><strong>Vị trí cập nhật gần nhất</strong><span>{time(location.recordedAt)}{locationAge < Number.POSITIVE_INFINITY ? ` · ${locationAge < 5 ? "vừa xong" : `${locationAge} giây trước`}` : ""}{location.accuracyM ? ` · sai số khoảng ${Math.round(location.accuracyM)} m` : ""}</span></div>{mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer">Mở Google Maps</a>}</div> : <p className="customer-delivery-muted">Khi tài xế bật tracking, vị trí mới sẽ tự động xuất hiện tại đây.</p>}
    {initial.proof && <div className="customer-proof"><div><strong>Ảnh giao hàng từ tài xế</strong><span>Gửi lúc {time(initial.proof.submittedAt)}</span></div>{initial.proofUrl && !proofImageFailed ? <figure><img src={initial.proofUrl} alt="Ảnh xác nhận tài xế đã giao đơn hàng" onError={() => setProofImageFailed(true)} /><figcaption><span>Kiểm tra đúng món và vị trí nhận trước khi xác nhận.</span><a href={initial.proofUrl} target="_blank" rel="noreferrer">Mở ảnh kích thước đầy đủ</a></figcaption></figure> : <div className="customer-proof-error"><strong>Chưa thể tải ảnh giao hàng</strong><span>Liên kết ảnh có thể đã hết hạn hoặc Storage tạm thời gián đoạn.</span><button type="button" onClick={() => router.refresh()}>Tải lại ảnh</button></div>}{initial.proof.note && <blockquote>Ghi chú của tài xế: {initial.proof.note}</blockquote>}</div>}
    {initial.canConfirm && <div className="customer-confirm-actions"><button className="is-secondary" disabled={pending} onClick={() => confirm(false)}>Tôi chưa nhận được hàng</button><button disabled={pending} onClick={() => confirm(true)}>{pending ? "Đang xác nhận..." : "Tôi đã nhận hàng"}</button></div>}
    {notice && <p className="customer-delivery-notice" role="status">{notice}</p>}
  </section>;
}
