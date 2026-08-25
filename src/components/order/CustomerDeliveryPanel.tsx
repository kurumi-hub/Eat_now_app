"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { confirmDeliveryAction } from "@/app/orders/actions";
import { createClient } from "@/utils/supabase/client";

export type CustomerDeliveryData = {
  orderId: string;
  deliveryStatus: string;
  canConfirm: boolean;
  proof: { note?: string; status: string; submittedAt: string } | null;
  proofUrl?: string;
  latestLocation: { lat: number; lon: number; accuracyM?: number; recordedAt: string } | null;
};

function time(value?: string) { if (!value) return "—"; return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }); }

export default function CustomerDeliveryPanel({ initial }: { initial: CustomerDeliveryData }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [location, setLocation] = useState(initial.latestLocation); const [notice, setNotice] = useState<string>();
  const [proofImageFailed, setProofImageFailed] = useState(false);
  useEffect(() => { setProofImageFailed(false); }, [initial.proofUrl]);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`order-tracking-${initial.orderId}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "shipper_location_events", filter: `order_id=eq.${initial.orderId}`,
    }, (payload) => { const row = payload.new as Record<string, unknown>; const lat = Number(row.lat); const lon = Number(row.lon); if (Number.isFinite(lat) && Number.isFinite(lon)) setLocation({ lat, lon, accuracyM: Number(row.accuracy_m) || undefined, recordedAt: String(row.recorded_at || new Date().toISOString()) }); }).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${initial.orderId}`,
    }, () => router.refresh()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [initial.orderId, router]);
  const confirm = (received: boolean) => { let reason = ""; if (!received) { reason = window.prompt("Cho EatNow biết lý do bạn chưa nhận được hàng (ít nhất 5 ký tự):") || ""; if (!reason) return; } startTransition(async () => { const result = await confirmDeliveryAction(initial.orderId, received, reason); setNotice(result.message); if (result.ok) router.refresh(); }); };
  const mapUrl = location ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}` : undefined;
  const deliveryTitle = ["proof_submitted", "awaiting_customer_confirmation"].includes(initial.deliveryStatus)
    ? "Tài xế đang chờ bạn xác nhận"
    : ["delivery_review", "disputed"].includes(initial.deliveryStatus)
      ? "Đang xử lý phản hồi"
      : initial.proof ? "Bằng chứng giao hàng" : "Vị trí tài xế";

  return <section className="customer-delivery-card">
    <div className="customer-delivery-heading"><div><span>Theo dõi giao hàng</span><h2>{deliveryTitle}</h2></div><i className={location ? "is-live" : ""}>{location ? "Trực tiếp" : "Chưa có tín hiệu"}</i></div>
    {location ? <div className="customer-location"><b>●</b><div><strong>Vị trí cập nhật gần nhất</strong><span>{time(location.recordedAt)}{location.accuracyM ? ` · sai số khoảng ${Math.round(location.accuracyM)} m` : ""}</span></div>{mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer">Xem trên Google Maps</a>}</div> : <p className="customer-delivery-muted">Khi tài xế bật tracking, vị trí mới sẽ tự động xuất hiện tại đây.</p>}
    {initial.proof && <div className="customer-proof"><div><strong>Ảnh giao hàng từ tài xế</strong><span>Gửi lúc {time(initial.proof.submittedAt)}</span></div>{initial.proofUrl && !proofImageFailed ? <figure><img src={initial.proofUrl} alt="Ảnh xác nhận tài xế đã giao đơn hàng" onError={() => setProofImageFailed(true)} /><figcaption><span>Kiểm tra đúng món và vị trí nhận trước khi xác nhận.</span><a href={initial.proofUrl} target="_blank" rel="noreferrer">Mở ảnh kích thước đầy đủ</a></figcaption></figure> : <div className="customer-proof-error"><strong>Chưa thể tải ảnh giao hàng</strong><span>Liên kết ảnh có thể đã hết hạn hoặc Storage tạm thời gián đoạn.</span><button type="button" onClick={() => router.refresh()}>Tải lại ảnh</button></div>}{initial.proof.note && <blockquote>Ghi chú của tài xế: {initial.proof.note}</blockquote>}</div>}
    {initial.canConfirm && <div className="customer-confirm-actions"><button className="is-secondary" disabled={pending} onClick={() => confirm(false)}>Tôi chưa nhận được hàng</button><button disabled={pending} onClick={() => confirm(true)}>{pending ? "Đang xác nhận..." : "Tôi đã nhận hàng"}</button></div>}
    {notice && <p className="customer-delivery-notice" role="status">{notice}</p>}
  </section>;
}
