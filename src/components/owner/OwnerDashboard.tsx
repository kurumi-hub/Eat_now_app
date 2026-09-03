"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import {
  applyRestaurantMediaAction, createRestaurantMediaUploadTicketAction,
  deleteRestaurantMediaAction, discardRestaurantMediaUploadAction,
  inviteRestaurantStaffAction, publishRestaurantAction,
  replaceRestaurantHoursAction, revokeRestaurantMemberAction,
  revokeStaffInvitationAction, setAcceptingOrdersAction,
  transferRestaurantOwnershipAction, updateRestaurantProfileAction,
} from "@/app/owner/actions";
import type { ManagedRestaurantSummary, OwnerActionResult, OwnerDashboardData, OwnerMenuData, RestaurantHour, RestaurantMedia } from "@/types/owner";
import { createClient } from "@/utils/supabase/client";
import RestaurantAddressField, {
  type RestaurantAddressSelection,
} from "@/components/restaurant/RestaurantAddressField";
import OwnerMenuManager from "@/components/owner/OwnerMenuManager";
import OwnerOrderConsole from "@/components/owner/OwnerOrderConsole";
import VoucherManagementPanel from "@/components/voucher/VoucherManagementPanel";
import type { OwnerOrderList } from "@/types/owner";
import type { VoucherManagementData } from "@/types/voucher";

const DAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const STATE: Record<string, string> = {
  OPEN: "Đang mở & nhận đơn", PAUSED: "Đang tạm dừng nhận đơn",
  CLOSED_BY_SCHEDULE: "Ngoài giờ hoạt động", SETUP: "Đang thiết lập",
  SUSPENDED: "Nhà hàng bị tạm ngưng", UNPUBLISHED: "Chưa xuất bản",
  APPROVAL_PENDING: "Chờ phê duyệt", REJECTED: "Hồ sơ bị từ chối", CLOSED: "Đã đóng",
};
const ORDER_STATE: Record<string, string> = {
  pending: "Đơn mới", confirmed: "Đã nhận", preparing: "Đang chuẩn bị",
  ready: "Chờ lấy hàng", delivering: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy",
};
const STATE_HELP: Record<string, string> = {
  OPEN: "Khách có thể thêm món và tạo đơn mới ngay lúc này.",
  PAUSED: "Đơn mới đang bị chặn cho đến khi nhà hàng bật nhận đơn trở lại.",
  CLOSED_BY_SCHEDULE: "Đã bật nhận đơn; hệ thống sẽ tự mở lại trong khung giờ đã cấu hình.",
  SETUP: "Hoàn tất hồ sơ, giờ hoạt động và xuất bản trước khi nhận đơn.",
  SUSPENDED: "Nhà hàng đang bị tạm ngưng và không thể nhận đơn mới.",
  UNPUBLISHED: "Nhà hàng chưa được xuất bản công khai.",
};
type Tab = "overview" | "orders" | "menu" | "vouchers" | "settings" | "wallet";
const VALID_TABS: Tab[] = ["overview", "orders", "menu", "vouchers", "settings", "wallet"];
const TAB_ICONS: Record<Tab, ReactNode> = {
  overview: <DashboardOutlinedIcon fontSize="small" />,
  orders: <ReceiptLongOutlinedIcon fontSize="small" />,
  menu: <RestaurantMenuOutlinedIcon fontSize="small" />,
  vouchers: <ConfirmationNumberOutlinedIcon fontSize="small" />,
  settings: <SettingsOutlinedIcon fontSize="small" />,
  wallet: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
};
const BUCKET = "restaurant-media";
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

function dayRows(hours: RestaurantHour[]) {
  return DAYS.map((_, day) => hours.find((item) => item.dayOfWeek === day && item.slotNo === 1) || null);
}

export default function OwnerDashboard({
  userId, restaurants, data, menu, orders, vouchers,
}: { userId: string; restaurants: ManagedRestaurantSummary[]; data: OwnerDashboardData; menu: OwnerMenuData; orders: OwnerOrderList; vouchers: VoucherManagementData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "overview");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const permissions = new Set(data.permissions);
  const canProfile = permissions.has("restaurant.profile.manage");
  const canHours = permissions.has("restaurant.hours.manage");
  const canOrders = permissions.has("restaurant.orders.toggle");
  const canMedia = permissions.has("restaurant.media.manage");
  const canMenu = permissions.has("restaurant.menu.manage");
  const canVouchers = permissions.has("restaurant.voucher.manage");
  const canStaff = permissions.has("restaurant.staff.manage");
  const canTransfer = permissions.has("restaurant.ownership.transfer");
  const canSettings = canProfile || canHours || canMedia || canStaff;
  const openOrderCount = orders.items.filter((item) => !["completed", "cancelled"].includes(item.status)).length;
  const tabs: Array<[Tab, string, boolean]> = [
    ["overview", "Tổng quan", true], ["orders", `Đơn hàng (${openOrderCount})`, permissions.has("restaurant.orders.manage")],
    ["menu", "Thực đơn", canMenu], ["vouchers", "Voucher", canVouchers], ["settings", "Cài đặt", canSettings],
    ["wallet", "Tài chính", permissions.has("restaurant.finance.view")],
  ];

  const run = (task: () => Promise<OwnerActionResult>) => startTransition(async () => {
    const result = await task(); setNotice(result); if (result.ok) router.refresh();
  });

  return <main className="owner-page">
    <header className="owner-heading">
      <div><p>Kênh người bán EatNow</p><h1>{data.restaurant.name}</h1><span className={`owner-heading__status ${data.restaurant.acceptingOrders ? "is-open" : "is-paused"}`}>{STATE[data.restaurant.orderState] || data.restaurant.orderState}</span></div>
      <div className="owner-heading__actions">
        {restaurants.length > 1 && <select aria-label="Chọn nhà hàng" value={data.restaurant.id} onChange={(event) => router.push(`/owner?restaurant=${event.target.value}`)}>{restaurants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        <Link href="/account/seller">Nhà hàng & đăng ký mới</Link>
      </div>
    </header>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`} role="status">{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}
    <div className="owner-workspace">
      <nav className="owner-tabs" aria-label="Điều hướng kênh người bán">
        <div className="owner-tabs__brand"><StorefrontOutlinedIcon /><div><strong>EatNow</strong><span>Restaurant Owner</span></div></div>
        <div className="owner-tabs__items">{tabs.filter((item) => item[2]).map(([value, label]) => <button key={value} className={tab === value ? "is-active" : ""} aria-current={tab === value ? "page" : undefined} onClick={() => setTab(value)}><span className="owner-tabs__icon">{TAB_ICONS[value]}</span><span>{label}</span></button>)}</div>
        <div className="owner-tabs__footer"><span>{data.restaurant.name.slice(0, 1).toUpperCase()}</span><div><strong>{data.restaurant.name}</strong><small>{data.restaurant.approvalStatus === "APPROVED" ? "Đã xác minh" : "Đang hoàn thiện"}</small></div></div>
      </nav>

      <section className="owner-content">
        {tab === "overview" && <Overview data={data} menu={menu} orders={orders} pending={pending} canOrders={canOrders} canManageOrders={permissions.has("restaurant.orders.manage")} canMenu={canMenu} canProfile={canProfile} run={run} onOpenOrders={() => setTab("orders")} onOpenMenu={() => setTab("menu")} />}
        {tab === "orders" && permissions.has("restaurant.orders.manage") && <OwnerOrderConsole restaurantId={data.restaurant.id} data={orders} menu={menu} canReject={permissions.has("restaurant.orders.reject")} />}
        {tab === "menu" && canMenu && <OwnerMenuManager restaurantId={data.restaurant.id} data={menu} />}
        {tab === "vouchers" && canVouchers && <VoucherManagementPanel mode="owner" restaurantId={data.restaurant.id} data={vouchers} />}
        {tab === "settings" && canSettings && <Settings userId={userId} data={data} pending={pending} canProfile={canProfile} canHours={canHours} canMedia={canMedia} canStaff={canStaff} canTransfer={canTransfer} run={run} />}
        {tab === "wallet" && permissions.has("restaurant.finance.view") && <OwnerWalletPlaceholder />}
      </section>
    </div>
  </main>;
}

function OwnerWalletPlaceholder() {
  return <section className="owner-card owner-wallet-placeholder">
    <span className="owner-coming-soon">Sắp ra mắt</span>
    <div><p>Tài chính nhà hàng</p><h2>Ví & đối soát doanh thu</h2><span>Khu vực này sẽ hiển thị doanh thu khả dụng, khoản đang đối soát và lịch sử chuyển tiền sau khi nghiệp vụ tài chính được chốt.</span></div>
    <div className="owner-wallet-preview" aria-hidden="true"><article><span>Số dư khả dụng</span><strong>—</strong></article><article><span>Đang đối soát</span><strong>—</strong></article><article><span>Thanh toán gần nhất</span><strong>—</strong></article></div>
    <button type="button" disabled>Yêu cầu rút tiền</button>
  </section>;
}

function ownerMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function Overview({ data, menu, orders, pending, canOrders, canManageOrders, canMenu, canProfile, run, onOpenOrders, onOpenMenu }: { data: OwnerDashboardData; menu: OwnerMenuData; orders: OwnerOrderList; pending: boolean; canOrders: boolean; canManageOrders: boolean; canMenu: boolean; canProfile: boolean; run: (task: () => Promise<OwnerActionResult>) => void; onOpenOrders: () => void; onOpenMenu: () => void }) {
  const [reason, setReason] = useState("Tạm dừng vận hành");
  const restaurant = data.restaurant;
  const recentOrders = orders.items.filter((item) => !["completed", "cancelled"].includes(item.status)).slice(0, 4);
  const popularDishes = useMemo(() => {
    const totals = new Map<string, number>();
    orders.items.filter((order) => order.status !== "cancelled").forEach((order) => order.items.forEach((item) => totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity)));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, quantity]) => {
      const food = menu.foods.find((item) => item.name.trim().toLowerCase() === name.trim().toLowerCase());
      return { name, quantity, image: food?.images.find((item) => item.isPrimary) ?? food?.images[0] };
    });
  }, [menu.foods, orders.items]);
  return <div className="owner-grid">
    <section className={`owner-card owner-card--hero ${restaurant.acceptingOrders ? "is-accepting" : "is-paused"}`}><div><p>Trạng thái nhận đơn thực tế</p><div className="owner-order-state"><h2>{STATE[restaurant.orderState] || restaurant.orderState}</h2><b>{restaurant.acceptingOrders ? "Cho phép đơn mới: BẬT" : "Cho phép đơn mới: TẮT"}</b></div><span>{STATE_HELP[restaurant.orderState] || `Duyệt: ${restaurant.approvalStatus} · Vận hành: ${restaurant.lifecycleStatus}`}</span>{!restaurant.acceptingOrders && restaurant.pausedReason && <small>Lý do: {restaurant.pausedReason}</small>}</div>
      {canOrders && restaurant.lifecycleStatus === "ACTIVE" && <div className="owner-order-control">
        {restaurant.acceptingOrders && <input value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Lý do tạm dừng" />}
        <button disabled={pending || (restaurant.acceptingOrders && reason.trim().length < 3)} onClick={() => run(() => setAcceptingOrdersAction(restaurant.id, !restaurant.acceptingOrders, reason))}>{restaurant.acceptingOrders ? "Tạm dừng nhận đơn" : "Bật nhận đơn ngay"}</button>
      </div>}
      {canProfile && restaurant.lifecycleStatus === "SETUP" && restaurant.approvalStatus === "APPROVED" && <button disabled={pending} onClick={() => run(() => publishRestaurantAction(restaurant.id))}>Xuất bản nhà hàng</button>}
    </section>
    <section className="owner-metrics"><article><strong>{data.orderStats.today}</strong><span>Đơn hôm nay</span></article><article><strong>{data.orderStats.open}</strong><span>Đơn đang xử lý</span></article><article><strong>{data.orderStats.completedToday}</strong><span>Hoàn tất hôm nay</span></article></section>
    <div className="owner-dashboard-panels">
      <section className="owner-card owner-dashboard-panel"><div className="owner-dashboard-panel__heading"><div><h2>Đơn hàng đang xử lý</h2><p>Cập nhật từ dữ liệu đơn hàng gần nhất.</p></div>{canManageOrders && <button type="button" onClick={onOpenOrders}>Xem tất cả</button>}</div><div className="owner-dashboard-orders">{recentOrders.map((order) => <article key={order.id}><span>{order.code.replace(/^#?EN-?/i, "#")}</span><div><strong>{order.receiverName}</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} món · {ownerMoney(order.totalPrice)}</small></div><mark>{ORDER_STATE[order.status] || order.status}</mark></article>)}{!recentOrders.length && <p className="owner-dashboard-empty">Chưa có đơn đang xử lý.</p>}</div></section>
      <section className="owner-card owner-dashboard-panel"><div className="owner-dashboard-panel__heading"><div><h2>Món bán chạy</h2><p>Tổng hợp từ tối đa 100 đơn gần nhất.</p></div>{canMenu && <button type="button" onClick={onOpenMenu}>Thực đơn</button>}</div><div className="owner-popular-list">{popularDishes.map((food, index) => <article key={food.name}><div className="owner-popular-list__image">{food.image ? <img src={food.image.url} alt={food.image.altText || food.name} /> : <span>{index + 1}</span>}<b>{index + 1}</b></div><div><strong>{food.name}</strong><small>{food.quantity} phần đã đặt</small></div></article>)}{!popularDishes.length && <p className="owner-dashboard-empty">Chưa đủ dữ liệu để xếp hạng món.</p>}</div></section>
    </div>
    <section className="owner-card"><h2>Điều kiện vận hành</h2><ul className="owner-checklist"><li className={restaurant.approvalStatus === "APPROVED" ? "done" : ""}>Hồ sơ được phê duyệt</li><li className={restaurant.lat != null && restaurant.lon != null ? "done" : ""}>Có tọa độ giao hàng</li><li className={data.hours.length > 0 ? "done" : ""}>Đã cấu hình giờ mở cửa</li><li className={Boolean(restaurant.publishedAt) ? "done" : ""}>Đã xuất bản công khai</li></ul></section>
    <section className="owner-card"><h2>Thông tin nhanh</h2><dl className="owner-details"><div><dt>Địa chỉ</dt><dd>{restaurant.address}</dd></div><div><dt>Điện thoại</dt><dd>{restaurant.phone || "Chưa cập nhật"}</dd></div><div><dt>Múi giờ</dt><dd>{restaurant.timezone}</dd></div></dl></section>
  </div>;
}

function Settings({ userId, data, pending, canProfile, canHours, canMedia, canStaff, canTransfer, run }: { userId: string; data: OwnerDashboardData; pending: boolean; canProfile: boolean; canHours: boolean; canMedia: boolean; canStaff: boolean; canTransfer: boolean; run: (task: () => Promise<OwnerActionResult>) => void }) {
  type SettingsTab = "profile" | "hours" | "media" | "staff";
  const settingsTabs: Array<{ id: SettingsTab; label: string; description: string; visible: boolean }> = [
    { id: "profile", label: "Thông tin nhà hàng", description: "Hồ sơ và vị trí", visible: canProfile },
    { id: "hours", label: "Giờ mở cửa", description: "Lịch nhận đơn", visible: canHours },
    { id: "media", label: "Hình ảnh", description: "Logo, ảnh bìa và thư viện", visible: canMedia },
    { id: "staff", label: "Nhân sự", description: "Lời mời và phân quyền", visible: canStaff },
  ];
  const availableTabs = settingsTabs.filter((item) => item.visible);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>(availableTabs[0]?.id ?? "profile");
  return <section className="owner-settings">
    <header className="owner-settings__heading"><p>Thiết lập nhà hàng</p><h2>Cài đặt vận hành</h2><span>Quản lý hồ sơ, giờ mở cửa, hình ảnh và nhân sự tại một nơi.</span></header>
    <nav className="owner-settings__tabs" aria-label="Các mục cài đặt">{availableTabs.map((item) => <button type="button" key={item.id} className={settingsTab === item.id ? "is-active" : ""} aria-current={settingsTab === item.id ? "page" : undefined} onClick={() => setSettingsTab(item.id)}><strong>{item.label}</strong><small>{item.description}</small></button>)}</nav>
    <div className="owner-settings__panel">
      {settingsTab === "profile" && canProfile && <Profile data={data} pending={pending} run={run} />}
      {settingsTab === "hours" && canHours && <Hours data={data} pending={pending} run={run} />}
      {settingsTab === "media" && canMedia && <Media data={data} pending={pending} run={run} />}
      {settingsTab === "staff" && canStaff && <Staff userId={userId} data={data} pending={pending} canTransfer={canTransfer} run={run} />}
    </div>
  </section>;
}

function Profile({ data, pending, run }: { data: OwnerDashboardData; pending: boolean; run: (task: () => Promise<OwnerActionResult>) => void }) {
  const r = data.restaurant; const locked = Boolean(r.publishedAt);
  const [location, setLocation] = useState<RestaurantAddressSelection | null>(() =>
    r.address && r.lat != null && r.lon != null
      ? { formattedAddress: r.address, placeId: "", lat: r.lat, lon: r.lon }
      : null
  );
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); if (!location) { run(async () => ({ ok: false, message: "Hãy xác nhận vị trí nhà hàng trên Google Maps." })); return; } run(() => updateRestaurantProfileAction({ id: r.id, name: String(form.get("name") || ""), description: String(form.get("description") || ""), address: location.formattedAddress, googlePlaceId: location.placeId, phone: String(form.get("phone") || ""), lat: location.lat, lon: location.lon, timezone: String(form.get("timezone") || "Asia/Ho_Chi_Minh") })); };
  return <section className="owner-card"><div className="owner-card__heading"><div><h2>Hồ sơ nhà hàng</h2><p>{locked ? "Sau xuất bản, tên/địa chỉ/tọa độ được khóa để bảo toàn hồ sơ đã duyệt." : "Hoàn tất dữ liệu trước khi xuất bản."}</p></div></div><form className="owner-form" onSubmit={submit}>
    <label>Tên nhà hàng<input name="name" defaultValue={r.name} readOnly={locked} required /></label><label>Số điện thoại<input name="phone" defaultValue={r.phone} /></label>
    <label className="full">Mô tả<textarea name="description" rows={4} defaultValue={r.description} /></label>
    <div className="full owner-address-field"><span>Địa chỉ và vị trí nhà hàng</span><RestaurantAddressField value={location} onChange={setLocation} disabled={locked} /></div>
    <label>Múi giờ<input name="timezone" defaultValue={r.timezone} readOnly={locked} required /></label>
    <div className="full"><button disabled={pending}>Lưu thay đổi</button></div>
  </form></section>;
}

function Hours({ data, pending, run }: { data: OwnerDashboardData; pending: boolean; run: (task: () => Promise<OwnerActionResult>) => void }) {
  const initial = useMemo(() => dayRows(data.hours), [data.hours]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const hours: RestaurantHour[] = []; DAYS.forEach((_, day) => { if (form.get(`enabled-${day}`) === "on") hours.push({ dayOfWeek: day, slotNo: 1, opensAt: String(form.get(`open-${day}`)), closesAt: String(form.get(`close-${day}`)) }); }); run(() => replaceRestaurantHoursAction(data.restaurant.id, hours)); };
  return <section className="owner-card"><div className="owner-card__heading"><div><h2>Giờ mở cửa / đóng cửa</h2><p>Ca qua đêm được hỗ trợ, ví dụ 18:00–02:00.</p></div></div><form className="owner-hours" onSubmit={submit}>{DAYS.map((day, index) => <div key={day} className="owner-hours__row"><label><input type="checkbox" name={`enabled-${index}`} defaultChecked={Boolean(initial[index])} />{day}</label><input type="time" name={`open-${index}`} defaultValue={initial[index]?.opensAt || "08:00"} /><span>đến</span><input type="time" name={`close-${index}`} defaultValue={initial[index]?.closesAt || "22:00"} /></div>)}<button disabled={pending}>Lưu lịch hoạt động</button></form></section>;
}

function Media({ data, pending, run }: { data: OwnerDashboardData; pending: boolean; run: (task: () => Promise<OwnerActionResult>) => void }) {
  const upload = (event: FormEvent<HTMLFormElement>, kind: RestaurantMedia["kind"]) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("image");
    if (!(file instanceof File) || !TYPES[file.type] || file.size > MAX_BYTES) {
      run(async () => ({ ok: false, message: "Ảnh phải là JPG/PNG/WebP/AVIF và không quá 5 MB." }));
      return;
    }
    run(async () => {
      const supabase = createClient();
      let objectPath: string | null = null;
      try {
        const ticket = await createRestaurantMediaUploadTicketAction(
          data.restaurant.id, kind, file.type
        );
        if (!ticket.ok) return ticket;
        objectPath = ticket.objectPath;
        const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(
          ticket.objectPath, ticket.token, file, {
          contentType: file.type, upsert: false,
        });
        if (error) {
          console.error("[owner] Upload ảnh nhà hàng thất bại", error);
          await discardRestaurantMediaUploadAction(data.restaurant.id, kind, ticket.objectPath);
          return { ok: false, message: `Không thể tải ảnh nhà hàng (${error.message}).` };
        }
        const result = await applyRestaurantMediaAction(
          data.restaurant.id, kind, ticket.objectPath, String(values.get("alt") || "")
        );
        if (!result.ok) {
          await discardRestaurantMediaUploadAction(data.restaurant.id, kind, ticket.objectPath);
        }
        else form.reset();
        return result;
      } catch (error) {
        console.error("[owner] Luồng upload ảnh nhà hàng bị gián đoạn", error);
        if (objectPath) {
          await discardRestaurantMediaUploadAction(data.restaurant.id, kind, objectPath);
        }
        return { ok: false, message: "Kết nối bị gián đoạn khi tải ảnh. Vui lòng thử lại." };
      }
    });
  };
  const grouped = (["logo", "cover", "gallery"] as const);
  return <div className="owner-media-grid">{grouped.map((kind) => <section className="owner-card" key={kind}><h2>{kind === "logo" ? "Ảnh đại diện" : kind === "cover" ? "Ảnh bìa nhà hàng" : "Thư viện ảnh"}</h2><div className="owner-media-list">{data.media.filter((item) => item.kind === kind).map((item) => <figure key={item.id}><img src={item.url} alt={item.altText || data.restaurant.name} /><button disabled={pending} onClick={() => run(() => deleteRestaurantMediaAction(item.id))}>Xóa</button></figure>)}</div><form className="owner-upload" onSubmit={(event) => upload(event, kind)}><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><input name="alt" placeholder="Mô tả ảnh" maxLength={180} /><button disabled={pending}>Tải ảnh lên</button></form></section>)}</div>;
}

function Staff({ userId, data, pending, canTransfer, run }: { userId: string; data: OwnerDashboardData; pending: boolean; canTransfer: boolean; run: (task: () => Promise<OwnerActionResult>) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); run(async () => { const result = await inviteRestaurantStaffAction(data.restaurant.id, String(values.get("email") || "")); if (result.ok) form.reset(); return result; }); };
  return <div className="owner-grid"><section className="owner-card"><h2>Mời Restaurant Staff</h2><form className="owner-invite" onSubmit={submit}><input name="email" type="email" placeholder="nhanvien@example.com" required /><button disabled={pending}>Tạo lời mời 7 ngày</button></form><div className="owner-staff-list">{data.invitations.map((item) => <article key={item.id}><div><strong>{item.email}</strong><span>Hết hạn {new Date(item.expiresAt).toLocaleDateString("vi-VN")}</span></div><button disabled={pending} onClick={() => run(() => revokeStaffInvitationAction(item.id))}>Thu hồi</button></article>)}</div></section>
    <section className="owner-card"><h2>Nhân sự đang hoạt động</h2><div className="owner-staff-list">{data.members.map((member) => <article key={member.userId}><div><strong>{member.name}{member.userId === userId ? " (Bạn)" : ""}</strong><span>{member.role === "RESTAURANT_OWNER" ? "Owner" : "Restaurant Staff"}{member.phone ? ` · ${member.phone}` : ""}</span></div>{member.userId !== userId && member.role === "RESTAURANT_STAFF" && <div className="owner-staff-actions">{canTransfer && <button disabled={pending} onClick={() => { if (window.confirm(`Chuyển quyền Owner cho ${member.name}? Bạn sẽ trở thành Staff.`)) run(() => transferRestaurantOwnershipAction(data.restaurant.id, member.userId)); }}>Chuyển Owner</button>}<button className="danger" disabled={pending} onClick={() => run(() => revokeRestaurantMemberAction(data.restaurant.id, member.userId, "Owner thu hồi quyền nhân sự"))}>Thu hồi</button></div>}</article>)}</div></section></div>;
}
