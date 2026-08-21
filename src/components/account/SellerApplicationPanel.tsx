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

const STATUS: Record<string, string> = {
  DRAFT: "Bản nháp", SUBMITTED: "Đã nộp", UNDER_REVIEW: "Đang xét duyệt",
  NEEDS_CHANGES: "Cần bổ sung", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối",
  WITHDRAWN: "Đã rút",
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
  const editable = !application || ["DRAFT", "NEEDS_CHANGES"].includes(application.status);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");

  const run = (task: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await task();
      setNotice(result.message);
      if (result.ok) router.refresh();
    });
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    run(() => saveSellerApplicationAction({
      applicationId: application?.id,
      restaurantName: String(data.get("restaurantName") || ""),
      description: String(data.get("description") || ""),
      address: String(data.get("address") || ""),
      phone: String(data.get("phone") || ""),
      lat: Number(data.get("lat")), lon: Number(data.get("lon")),
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
      <h2>Nhà hàng đang quản lý</h2>
      <div className="seller-managed-list">
        {context.restaurants.map((item) => <Link key={item.id} href={`/owner?restaurant=${item.id}`}>
          <strong>{item.name}</strong><span>{item.membershipRole === "RESTAURANT_OWNER" ? "Owner" : "Staff"} · {item.orderState}</span>
        </Link>)}
      </div>
    </section>}

    <section className="account-card">
      <div className="seller-section-heading">
        <div><p className="account-page-heading__eyebrow">Hồ sơ mở quán</p><h2>{application ? application.restaurantName : "Đăng ký nhà hàng mới"}</h2></div>
        {application && <span className={`seller-status seller-status--${application.status.toLowerCase()}`}>{STATUS[application.status]}</span>}
      </div>
      {application?.reviewNote && <div className="account-inline-notice account-inline-notice--warning"><strong>Phản hồi xét duyệt:</strong> {application.reviewNote}</div>}
      <form className="seller-form" onSubmit={save}>
        <label>Tên nhà hàng<input name="restaurantName" required minLength={2} maxLength={160} defaultValue={application?.restaurantName} disabled={!editable} /></label>
        <label>Số điện thoại<input name="phone" required defaultValue={application?.phone} disabled={!editable} /></label>
        <label className="full">Mô tả<textarea name="description" rows={3} defaultValue={application?.description} disabled={!editable} /></label>
        <label className="full">Địa chỉ<input name="address" required defaultValue={application?.address} disabled={!editable} /></label>
        <label>Vĩ độ<input name="lat" type="number" step="any" required defaultValue={application?.lat} disabled={!editable} /></label>
        <label>Kinh độ<input name="lon" type="number" step="any" required defaultValue={application?.lon} disabled={!editable} /></label>
        <label>Múi giờ<input name="timezone" required defaultValue={application?.timezone || "Asia/Ho_Chi_Minh"} disabled={!editable} /></label>
        <label>Giấy phép kinh doanh<input name="businessLicenseNumber" defaultValue={application?.businessLicenseNumber} disabled={!editable} /></label>
        <label>Mã số thuế<input name="taxCode" defaultValue={application?.taxCode} disabled={!editable} /></label>
        <label>Người đại diện<input name="legalRepresentativeName" defaultValue={application?.legalRepresentativeName} disabled={!editable} /></label>
        {editable && <div className="seller-actions full">
          <button type="submit" disabled={pending}>{pending ? "Đang xử lý…" : "Lưu bản nháp"}</button>
          {application && <button type="button" disabled={pending} onClick={() => run(() => submitSellerApplicationAction(application.id))}>Nộp xét duyệt</button>}
          {application && <button type="button" className="secondary" disabled={pending} onClick={() => run(() => withdrawSellerApplicationAction(application.id, "Người đăng ký chủ động rút hồ sơ"))}>Rút hồ sơ</button>}
        </div>}
      </form>
    </section>

    {context.timeline.length > 0 && <section className="account-card"><h2>Lịch sử xét duyệt</h2><ol className="seller-timeline">
      {[...context.timeline].reverse().map((event) => <li key={event.id}><strong>{STATUS[event.toStatus] || event.toStatus}</strong><span>{formatDate(event.createdAt)} · phiên bản {event.revision}</span>{event.note && <p>{event.note}</p>}</li>)}
    </ol></section>}
  </div>;
}
