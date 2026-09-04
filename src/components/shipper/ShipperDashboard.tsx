"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";

import {
  acceptDeliveryAction, acceptDeliveryOfferAction, rejectDeliveryOfferAction,
  createDeliveryProofUploadTicketAction, discardDeliveryProofUploadAction,
  releaseDeliveryAction, requestPickupConfirmationAction, setShipperOnlineAction, submitDeliveryProofAction,
  submitShipperApplicationAction, updateDeliveryAction, updateShipperLocationAction,
} from "@/app/shipper/actions";
import type { PublicUser } from "@/types/auth";
import type { ActiveDelivery, DeliveryRouteStop, DeliveryStatus, ShipperActionResult, ShipperApplicationInput, ShipperDashboardData } from "@/types/shipper";
import { createClient } from "@/utils/supabase/client";
import OrderJourneyTimeline from "@/components/order/OrderJourneyTimeline";
import { parseShipperDashboard } from "@/lib/data/shipper";

const APPLICATION_STATUS: Record<string, { label: string; message: string }> = {
  SUBMITTED: { label: "Chờ tiếp nhận", message: "Hồ sơ đã được gửi và đang chờ Admin tiếp nhận." },
  UNDER_REVIEW: { label: "Đang xét duyệt", message: "Admin đang kiểm tra thông tin tài xế của bạn." },
  NEEDS_CHANGES: { label: "Cần bổ sung", message: "Hãy chỉnh sửa thông tin theo ghi chú rồi gửi lại." },
  APPROVED: { label: "Đã duyệt", message: "Hồ sơ đã được duyệt. Bạn có thể bắt đầu nhận chuyến." },
  REJECTED: { label: "Đã từ chối", message: "Bạn có thể cập nhật thông tin và gửi lại hồ sơ." },
};
const DELIVERY_STATUS: Record<string, string> = {
  assigned: "Đã nhận chuyến", arrived_at_restaurant: "Đã đến nhà hàng", picked_up: "Đã lấy món",
  delivering: "Đang giao", awaiting_customer_confirmation: "Chờ khách xác nhận", delivered: "Đã giao",
  disputed: "Khách báo chưa nhận", cancelled: "Đã hủy", failed: "Giao thất bại",
  proof_submitted: "Đã giao, chờ khách xác nhận", delivery_review: "Đang xử lý phản hồi",
};
const NEXT_STEP: Partial<Record<DeliveryStatus, { status: DeliveryStatus; label: string }>> = {
  assigned: { status: "arrived_at_restaurant", label: "Tôi đã đến nhà hàng" },
  picked_up: { status: "delivering", label: "Bắt đầu giao cho khách" },
};
type ShipperTab = "overview" | "deliveries" | "history" | "wallet" | "profile";
const SHIPPER_TAB_ICONS: Record<ShipperTab, ReactNode> = {
  overview: <DashboardOutlinedIcon fontSize="small" />,
  deliveries: <LocalShippingOutlinedIcon fontSize="small" />,
  history: <HistoryOutlinedIcon fontSize="small" />,
  wallet: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
  profile: <BadgeOutlinedIcon fontSize="small" />,
};

function money(value: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value); }
function date(value?: string) { if (!value) return "—"; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }); }
function mapHref(address: string, lat?: number, lon?: number) { const destination = lat != null && lon != null ? `${lat},${lon}` : address; return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`; }
function routeHref(stops: DeliveryRouteStop[]) { const pending = stops.filter((stop) => stop.status === "pending"); const points = (pending.length ? pending : stops).map((stop) => stop.lat != null && stop.lon != null ? `${stop.lat},${stop.lon}` : stop.address); if (!points.length) return "https://www.google.com/maps"; const destination = points.at(-1)!; const waypoints = points.slice(0, -1); return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${waypoints.length ? `&waypoints=${encodeURIComponent(waypoints.join("|"))}` : ""}`; }

export default function ShipperDashboard({ user, data: initialData }: { user: PublicUser; data: ShipperDashboardData }) {
  const [data, setData] = useState(initialData); const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<ShipperTab>("overview");
  const [realtimeState, setRealtimeState] = useState<"connecting" | "live" | "retrying">("connecting");
  const [notice, setNotice] = useState<ShipperActionResult | null>(null); const application = data.application;
  // Hồ sơ tài xế đã được tạo mới là nguồn xác nhận quyền vận hành. Không để
  // trạng thái application cũ/stale kéo người đã duyệt quay lại luồng xét duyệt.
  const dashboardReady = Boolean(data.profile?.isActive);
  const canEditApplication = !data.profile && (!application || ["NEEDS_CHANGES", "REJECTED"].includes(application.status));
  const syncDashboard = useCallback(async () => {
    const supabase = createClient();
    const { data: next, error } = await supabase.rpc("api_get_shipper_dashboard");
    if (error) {
      setRealtimeState("retrying");
      return;
    }
    setData(parseShipperDashboard(next));
  }, []);
  useEffect(() => setData(initialData), [initialData]);
  const run = (task: () => Promise<ShipperActionResult>) => startTransition(async () => { const result = await task(); setNotice(result); if (result.ok) await syncDashboard(); });
  useEffect(() => { if (!data.offers.length) return; const nextExpiry = Math.min(...data.offers.map((offer) => new Date(offer.expiresAt).getTime())); const timer = window.setTimeout(() => void syncDashboard(), Math.max(250, nextExpiry - Date.now() + 250)); return () => window.clearTimeout(timer); }, [data.offers, syncDashboard]);
  useEffect(() => {
    const shipperId = data.profile?.id;
    if (!shipperId) return;
    const supabase = createClient();
    let refreshTimer: number | undefined;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void syncDashboard(), 200);
    };
    const announceOffer = () => {
      setNotice({ ok: true, message: "Có đơn giao mới. Danh sách đang được cập nhật…" });
      navigator.vibrate?.([180, 80, 180]);
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        oscillator.connect(audio.destination);
        oscillator.frequency.value = 920;
        oscillator.start();
        oscillator.stop(audio.currentTime + .18);
      } catch { /* Trình duyệt có thể chặn âm thanh trước tương tác đầu tiên. */ }
      refresh();
    };
    const pollTimer = window.setInterval(refresh, 15_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("online", refresh);
    const updateConnection = (status: string) => {
      if (status === "SUBSCRIBED") setRealtimeState("live");
      else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) setRealtimeState("retrying");
    };
    const offerChannel = supabase
      .channel(`shipper:${shipperId}:offers`, { config: { private: true } })
      .on("broadcast", { event: "offer_created" }, announceOffer)
      .on("broadcast", { event: "offer_changed" }, refresh)
      .on("broadcast", { event: "offer_removed" }, refresh)
      .subscribe(updateConnection);
    const orderChannel = supabase
      .channel(`shipper:${shipperId}:orders`, { config: { private: true } })
      .on("broadcast", { event: "order_changed" }, refresh)
      .subscribe((status) => {
        updateConnection(status);
      });
    return () => {
      window.clearTimeout(refreshTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("online", refresh);
      void supabase.removeChannel(offerChannel);
      void supabase.removeChannel(orderChannel);
    };
  }, [data.profile?.id, syncDashboard]);
  const updateLocation = () => { if (!navigator.geolocation) { setNotice({ ok: false, message: "Trình duyệt không hỗ trợ định vị." }); return; } navigator.geolocation.getCurrentPosition((position) => run(() => updateShipperLocationAction(position.coords.latitude, position.coords.longitude)), () => setNotice({ ok: false, message: "Không thể lấy vị trí. Hãy cấp quyền định vị cho trình duyệt." }), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }); };

  return <main className="shipper-page">
    <header className="shipper-hero"><div><p>Kênh tài xế EatNow</p><h1>{data.profile?.fullName || user.fullName}</h1><span>Nhận đề xuất tự động, ghép tối đa 2 đơn và đi theo tuyến đã tối ưu.</span><small className={`realtime-status is-${realtimeState}`}>{realtimeState === "live" ? "Đơn mới đang cập nhật trực tiếp" : realtimeState === "retrying" ? "Đang kết nối lại Realtime" : "Đang kết nối Realtime"}</small></div>{data.profile && <div className="shipper-availability"><span className={data.profile.isActive ? data.profile.isOnline ? "is-online" : "is-offline" : "is-suspended"}>{data.profile.isActive ? data.profile.isOnline ? "Đang online" : "Đang offline" : "Đã tạm khóa"}</span>{data.profile.isActive && <button disabled={pending || data.activeDeliveries.length > 0} onClick={() => run(() => setShipperOnlineAction(!data.profile!.isOnline))}>{data.profile.isOnline ? "Chuyển offline" : "Bắt đầu nhận chuyến"}</button>}</div>}</header>
    {notice && <div className={`shipper-notice ${notice.ok ? "is-success" : "is-error"}`} role="status"><span>{notice.message}</span><button onClick={() => setNotice(null)}>×</button></div>}
    {canEditApplication ? <ApplicationForm user={user} data={application} pending={pending} onSubmit={(input) => run(() => submitShipperApplicationAction(input))} /> : null}
    {!data.profile && application && !canEditApplication && application.status !== "APPROVED" ? <section className="shipper-status-card"><span className={`shipper-status is-${application.status.toLowerCase()}`}>{APPLICATION_STATUS[application.status]?.label}</span><h2>Hồ sơ tài xế phiên bản {application.revision}</h2><p>{APPLICATION_STATUS[application.status]?.message}</p>{application.reviewNote && <blockquote>{application.reviewNote}</blockquote>}<small>Gửi lúc {date(application.submittedAt)}</small></section> : null}
    {application?.status === "APPROVED" && !data.profile ? <section className="shipper-status-card"><span className="shipper-status is-approved">Đã duyệt</span><h2>Đang khởi tạo hồ sơ tài xế</h2><p>Hãy tải lại trang. Nếu trạng thái không thay đổi, kiểm tra lại SQL 24.</p></section> : null}
    {data.profile && !data.profile.isActive ? <section className="shipper-status-card"><span className="shipper-status is-rejected">Tạm khóa</span><h2>Tài khoản tài xế đang bị tạm khóa</h2><p>Bạn không thể online hoặc nhận chuyến. Hãy liên hệ bộ phận hỗ trợ EatNow.</p></section> : null}
    {dashboardReady && data.profile ? <div className="shipper-workspace">
      <nav className="shipper-tabs" aria-label="Điều hướng kênh tài xế">
        <div className="shipper-tabs__brand"><TwoWheelerOutlinedIcon /><div><strong>EatNow</strong><span>Delivery Partner</span></div></div>
        <div className="shipper-tabs__items">{([
          ["overview", "Tổng quan"],
          ["deliveries", `Chuyến giao (${data.activeDeliveries.length + data.offers.length})`],
          ["history", "Lịch sử"],
          ["wallet", "Ví & thu nhập"],
          ["profile", "Hồ sơ tài xế"],
        ] as Array<[ShipperTab, string]>).map(([value, label]) => <button type="button" key={value} className={tab === value ? "is-active" : ""} aria-current={tab === value ? "page" : undefined} onClick={() => setTab(value)}><span className="shipper-tabs__icon">{SHIPPER_TAB_ICONS[value]}</span><span>{label}</span></button>)}</div>
        <div className="shipper-tabs__footer"><span>{data.profile.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{data.profile.fullName}</strong><small>{data.profile.isOnline ? "Đang online" : "Đang offline"}</small></div></div>
      </nav>
      <section className="shipper-content">
        {data.activeDeliveries.length > 0 && <LiveTracking onNotice={setNotice} />}
        {tab === "overview" && <>
          <section className="shipper-overview-heading"><div><p>Trung tâm vận hành</p><h2>Xin chào, {data.profile.fullName.split(" ").at(-1)}</h2><span>Theo dõi trạng thái, vị trí và các chuyến cần xử lý trong một nơi.</span></div><button type="button" onClick={() => setTab("deliveries")}>Mở chuyến giao</button></section>
          <section className="shipper-summary"><article><span>Phương tiện</span><strong>{data.profile.vehicleType}</strong><small>{data.profile.plateNumber}</small></article><article><span>Chuyến đang giữ</span><strong>{data.activeDeliveries.length}/2 đơn</strong><small>{data.batch && data.activeDeliveries.length > 1 ? "Chuyến ghép đang hoạt động" : "Có thể ghép đơn tương thích"}</small></article><article><span>Đề xuất mới</span><strong>{data.offers.length}</strong><small>{data.offers.length ? "Có chuyến đang chờ phản hồi" : "Chưa có đề xuất mới"}</small></article><article><span>Vị trí gần nhất</span><strong>{data.profile.lastLocationAt ? date(data.profile.lastLocationAt) : "Chưa cập nhật"}</strong><button disabled={pending} onClick={updateLocation}>Cập nhật vị trí</button></article></section>
          <div className="shipper-overview-grid"><section className="shipper-panel"><div className="shipper-panel__heading"><div><p>Việc cần làm</p><h2>Hoạt động chuyến giao</h2><span>Tình trạng hiện tại của tài khoản vận hành.</span></div></div><div className="shipper-overview-actions"><article><span>Đơn đang thực hiện</span><strong>{data.activeDeliveries.length}</strong></article><article><span>Chuyến có thể nhận</span><strong>{data.available.length}</strong></article><article><span>Điểm dừng còn lại</span><strong>{data.route.filter((stop) => stop.status === "pending").length}</strong></article></div><button type="button" onClick={() => setTab("deliveries")}>Xem và xử lý chuyến</button></section><section className="shipper-panel"><div className="shipper-panel__heading"><div><p>Gần đây</p><h2>Lịch sử mới nhất</h2></div><button type="button" className="is-quiet" onClick={() => setTab("history")}>Xem tất cả</button></div><div className="shipper-history is-preview">{data.history.slice(0, 4).map((item) => <article key={item.orderId}><div><strong>{item.code}</strong><span>{item.restaurantName}</span></div><div><b>{money(item.earning)}</b><span>{date(item.completedAt)}</span></div></article>)}{!data.history.length && <div className="shipper-empty">Chưa có chuyến đã hoàn thành.</div>}</div></section></div>
        </>}
        {tab === "deliveries" && <>
          {data.offers.length > 0 && <OfferList data={data} pending={pending} run={run} />}
          {data.route.length > 0 && <RoutePlan stops={data.route} count={data.activeDeliveries.length} />}
          {data.activeDeliveries.map((delivery) => <ActiveDeliveryCard key={delivery.orderId} delivery={delivery} pending={pending} run={run} onNotice={setNotice} onRefresh={() => void syncDashboard()} />)}
          {data.activeDeliveries.length < 2 && <AvailableList data={data} pending={pending} run={run} onRefresh={() => void syncDashboard()} />}
        </>}
        {tab === "history" && <section className="shipper-panel"><div className="shipper-panel__heading"><div><p>20 chuyến gần nhất</p><h2>Lịch sử giao hàng</h2><span>Thu nhập và trạng thái của các chuyến đã xử lý.</span></div></div><div className="shipper-history">{data.history.length ? data.history.map((item) => <article key={item.orderId}><div><strong>{item.code}</strong><span>{item.restaurantName}</span></div><div><b>{money(item.earning)}</b><span>{DELIVERY_STATUS[item.deliveryStatus] || item.deliveryStatus} · {date(item.completedAt)}</span></div></article>) : <div className="shipper-empty">Chưa có chuyến đã hoàn thành.</div>}</div></section>}
        {tab === "wallet" && <ShipperWalletPlaceholder />}
        {tab === "profile" && <section className="shipper-panel shipper-profile-panel"><div className="shipper-panel__heading"><div><p>Thông tin vận hành</p><h2>Hồ sơ tài xế</h2><span>Thông tin đã được EatNow xác minh để nhận chuyến.</span></div><span className="shipper-status is-approved">Đã xác minh</span></div><div className="shipper-profile-grid"><article><span>Họ và tên</span><strong>{data.profile.fullName}</strong></article><article><span>Số điện thoại</span><strong>{application?.phone || user.phone || "Chưa cập nhật"}</strong></article><article><span>Phương tiện</span><strong>{data.profile.vehicleType}</strong></article><article><span>Biển số xe</span><strong>{data.profile.plateNumber}</strong></article><article><span>Trạng thái tài khoản</span><strong>{data.profile.isActive ? "Đang hoạt động" : "Tạm khóa"}</strong></article><article><span>Vị trí cập nhật</span><strong>{data.profile.lastLocationAt ? date(data.profile.lastLocationAt) : "Chưa cập nhật"}</strong></article></div></section>}
      </section>
    </div> : null}
  </main>;
}

function ShipperWalletPlaceholder() {
  return <section className="shipper-panel shipper-wallet-placeholder">
    <div className="shipper-panel__heading"><div><p>Thu nhập tài xế</p><h2>Ví & rút tiền</h2><span>Số dư, đối soát COD và yêu cầu rút tiền sẽ được mở ở giai đoạn tiếp theo.</span></div><b>Sắp ra mắt</b></div>
    <div className="shipper-wallet-placeholder__grid" aria-hidden="true"><article><span>Thu nhập khả dụng</span><strong>—</strong></article><article><span>Đang đối soát</span><strong>—</strong></article><article><span>COD cần nộp</span><strong>—</strong></article></div>
    <button type="button" disabled>Yêu cầu rút tiền</button>
  </section>;
}

function LiveTracking({ onNotice }: { onNotice: (notice: ShipperActionResult) => void }) {
  const [enabled, setEnabled] = useState(false); const [sentAt, setSentAt] = useState<string>(); const lastSent = useRef(0);
  useEffect(() => {
    if (!navigator.permissions) return;
    let active = true;
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (active && permission.state === "granted") setEnabled(true);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  useEffect(() => { if (!enabled || !navigator.geolocation) return; const supabase = createClient(); const watch = navigator.geolocation.watchPosition(async (position) => { if (Date.now() - lastSent.current < 8000) return; lastSent.current = Date.now(); const { error } = await supabase.rpc("api_track_shipper_location", { p_lat: position.coords.latitude, p_lon: position.coords.longitude, p_accuracy: position.coords.accuracy, p_heading: position.coords.heading, p_speed: position.coords.speed, p_device_at: new Date(position.timestamp).toISOString() }); if (error) { setEnabled(false); onNotice({ ok: false, message: error.message || "Không thể chia sẻ vị trí." }); } else setSentAt(new Date().toISOString()); }, () => { setEnabled(false); onNotice({ ok: false, message: "Không thể theo dõi vị trí. Hãy cấp quyền định vị." }); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }); return () => navigator.geolocation.clearWatch(watch); }, [enabled, onNotice]);
  return <section className={`shipper-tracking ${enabled ? "is-live" : ""}`}><div><strong>{enabled ? "Đang chia sẻ vị trí trực tiếp" : "Tracking đang tắt"}</strong><span>{enabled ? `Khách nhận cập nhật khoảng 8 giây/lần${sentAt ? ` · ${date(sentAt)}` : ""}.` : "Chỉ chia sẻ trong lúc có chuyến đang hoạt động."}</span></div><button onClick={() => setEnabled((value) => !value)}>{enabled ? "Dừng chia sẻ" : "Bật tracking"}</button></section>;
}

function ApplicationForm({ user, data, pending, onSubmit }: { user: PublicUser; data: ShipperDashboardData["application"]; pending: boolean; onSubmit: (input: ShipperApplicationInput) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ fullName: String(form.get("fullName") || ""), phone: String(form.get("phone") || ""), dateOfBirth: String(form.get("dateOfBirth") || ""), identityNumber: String(form.get("identityNumber") || ""), driverLicenseNumber: String(form.get("driverLicenseNumber") || ""), vehicleType: String(form.get("vehicleType") || ""), plateNumber: String(form.get("plateNumber") || "") }); };
  return <section className="shipper-panel shipper-application"><div className="shipper-panel__heading"><div><p>{data ? "Cập nhật hồ sơ" : "Đăng ký mới"}</p><h2>Đăng ký làm tài xế</h2><span>Thông tin phải trùng khớp giấy tờ. Tài xế phải đủ 18 tuổi.</span></div></div>{data?.reviewNote && <div className="shipper-review-note"><strong>Ghi chú xét duyệt</strong><span>{data.reviewNote}</span></div>}<form onSubmit={submit} className="shipper-form"><label>Họ và tên<input name="fullName" defaultValue={data?.fullName || user.fullName} required maxLength={120} /></label><label>Số điện thoại<input name="phone" defaultValue={data?.phone || user.phone || ""} required inputMode="tel" /></label><label>Ngày sinh<input name="dateOfBirth" type="date" defaultValue={data?.dateOfBirth || ""} required /></label><label>CCCD/CMND<input name="identityNumber" defaultValue={data?.identityNumber || ""} required maxLength={20} /></label><label>Số giấy phép lái xe<input name="driverLicenseNumber" defaultValue={data?.driverLicenseNumber || ""} required maxLength={30} /></label><label>Loại phương tiện<select name="vehicleType" defaultValue={data?.vehicleType || "Xe máy"}><option>Xe máy</option><option>Xe máy điện</option><option>Xe đạp</option><option>Xe đạp điện</option></select></label><label>Biển số xe<input name="plateNumber" defaultValue={data?.plateNumber || ""} required maxLength={15} placeholder="65A1-12345" /></label><div className="shipper-form__actions"><button disabled={pending}>{pending ? "Đang gửi..." : data ? "Gửi lại hồ sơ" : "Gửi hồ sơ xét duyệt"}</button></div></form></section>;
}

function OfferList({ data, pending, run }: { data: ShipperDashboardData; pending: boolean; run: (task: () => Promise<ShipperActionResult>) => void }) {
  return <section className="shipper-panel shipper-offers"><div className="shipper-panel__heading"><div><p>Ghép chuyến tự động</p><h2>Đề xuất dành cho bạn</h2><span>Hệ thống ưu tiên khoảng cách đến quán và độ lệch tuyến.</span></div></div><div className="shipper-job-list">{data.offers.map((item) => <article key={item.offerId}><div className="shipper-job__route"><span>Nhận tại</span><strong>{item.restaurantName}</strong><p>{item.restaurantAddress}</p><span>Giao đến</span><strong>{item.deliveryArea}</strong></div><dl><div><dt>Đến quán</dt><dd>{item.pickupDistanceKm == null ? "—" : `${item.pickupDistanceKm.toFixed(1)} km`}</dd></div><div><dt>Quãng giao</dt><dd>{item.deliveryDistanceKm == null ? "—" : `${item.deliveryDistanceKm.toFixed(1)} km`}</dd></div><div><dt>Hết hạn</dt><dd>{date(item.expiresAt)}</dd></div></dl><div className="shipper-job__actions"><strong>{money(item.earning)}</strong><button className="is-secondary" disabled={pending} onClick={() => run(() => rejectDeliveryOfferAction(item.offerId))}>Bỏ qua</button><button disabled={pending} onClick={() => run(() => acceptDeliveryOfferAction(item.offerId))}>Nhận đề xuất</button></div></article>)}</div></section>;
}

function RoutePlan({ stops, count }: { stops: DeliveryRouteStop[]; count: number }) {
  return <section className="shipper-panel shipper-route"><div className="shipper-panel__heading"><div><p>Tuyến gợi ý · {count} đơn</p><h2>Thứ tự điểm dừng</h2><span>Tối ưu theo khoảng cách đường chim bay; Google Maps cập nhật đường và giao thông thực tế.</span></div><a className="shipper-route-link" target="_blank" rel="noreferrer" href={routeHref(stops)}>Mở toàn tuyến</a></div><ol>{stops.map((stop) => <li key={stop.id} className={stop.status === "completed" ? "is-complete" : ""}><b>{stop.sequence}</b><div><strong>{stop.label}</strong><span>{stop.address}</span></div><em>{stop.stopType === "pickup" ? "Lấy món" : "Giao khách"}</em></li>)}</ol></section>;
}

function AvailableList({ data, pending, run, onRefresh }: { data: ShipperDashboardData; pending: boolean; run: (task: () => Promise<ShipperActionResult>) => void; onRefresh: () => void }) {
  return <section className="shipper-panel"><div className="shipper-panel__heading"><div><p>{data.activeDeliveries.length ? "Đơn tương thích với tuyến hiện tại" : "Tự chọn chuyến dự phòng"}</p><h2>{data.activeDeliveries.length ? "Ghép thêm 1 đơn" : "Chuyến đang chờ tài xế"}</h2><span>Đơn chỉ vào danh sách sau khi không còn đề xuất tự động hiệu lực.</span></div><button disabled={pending} onClick={onRefresh}>Làm mới</button></div>{!data.profile?.isOnline ? <div className="shipper-empty"><strong>Bạn đang offline</strong><span>Bật trạng thái online để xem và nhận chuyến.</span></div> : <div className="shipper-job-list">{data.available.length ? data.available.map((item) => <article key={item.orderId}><div className="shipper-job__route"><span>Nhận tại</span><strong>{item.restaurantName}</strong><p>{item.restaurantAddress}</p><span>Giao đến</span><strong>{item.deliveryArea}</strong></div><dl><div><dt>Đến quán</dt><dd>{item.pickupDistanceKm == null ? "Chưa xác định" : `${item.pickupDistanceKm.toFixed(1)} km`}</dd></div><div><dt>Quãng giao</dt><dd>{item.deliveryDistanceKm == null ? "—" : `${item.deliveryDistanceKm.toFixed(1)} km`}</dd></div><div><dt>Thu nhập dự kiến</dt><dd>{money(item.earning)}</dd></div></dl><div className="shipper-job__actions"><small>{item.code} · {date(item.createdAt)}</small><button disabled={pending} onClick={() => run(() => acceptDeliveryAction(item.orderId))}>{item.canBatch ? "Ghép đơn" : "Nhận chuyến"}</button></div></article>) : <div className="shipper-empty"><strong>Chưa có chuyến phù hợp</strong><span>Hãy cập nhật vị trí hoặc làm mới sau ít phút.</span></div>}</div>}</section>;
}

function ActiveDeliveryCard({ delivery, pending, run, onNotice, onRefresh }: { delivery: ActiveDelivery; pending: boolean; run: (task: () => Promise<ShipperActionResult>) => void; onNotice: (notice: ShipperActionResult) => void; onRefresh: () => void }) {
  const next = NEXT_STEP[delivery.deliveryStatus]; const [uploading, setUploading] = useState(false);
  const [proofNotice, setProofNotice] = useState<ShipperActionResult | null>(null);
  const proofFormRef = useRef<HTMLFormElement>(null);
  const pickupRequested = Boolean(delivery.pickupConfirmationRequestedAt);
  const release = () => { const reason = window.prompt("Lý do trả chuyến về danh sách (ít nhất 5 ký tự):"); if (reason) run(() => releaseDeliveryAction(delivery.orderId, reason)); };
  const uploadProof = async () => {
    if (uploading) return;
    const form = proofFormRef.current;
    if (!form) {
      setProofNotice({ ok: false, message: "Không tìm thấy biểu mẫu ảnh. Hãy tải lại trang." });
      return;
    }
    const values = new FormData(form);
    const file = values.get("photo");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setProofNotice({ ok: false, message: "Hãy chọn ảnh JPG, PNG hoặc WebP không quá 8 MB." });
      return;
    }
    setUploading(true);
    setProofNotice({ ok: true, message: "Đang khởi tạo phiên tải ảnh..." });
    const supabase = createClient();
    let objectPath: string | null = null;
    try {
      const ticket = await createDeliveryProofUploadTicketAction(delivery.orderId, file.type);
      if (!ticket.ok) {
        setProofNotice(ticket);
        onNotice(ticket);
        return;
      }
      objectPath = ticket.objectPath;
      setProofNotice({ ok: true, message: "Đang tải ảnh giao hàng..." });
      const upload = await supabase.storage.from("delivery-proof").uploadToSignedUrl(
        ticket.objectPath, ticket.token, file, {
          cacheControl: "31536000", contentType: file.type, upsert: false,
        }
      );
      if (upload.error) {
        console.error("[shipper] Upload bằng chứng giao hàng thất bại", upload.error);
        await discardDeliveryProofUploadAction(delivery.orderId, ticket.objectPath);
        const failure = { ok: false, message: `Không thể tải ảnh giao hàng (${upload.error.message}).` } as const;
        setProofNotice(failure);
        onNotice(failure);
        return;
      }
      const result = await submitDeliveryProofAction(
        delivery.orderId, ticket.objectPath, String(values.get("note") || "")
      );
      if (!result.ok) await discardDeliveryProofUploadAction(delivery.orderId, ticket.objectPath);
      setProofNotice(result);
      onNotice(result);
      if (result.ok) { form.reset(); onRefresh(); }
    } catch (error) {
      console.error("[shipper] Luồng gửi bằng chứng bị gián đoạn", error);
      if (objectPath) await discardDeliveryProofUploadAction(delivery.orderId, objectPath);
      const failure = { ok: false, message: "Kết nối bị gián đoạn khi gửi ảnh. Vui lòng thử lại." } as const;
      setProofNotice(failure);
      onNotice(failure);
    } finally {
      setUploading(false);
    }
  };
  return <section className="shipper-panel shipper-active-job"><div className="shipper-panel__heading"><div><p>Đơn đang thực hiện · {delivery.code}</p><h2>{pickupRequested && delivery.deliveryStatus === "arrived_at_restaurant" ? "Chờ nhà hàng xác nhận bàn giao" : DELIVERY_STATUS[delivery.deliveryStatus] || delivery.deliveryStatus}</h2></div><strong>{money(delivery.earning)}</strong></div><OrderJourneyTimeline orderStatus={delivery.orderStatus} deliveryStatus={delivery.deliveryStatus} /><div className="shipper-active-grid"><article><span>Điểm lấy món</span><h3>{delivery.restaurant.name}</h3><p>{delivery.restaurant.address}</p>{delivery.restaurant.phone && <a href={`tel:${delivery.restaurant.phone}`}>Gọi nhà hàng: {delivery.restaurant.phone}</a>}<a target="_blank" rel="noreferrer" href={mapHref(delivery.restaurant.address, delivery.restaurant.lat, delivery.restaurant.lon)}>Mở chỉ đường đến quán</a></article><article><span>Người nhận</span><h3>{delivery.customer.name}</h3><p>{delivery.customer.address}</p><a href={`tel:${delivery.customer.phone}`}>Gọi khách: {delivery.customer.phone}</a><a target="_blank" rel="noreferrer" href={mapHref(delivery.customer.address, delivery.customer.lat, delivery.customer.lon)}>Mở chỉ đường đến khách</a>{delivery.customer.note && <blockquote>Ghi chú: {delivery.customer.note}</blockquote>}</article></div><div className="shipper-pickup-items"><h3>Món cần nhận</h3>{delivery.items.map((item, index) => <div key={`${item.name}-${index}`}><strong>{item.quantity}× {item.name}{item.size ? ` · ${item.size}` : ""}</strong>{item.note && <span>{item.note}</span>}</div>)}</div>{delivery.deliveryStatus === "delivering" && <form ref={proofFormRef} className="shipper-proof-form" onSubmit={(event) => event.preventDefault()} noValidate><div><strong>Ảnh xác nhận đã giao</strong><span>Chọn ảnh trước, sau đó gửi để khách xác nhận đã nhận hàng.</span></div><label className="shipper-proof-file">Ảnh giao hàng<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={() => setProofNotice(null)} /></label><textarea name="note" maxLength={300} placeholder="Ghi chú cho khách (không bắt buộc)" /><button type="button" disabled={uploading} onClick={uploadProof}>{uploading ? "Đang gửi ảnh..." : "Gửi ảnh và chờ khách xác nhận"}</button>{proofNotice && <div className={`shipper-proof-inline ${proofNotice.ok ? "is-success" : "is-error"}`} role="status">{proofNotice.message}</div>}</form>}{["proof_submitted", "awaiting_customer_confirmation"].includes(delivery.deliveryStatus) && <div className="shipper-proof-wait"><strong>Ảnh đã được gửi</strong><span>Đơn chỉ hoàn tất sau khi khách bấm “Đã nhận hàng”.</span></div>}{["delivery_review", "disputed"].includes(delivery.deliveryStatus) && <div className="shipper-proof-wait is-error"><strong>Khách báo chưa nhận hàng</strong><span>Giữ nguyên ảnh và liên hệ bộ phận hỗ trợ để xử lý tranh chấp.</span></div>}{pickupRequested && delivery.deliveryStatus === "arrived_at_restaurant" && <div className="shipper-proof-wait"><strong>Đã gửi yêu cầu bàn giao</strong><span>Nhà hàng cần xác nhận đã giao món cho bạn trước khi bắt đầu giao khách.</span></div>}<div className="shipper-active-actions">{["assigned", "arrived_at_restaurant"].includes(delivery.deliveryStatus) && !pickupRequested && <button type="button" className="is-secondary" disabled={pending} onClick={release}>Trả chuyến</button>}{delivery.deliveryStatus === "arrived_at_restaurant" && delivery.orderStatus === "ready" && !pickupRequested && <button type="button" disabled={pending} onClick={() => run(() => requestPickupConfirmationAction(delivery.orderId))}>Tôi đã nhận món · Gửi quán xác nhận</button>}{next && <button type="button" disabled={pending} onClick={() => run(() => updateDeliveryAction(delivery.orderId, next.status))}>{next.label}</button>}</div>{delivery.deliveryStatus === "arrived_at_restaurant" && delivery.orderStatus !== "ready" && <p className="shipper-field-note">Bạn chỉ có thể yêu cầu xác nhận lấy món sau khi nhà hàng chuyển đơn sang “Sẵn sàng”.</p>}</section>;
}
