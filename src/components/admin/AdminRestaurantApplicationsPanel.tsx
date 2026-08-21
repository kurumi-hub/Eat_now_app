"use client";

import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewRestaurantApplicationAction } from "@/app/admin/actions";
import type { AdminRestaurantApplication, AdminRestaurantApplicationList } from "@/types/admin";

const STATUS: Record<string, string> = {
  DRAFT: "Bản nháp", SUBMITTED: "Chờ tiếp nhận", UNDER_REVIEW: "Đang xét duyệt",
  NEEDS_CHANGES: "Cần bổ sung", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối", WITHDRAWN: "Đã rút",
};
type Decision = "start_review" | "request_changes" | "approve" | "reject";

export default function AdminRestaurantApplicationsPanel({ data }: { data: AdminRestaurantApplicationList }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<AdminRestaurantApplication | null>(null);
  const [decision, setDecision] = useState<Decision>("start_review");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);
  const open = (item: AdminRestaurantApplication, next: Decision) => { setTarget(item); setDecision(next); setNote(""); };
  const submit = () => target && startTransition(async () => {
    const result = await reviewRestaurantApplicationAction(target.id, decision, note);
    setNotice(result); if (result.ok) { setTarget(null); router.refresh(); }
  });

  return <section className="admin-panel">
    <div className="admin-panel__heading"><div><h2>Hồ sơ mở nhà hàng</h2><p>{data.total} hồ sơ trong bộ lọc hiện tại</p></div></div>
    <div className="admin-filters">
      {[["", "Tất cả"], ["submitted", "Chờ tiếp nhận"], ["under_review", "Đang xét duyệt"], ["needs_changes", "Cần bổ sung"], ["approved", "Đã duyệt"], ["rejected", "Từ chối"]].map(([value, label]) =>
        <button key={value || "all"} type="button" onClick={() => router.push(value ? `/admin?tab=applications&status=${value}` : "/admin?tab=applications")}>{label}</button>)}
    </div>
    <div className="admin-list admin-application-list">
      {data.items.length === 0 ? <div className="admin-empty"><h3>Không có hồ sơ phù hợp</h3></div> : data.items.map((item) => <article className="admin-restaurant-row" key={item.id}>
        <div className="admin-restaurant-row__body">
          <div className="admin-row-title"><h3>{item.restaurant_name}</h3><span className={`admin-status admin-status--${item.status.toLowerCase()}`}>{STATUS[item.status] || item.status}</span></div>
          <p>{item.address} · {item.phone}</p>
          <small>{item.applicant_name} · {item.applicant_email} · phiên bản {item.revision}</small>
          <dl className="admin-application-details">
            <div><dt>Đại diện</dt><dd>{item.legal_representative_name || "Chưa cung cấp"}</dd></div>
            <div><dt>Giấy phép</dt><dd>{item.business_license_number || "Chưa cung cấp"}</dd></div>
            <div><dt>Mã số thuế</dt><dd>{item.tax_code || "Chưa cung cấp"}</dd></div>
            <div><dt>Tọa độ</dt><dd>{item.lat == null || item.lon == null ? "Chưa xác định" : `${item.lat}, ${item.lon}`}</dd></div>
          </dl>
          {item.review_note && <p className="admin-application-note">Phản hồi: {item.review_note}</p>}
        </div>
        <div className="admin-row-actions">
          {item.status === "SUBMITTED" && <button type="button" onClick={() => open(item, "start_review")}>Tiếp nhận</button>}
          {["SUBMITTED", "UNDER_REVIEW"].includes(item.status) && <>
            <button className="is-primary" type="button" onClick={() => open(item, "approve")}>Duyệt</button>
            <button type="button" onClick={() => open(item, "request_changes")}>Yêu cầu bổ sung</button>
            <button className="is-danger" type="button" onClick={() => open(item, "reject")}>Từ chối</button>
          </>}
        </div>
      </article>)}
    </div>
    <Dialog open={Boolean(target)} onClose={() => !pending && setTarget(null)} fullWidth maxWidth="sm">
      <DialogTitle>Xét duyệt: {target?.restaurant_name}</DialogTitle>
      <DialogContent>
        {decision === "approve" && <Alert severity="warning" sx={{ mb: 2 }}>Duyệt sẽ tạo nhà hàng và gắn người đăng ký làm Owner.</Alert>}
        <TextField fullWidth multiline minRows={3} label={decision === "reject" || decision === "request_changes" ? "Lý do (bắt buộc)" : "Ghi chú"} value={note} onChange={(event) => setNote(event.target.value)} />
      </DialogContent>
      <DialogActions><button className="admin-button" onClick={() => setTarget(null)} disabled={pending}>Hủy</button><button className="admin-button admin-button--primary" onClick={submit} disabled={pending}>Xác nhận</button></DialogActions>
    </Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)}><Alert severity={notice?.ok ? "success" : "error"} variant="filled">{notice?.message}</Alert></Snackbar>
  </section>;
}
