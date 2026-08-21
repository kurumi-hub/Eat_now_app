"use client";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewRestaurantApplicationAction } from "@/app/admin/actions";
import type {
  AdminRestaurantApplication,
  AdminRestaurantApplicationList,
} from "@/types/admin";

const STATUS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ tiếp nhận",
  UNDER_REVIEW: "Đang xét duyệt",
  NEEDS_CHANGES: "Cần bổ sung",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  WITHDRAWN: "Đã rút",
};

const FILTERS = [
  ["", "Tất cả"],
  ["submitted", "Chờ tiếp nhận"],
  ["under_review", "Đang xét duyệt"],
  ["needs_changes", "Cần bổ sung"],
  ["approved", "Đã duyệt"],
  ["rejected", "Từ chối"],
] as const;

type Decision = "start_review" | "request_changes" | "approve" | "reject";

const DECISIONS: Record<Decision, {
  title: string;
  description: string;
  confirmLabel: string;
  severity: "info" | "success" | "warning" | "error";
  reasonRequired: boolean;
}> = {
  start_review: {
    title: "Tiếp nhận hồ sơ",
    description: "Hồ sơ sẽ chuyển sang trạng thái đang xét duyệt.",
    confirmLabel: "Xác nhận tiếp nhận",
    severity: "info",
    reasonRequired: false,
  },
  approve: {
    title: "Duyệt hồ sơ",
    description: "Hệ thống sẽ tạo nhà hàng ở trạng thái thiết lập và gắn người đăng ký làm Owner.",
    confirmLabel: "Duyệt và tạo nhà hàng",
    severity: "success",
    reasonRequired: false,
  },
  request_changes: {
    title: "Yêu cầu bổ sung",
    description: "Người đăng ký sẽ nhận được nội dung cần chỉnh sửa và có thể nộp lại phiên bản mới.",
    confirmLabel: "Gửi yêu cầu bổ sung",
    severity: "warning",
    reasonRequired: true,
  },
  reject: {
    title: "Từ chối hồ sơ",
    description: "Đây là trạng thái kết thúc. Hãy ghi rõ lý do để người đăng ký hiểu quyết định.",
    confirmLabel: "Xác nhận từ chối",
    severity: "error",
    reasonRequired: true,
  },
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa có thời gian";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminRestaurantApplicationsPanel({
  data,
  statusFilter,
}: {
  data: AdminRestaurantApplicationList;
  statusFilter: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<AdminRestaurantApplication | null>(null);
  const [decision, setDecision] = useState<Decision>("start_review");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);
  const decisionConfig = DECISIONS[decision];
  const invalidReason = decisionConfig.reasonRequired && note.trim().length < 5;

  const open = (item: AdminRestaurantApplication, next: Decision) => {
    setTarget(item);
    setDecision(next);
    setNote("");
  };

  const submit = () => {
    if (!target || invalidReason) return;
    startTransition(async () => {
      const result = await reviewRestaurantApplicationAction(
        target.id,
        decision,
        note
      );
      setNotice(result);
      if (result.ok) {
        setTarget(null);
        router.refresh();
      }
    });
  };

  return <section className="admin-panel admin-application-panel">
    <div className="admin-panel__heading admin-application-heading">
      <div>
        <p className="admin-application-heading__eyebrow">Kiểm duyệt đối tác</p>
        <h2>Hồ sơ mở nhà hàng</h2>
        <p>{data.total} hồ sơ trong bộ lọc hiện tại</p>
      </div>
    </div>

    <div className="admin-filters admin-application-filters" aria-label="Lọc trạng thái hồ sơ">
      {FILTERS.map(([value, label]) => <button
        key={value || "all"}
        type="button"
        className={statusFilter === value ? "is-active" : ""}
        aria-pressed={statusFilter === value}
        onClick={() => router.push(
          value ? `/admin?tab=applications&status=${value}` : "/admin?tab=applications"
        )}
      >
        {label}
      </button>)}
    </div>

    <div className="admin-application-list">
      {data.items.length === 0
        ? <div className="admin-empty">
            <StorefrontOutlinedIcon />
            <h3>Không có hồ sơ phù hợp</h3>
            <p>Hãy chọn một trạng thái khác để tiếp tục kiểm tra.</p>
          </div>
        : data.items.map((item) => <article className="admin-application-card" key={item.id}>
            <header className="admin-application-card__header">
              <span className="admin-application-card__icon"><StorefrontOutlinedIcon /></span>
              <div className="admin-application-card__title">
                <div>
                  <h3>{item.restaurant_name}</h3>
                  <span className={`admin-application-status admin-application-status--${item.status.toLowerCase()}`}>
                    {STATUS[item.status] || item.status}
                  </span>
                </div>
                <p>Mã hồ sơ: {item.id.slice(0, 8).toUpperCase()} · Phiên bản {item.revision}</p>
              </div>
              <div className="admin-application-card__time">
                <span>{item.status === "UNDER_REVIEW" ? "Tiếp nhận lúc" : "Nộp lúc"}</span>
                <strong>{formatDate(item.review_started_at || item.submitted_at)}</strong>
              </div>
            </header>

            <div className="admin-application-card__content">
              <section className="admin-application-summary">
                <h4>Thông tin nhà hàng</h4>
                <div className="admin-application-info-row admin-application-info-row--address">
                  <LocationOnOutlinedIcon />
                  <div><span>Địa chỉ</span><strong>{item.address}</strong></div>
                </div>
                <div className="admin-application-contact-grid">
                  <div className="admin-application-info-row">
                    <PhoneOutlinedIcon />
                    <div><span>Điện thoại quán</span><strong>{item.phone}</strong></div>
                  </div>
                  <div className="admin-application-info-row">
                    <BadgeOutlinedIcon />
                    <div><span>Người đăng ký</span><strong>{item.applicant_name}</strong></div>
                  </div>
                  <div className="admin-application-info-row">
                    <EmailOutlinedIcon />
                    <div><span>Email</span><strong>{item.applicant_email}</strong></div>
                  </div>
                  <div className="admin-application-info-row">
                    <LocationOnOutlinedIcon />
                    <div><span>Tọa độ</span><strong>{item.lat == null || item.lon == null ? "Chưa xác định" : `${item.lat}, ${item.lon}`}</strong></div>
                  </div>
                </div>
                {item.description && <div className="admin-application-description">
                  <span>Mô tả nhà hàng</span>
                  <p>{item.description}</p>
                </div>}
              </section>

              <aside className="admin-application-legal">
                <div className="admin-application-legal__heading">
                  <BusinessOutlinedIcon />
                  <h4>Thông tin pháp lý</h4>
                </div>
                <dl>
                  <div><dt>Người đại diện</dt><dd>{item.legal_representative_name || "Chưa cung cấp"}</dd></div>
                  <div><dt>Giấy phép kinh doanh</dt><dd>{item.business_license_number || "Chưa cung cấp"}</dd></div>
                  <div><dt>Mã số thuế</dt><dd>{item.tax_code || "Chưa cung cấp"}</dd></div>
                  <div><dt>Múi giờ</dt><dd>{item.timezone || "Asia/Ho_Chi_Minh"}</dd></div>
                </dl>
              </aside>
            </div>

            {item.review_note && <div className="admin-application-note">
              <strong>Phản hồi gần nhất</strong>
              <p>{item.review_note}</p>
            </div>}

            <footer className="admin-application-card__footer">
              <span>
                {item.status === "SUBMITTED" && "Hồ sơ đang chờ Admin tiếp nhận."}
                {item.status === "UNDER_REVIEW" && "Hãy kiểm tra đủ thông tin trước khi quyết định."}
                {item.status === "NEEDS_CHANGES" && "Đang chờ người đăng ký bổ sung hồ sơ."}
                {item.status === "APPROVED" && `Đã duyệt ${formatDate(item.reviewed_at)}.`}
                {item.status === "REJECTED" && `Đã từ chối ${formatDate(item.reviewed_at)}.`}
              </span>
              <div className="admin-application-actions">
                {item.status === "SUBMITTED" && <>
                  <button className="is-primary" type="button" onClick={() => open(item, "start_review")}>Tiếp nhận hồ sơ</button>
                  <button className="is-danger-outline" type="button" onClick={() => open(item, "reject")}>Từ chối</button>
                </>}
                {item.status === "UNDER_REVIEW" && <>
                  <button className="is-primary" type="button" onClick={() => open(item, "approve")}>Duyệt hồ sơ</button>
                  <button type="button" onClick={() => open(item, "request_changes")}>Yêu cầu bổ sung</button>
                  <button className="is-danger-outline" type="button" onClick={() => open(item, "reject")}>Từ chối</button>
                </>}
              </div>
            </footer>
          </article>)}
    </div>

    <Dialog
      open={Boolean(target)}
      onClose={() => !pending && setTarget(null)}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: "admin-dialog admin-application-dialog" } }}
    >
      <DialogTitle className="admin-application-dialog__title">
        <span>{decisionConfig.title}</span>
        <small>{target?.restaurant_name}</small>
      </DialogTitle>
      <DialogContent>
        <Alert severity={decisionConfig.severity} sx={{ mb: 2 }}>
          {decisionConfig.description}
        </Alert>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label={decisionConfig.reasonRequired ? "Lý do xử lý (bắt buộc)" : "Ghi chú nội bộ (không bắt buộc)"}
          value={note}
          error={decisionConfig.reasonRequired && note.length > 0 && note.trim().length < 5}
          helperText={decisionConfig.reasonRequired ? "Nhập ít nhất 5 ký tự; nội dung này sẽ hiển thị cho người đăng ký." : "Có thể để trống."}
          onChange={(event) => setNote(event.target.value.slice(0, 1000))}
        />
      </DialogContent>
      <DialogActions className="admin-dialog__actions admin-application-dialog__actions">
        <button className="admin-button" onClick={() => setTarget(null)} disabled={pending}>Hủy</button>
        <button
          className={`admin-button admin-button--primary${decision === "reject" ? " is-danger" : ""}`}
          onClick={submit}
          disabled={pending || invalidReason}
        >
          {pending ? "Đang xử lý…" : decisionConfig.confirmLabel}
        </button>
      </DialogActions>
    </Dialog>

    <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)}>
      <Alert severity={notice?.ok ? "success" : "error"} variant="filled">{notice?.message}</Alert>
    </Snackbar>
  </section>;
}
