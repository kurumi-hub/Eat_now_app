"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import {
  respondStaffInvitationAction,
  saveSellerApplicationAction,
  submitSellerApplicationAction,
  withdrawSellerApplicationAction,
} from "@/app/account/seller/actions";
import type { SellerContext, StaffInvitation } from "@/types/owner";
import RestaurantAddressField, {
  type RestaurantAddressSelection,
} from "@/components/restaurant/RestaurantAddressField";

const STATUS: Record<string, string> = {
  DRAFT: "Bản nháp", SUBMITTED: "Đã nộp", UNDER_REVIEW: "Đang xét duyệt",
  NEEDS_CHANGES: "Cần bổ sung", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối",
  WITHDRAWN: "Đã rút",
};
const ACTIVE_APPLICATION_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_CHANGES"];
const ORDER_STATE: Record<string, string> = {
  OPEN: "Đang nhận đơn", PAUSED: "Tạm dừng", CLOSED_BY_SCHEDULE: "Ngoài giờ",
  SETUP: "Đang thiết lập", UNPUBLISHED: "Chưa xuất bản", SUSPENDED: "Tạm ngưng",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export default function SellerApplicationPanel({
  context, invitations,
}: { context: SellerContext; invitations: StaffInvitation[] }) {
  const router = useRouter();
  const application = context.application;
  const activeApplication = application && ACTIVE_APPLICATION_STATUSES.includes(application.status)
    ? application : null;
  const editableApplication = activeApplication && ["DRAFT", "NEEDS_CHANGES"].includes(activeApplication.status)
    ? activeApplication : null;
  const waitingApplication = activeApplication && ["SUBMITTED", "UNDER_REVIEW"].includes(activeApplication.status)
    ? activeApplication : null;
  const approvedWithoutRestaurant = application?.status === "APPROVED" && context.restaurants.length === 0;
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [location, setLocation] = useState<RestaurantAddressSelection | null>(() =>
    editableApplication?.address && editableApplication.lat != null && editableApplication.lon != null
      ? {
          formattedAddress: editableApplication.address,
          placeId: "",
          lat: editableApplication.lat,
          lon: editableApplication.lon,
        }
      : null
  );
  const showForm = Boolean(editableApplication) || (!activeApplication && showNewForm);

  const run = (
    task: () => Promise<{ ok: boolean; message: string }>,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      try {
        const result = await task();
        setNotice(result.message);
        if (result.ok) {
          onSuccess?.();
          router.refresh();
        }
      } catch (error) {
        console.error("[seller] Thao tác hồ sơ thất bại", error);
        setNotice("Kết nối bị gián đoạn. Vui lòng thử lại.");
      }
    });
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location) {
      setNotice("Hãy chọn và xác nhận vị trí nhà hàng trên Google Maps.");
      return;
    }
    const data = new FormData(event.currentTarget);
    run(() => saveSellerApplicationAction({
      applicationId: editableApplication?.id,
      restaurantName: String(data.get("restaurantName") || ""),
      description: String(data.get("description") || ""),
      address: location.formattedAddress,
      googlePlaceId: location.placeId,
      phone: String(data.get("phone") || ""),
      lat: location.lat, lon: location.lon,
      timezone: String(data.get("timezone") || "Asia/Ho_Chi_Minh"),
      businessLicenseNumber: String(data.get("businessLicenseNumber") || ""),
      taxCode: String(data.get("taxCode") || ""),
      legalRepresentativeName: String(data.get("legalRepresentativeName") || ""),
    }));
  };

  return <div className="seller-stack">
    {notice && <div className="account-inline-notice" role="status">{notice}</div>}

    {invitations.length > 0 && <section className="account-card">
      <h2>Lời mời làm việc</h2>
      <div className="seller-invitation-list">
        {invitations.map((item) => <article key={item.id} className="seller-invitation">
          <div><strong>{item.restaurantName}</strong><p>Owner: {item.invitedByName} · hết hạn {formatDate(item.expiresAt)}</p></div>
          <div className="seller-actions">
            <button disabled={pending} onClick={() => run(() => respondStaffInvitationAction(item.id, true))}>Chấp nhận</button>
            <button className="secondary" disabled={pending} onClick={() => run(() => respondStaffInvitationAction(item.id, false))}>Từ chối</button>
          </div>
        </article>)}
      </div>
    </section>}

    {context.restaurants.length > 0 && <section className="account-card">
      <div className="seller-section-heading"><div><p className="account-page-heading__eyebrow">Kênh người bán</p><h2>Nhà hàng đang quản lý</h2></div><Link className="seller-primary-link" href="/owner">Mở tổng quan</Link></div>
      <div className="seller-managed-list">
        {context.restaurants.map((item) => <Link key={item.id} href={`/owner?restaurant=${item.id}`}>
          <strong>{item.name}</strong><span>{item.membershipRole === "RESTAURANT_OWNER" ? "Owner" : "Staff"} · {ORDER_STATE[item.orderState] || item.orderState}</span>
        </Link>)}
      </div>
    </section>}

    {waitingApplication && <section className="account-card seller-application-summary">
      <div className="seller-section-heading"><div><p className="account-page-heading__eyebrow">Hồ sơ đang xử lý</p><h2>{waitingApplication.restaurantName}</h2></div><span className={`seller-status seller-status--${waitingApplication.status.toLowerCase()}`}>{STATUS[waitingApplication.status]}</span></div>
      <p>Hồ sơ phiên bản {waitingApplication.revision} đã được gửi lúc {formatDate(waitingApplication.submittedAt)}. Bạn sẽ có thể chỉnh sửa nếu Admin yêu cầu bổ sung.</p>
    </section>}

    {approvedWithoutRestaurant && <section className="account-card seller-application-summary">
      <h2>Đang khởi tạo nhà hàng</h2><p>Hồ sơ đã được duyệt nhưng nhà hàng chưa xuất hiện trong danh sách quản lý. Hãy tải lại trang; nếu vẫn chưa có, kiểm tra migration Owner.</p>
    </section>}

    {!activeApplication && !showNewForm && <section className="account-card seller-application-cta">
      <div><p className="account-page-heading__eyebrow">{context.restaurants.length ? "Mở rộng kinh doanh" : "Bắt đầu bán hàng"}</p><h2>{context.restaurants.length ? "Đăng ký thêm nhà hàng" : "Mở nhà hàng trên EatNow"}</h2><span>Form chỉ mở khi bạn chủ động bắt đầu. Mỗi thời điểm chỉ có một hồ sơ đang xử lý.</span></div>
      <button type="button" onClick={() => { setLocation(null); setShowNewForm(true); setNotice(""); }}>Đăng ký mở nhà hàng mới</button>
    </section>}

    {showForm && <section className="account-card">
      <div className="seller-section-heading">
        <div><p className="account-page-heading__eyebrow">Hồ sơ mở quán</p><h2>{editableApplication ? editableApplication.restaurantName : "Đăng ký nhà hàng mới"}</h2></div>
        {editableApplication && <span className={`seller-status seller-status--${editableApplication.status.toLowerCase()}`}>{STATUS[editableApplication.status]}</span>}
      </div>
      {editableApplication?.reviewNote && <div className="account-inline-notice account-inline-notice--warning"><strong>Phản hồi xét duyệt:</strong> {editableApplication.reviewNote}</div>}
      <form className="seller-form" onSubmit={save}>
        <label>Tên nhà hàng<input name="restaurantName" required minLength={2} maxLength={160} defaultValue={editableApplication?.restaurantName} /></label>
        <label>Số điện thoại<input name="phone" required defaultValue={editableApplication?.phone} /></label>
        <label className="full">Mô tả<textarea name="description" rows={3} defaultValue={editableApplication?.description} /></label>
        <div className="full seller-address-field">
          <span>Địa chỉ và vị trí nhà hàng</span>
          <RestaurantAddressField value={location} onChange={setLocation} />
        </div>
        <label>Múi giờ<input name="timezone" required defaultValue={editableApplication?.timezone || "Asia/Ho_Chi_Minh"} /></label>
        <label>Giấy phép kinh doanh<input name="businessLicenseNumber" defaultValue={editableApplication?.businessLicenseNumber} /></label>
        <label>Mã số thuế<input name="taxCode" defaultValue={editableApplication?.taxCode} /></label>
        <label>Người đại diện<input name="legalRepresentativeName" defaultValue={editableApplication?.legalRepresentativeName} /></label>
        <div className="seller-actions full">
          <button type="submit" disabled={pending}>{pending ? "Đang xử lý…" : "Lưu bản nháp"}</button>
          {editableApplication && <button type="button" disabled={pending} onClick={() => run(() => submitSellerApplicationAction(editableApplication.id))}>Nộp xét duyệt</button>}
          {editableApplication ? <button type="button" className="secondary" disabled={pending} onClick={() => run(() => withdrawSellerApplicationAction(editableApplication.id, "Người đăng ký chủ động rút hồ sơ"), () => setShowNewForm(false))}>Rút hồ sơ</button> : <button type="button" className="secondary" disabled={pending} onClick={() => { setShowNewForm(false); setLocation(null); }}>Hủy</button>}
        </div>
      </form>
    </section>}

    {application?.status !== "APPROVED" && context.timeline.length > 0 && <section className="account-card"><h2>Lịch sử xét duyệt</h2><ol className="seller-timeline">
      {[...context.timeline].reverse().map((event) => <li key={event.id}><strong>{STATUS[event.toStatus] || event.toStatus}</strong><span>{formatDate(event.createdAt)} · phiên bản {event.revision}</span>{event.note && <p>{event.note}</p>}</li>)}
    </ol></section>}
  </div>;
}
