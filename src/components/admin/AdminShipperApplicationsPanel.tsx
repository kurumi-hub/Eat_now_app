"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewShipperApplicationAction } from "@/app/admin/actions";
import type { AdminShipperApplicationList, ShipperApplication } from "@/types/shipper";

const STATUS: Record<string, string> = {
  SUBMITTED: "Chờ tiếp nhận", UNDER_REVIEW: "Đang xét duyệt",
  NEEDS_CHANGES: "Cần bổ sung", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối",
};

export default function AdminShipperApplicationsPanel({ data, statusFilter }: { data: AdminShipperApplicationList; statusFilter: string }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const filter = (status: string) => router.push(`/admin?tab=shippers&view=applications${status ? `&status=${status}` : ""}`);
  const review = (item: ShipperApplication, decision: "start_review" | "needs_changes" | "approve" | "reject") => {
    let note = "";
    if (["needs_changes", "reject"].includes(decision)) {
      note = window.prompt(decision === "reject" ? "Lý do từ chối hồ sơ:" : "Thông tin tài xế cần bổ sung:") || "";
      if (!note) return;
    }
    if (decision === "approve" && !window.confirm(`Duyệt ${item.fullName} làm tài xế EatNow?`)) return;
    startTransition(async () => { const result = await reviewShipperApplicationAction(item.id, decision, note);
      setNotice(result); if (result.ok) router.refresh(); });
  };
  return <section className="admin-panel">
    <div className="admin-panel__heading"><div><h2>Hồ sơ đăng ký tài xế</h2><p>{data.total} hồ sơ trong bộ lọc hiện tại</p></div></div>
    {notice && <div className={`admin-inline-notice ${notice.ok ? "is-success" : "is-error"}`}>{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}
    <div className="admin-filter-row">{[["", "Tất cả"], ["submitted", "Chờ tiếp nhận"], ["under_review", "Đang xét duyệt"], ["needs_changes", "Cần bổ sung"], ["approved", "Đã duyệt"], ["rejected", "Đã từ chối"]].map(([value, label]) => <button key={value} className={statusFilter === value ? "is-active" : ""} onClick={() => filter(value)}>{label}</button>)}</div>
    <div className="admin-list admin-shipper-application-list">{data.items.length ? data.items.map((item) => <article className="admin-shipper-row" key={item.id}>
      <div className="admin-shipper-row__identity"><div className="admin-row-title"><h3>{item.fullName}</h3><span className={`admin-status admin-status--${item.status.toLowerCase()}`}>{STATUS[item.status] || item.status}</span></div><p>{item.email} · {item.phone}</p><small>Ngày sinh: {new Date(item.dateOfBirth).toLocaleDateString("vi-VN")} · Phiên bản {item.revision}</small></div>
      <dl><div><dt>CCCD/CMND</dt><dd>{item.identityNumber}</dd></div><div><dt>GPLX</dt><dd>{item.driverLicenseNumber}</dd></div><div><dt>Phương tiện</dt><dd>{item.vehicleType} · {item.plateNumber}</dd></div></dl>
      {item.reviewNote && <blockquote>{item.reviewNote}</blockquote>}
      <div className="admin-row-actions">{item.status === "SUBMITTED" && <button disabled={pending} onClick={() => review(item, "start_review")}>Tiếp nhận</button>}{["SUBMITTED", "UNDER_REVIEW"].includes(item.status) && <><button className="is-primary" disabled={pending} onClick={() => review(item, "approve")}>Duyệt</button><button disabled={pending} onClick={() => review(item, "needs_changes")}>Yêu cầu bổ sung</button><button className="is-danger" disabled={pending} onClick={() => review(item, "reject")}>Từ chối</button></>}</div>
    </article>) : <div className="admin-empty"><h3>Không có hồ sơ tài xế</h3><p>Thử thay đổi bộ lọc trạng thái.</p></div>}</div>
  </section>;
}
