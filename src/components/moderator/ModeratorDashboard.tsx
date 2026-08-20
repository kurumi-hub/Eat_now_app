"use client";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  claimReportAction,
  dismissReportAction,
  escalateReportAction,
  moderateReviewAction,
} from "@/app/moderator/actions";
import type { PublicUser } from "@/types/auth";
import type {
  ModerationQueue,
  ModerationReport,
  ModerationStatus,
  ModeratorActionResult,
  ModeratorDashboardStats,
} from "@/types/moderator";
import { signalNavigationStart } from "@/utils/navigationFeedback";

type StatusFilter = ModerationStatus | "all";
type DialogMode = "hide" | "restore" | "dismiss" | "escalate";

type ModeratorDashboardProps = {
  user: PublicUser;
  stats: ModeratorDashboardStats;
  queue: ModerationQueue;
  activeStatus: StatusFilter;
  loadError?: string;
};

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Chờ xử lý" },
  { value: "in_review", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "dismissed", label: "Đã bác" },
];

const STATUS_LABELS: Record<ModerationStatus, string> = {
  open: "Chờ xử lý",
  in_review: "Đang xử lý",
  resolved: "Đã xử lý",
  dismissed: "Đã bác",
};

const PRIORITY_LABELS = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
  urgent: "Khẩn cấp",
};

const ENTITY_LABELS: Record<string, string> = {
  restaurant_review: "Đánh giá nhà hàng",
  food_review: "Đánh giá món ăn",
  shipper_review: "Đánh giá tài xế",
  restaurant: "Nhà hàng",
  food: "Món ăn",
  user: "Người dùng",
  order: "Đơn hàng",
};

const DIALOG_COPY: Record<
  DialogMode,
  { title: string; label: string; submit: string }
> = {
  hide: {
    title: "Ẩn đánh giá vi phạm",
    label: "Lý do ẩn đánh giá",
    submit: "Ẩn và đóng báo cáo",
  },
  restore: {
    title: "Khôi phục đánh giá",
    label: "Lý do khôi phục",
    submit: "Khôi phục đánh giá",
  },
  dismiss: {
    title: "Bác báo cáo",
    label: "Lý do báo cáo không hợp lệ",
    submit: "Xác nhận bác báo cáo",
  },
  escalate: {
    title: "Chuyển báo cáo cho Admin",
    label: "Vấn đề cần Admin xem xét",
    submit: "Chuyển cấp xử lý",
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function isReview(report: ModerationReport) {
  return ["restaurant_review", "food_review", "shipper_review"].includes(
    report.entity_type
  );
}

function getTargetTitle(report: ModerationReport) {
  const target = report.target;
  if (!target) return `Mã đối tượng: ${report.entity_id.slice(0, 8)}`;

  const title = target.name || target.full_name || target.code;
  if (typeof title === "string" && title.trim()) return title;

  if (isReview(report) && typeof target.rating === "number") {
    return `Đánh giá ${target.rating}/5 sao`;
  }

  return `Mã đối tượng: ${report.entity_id.slice(0, 8)}`;
}

function getEntityIcon(entityType: string) {
  if (entityType.includes("review")) return <StarRoundedIcon />;
  if (entityType === "restaurant") return <RestaurantRoundedIcon />;
  if (entityType === "food") return <FastfoodRoundedIcon />;
  if (entityType === "user") return <PersonRoundedIcon />;
  if (entityType === "order") return <ReceiptLongRoundedIcon />;
  return <ReportProblemRoundedIcon />;
}

export default function ModeratorDashboard({
  user,
  stats,
  queue,
  activeStatus,
  loadError,
}: ModeratorDashboardProps) {
  const router = useRouter();
  const canReview = user.permissions.includes("moderation.review");
  const canResolve = user.permissions.includes("moderation.resolve");
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(activeStatus);
  const [dialog, setDialog] = useState<{
    mode: DialogMode;
    report: ModerationReport;
  } | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setOptimisticStatus(activeStatus);
  }, [activeStatus]);

  const filterHref = (status: StatusFilter) =>
    status === "all" ? "/moderator" : `/moderator?status=${status}`;

  const notify = (result: ModeratorActionResult) => {
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.ok ? "success" : "error",
    });
  };

  const runAction = (action: () => Promise<ModeratorActionResult>) => {
    startTransition(async () => {
      try {
        const result = await action();
        notify(result);
        if (result.ok) {
          setDialog(null);
          setNote("");
        }
      } catch {
        notify({
          ok: false,
          message: "Kết nối bị gián đoạn. Vui lòng thử lại.",
        });
      }
    });
  };

  const openDialog = (mode: DialogMode, report: ModerationReport) => {
    setNote("");
    setNoteError("");
    setDialog({ mode, report });
  };

  const submitDialog = () => {
    if (!dialog) return;
    if (note.trim().length < 5) {
      setNoteError("Vui lòng nhập ít nhất 5 ký tự.");
      return;
    }

    const { mode, report } = dialog;
    if (mode === "dismiss") {
      runAction(() => dismissReportAction(report.id, note));
    } else if (mode === "escalate") {
      runAction(() => escalateReportAction(report.id, note));
    } else {
      runAction(() =>
        moderateReviewAction(
          report.entity_type,
          report.entity_id,
          mode,
          note,
          report.id
        )
      );
    }
  };

  const changeFilter = (status: StatusFilter) => {
    if (status === activeStatus) return;
    setOptimisticStatus(status);
    signalNavigationStart();
    startTransition(() => {
      router.push(filterHref(status));
    });
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams();
    if (activeStatus !== "all") params.set("status", activeStatus);
    if (page > 1) params.set("page", String(page));
    signalNavigationStart();
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/moderator?${query}` : "/moderator");
    });
  };

  const currentPage = Math.floor(queue.offset / queue.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(queue.total / queue.limit));

  return (
    <div className="moderator-page">
      <main className="moderator-main">
        <div className="moderator-content">
          <section id="overview" className="moderator-heading">
            <div>
              <p className="moderator-eyebrow">
                <ShieldRoundedIcon /> Không gian kiểm duyệt
              </p>
              <h1>Chào {user.fullName.split(" ").slice(-1)[0]}, cùng giữ EatNow an toàn.</h1>
              <p>Báo cáo mới được ưu tiên theo mức độ và thời gian gửi.</p>
            </div>
            <div className="moderator-heading__status">
              <span /> Đang trực tuyến
            </div>
          </section>

          {loadError ? <Alert severity="warning">{loadError}</Alert> : null}

          <section className="moderator-stats" aria-label="Thống kê kiểm duyệt">
            <article className="moderator-stat moderator-stat--orange">
              <span className="moderator-stat__icon"><ReportProblemRoundedIcon /></span>
              <div><strong>{stats.open}</strong><span>Chờ xử lý</span></div>
              <small>Cần xem xét</small>
            </article>
            <article className="moderator-stat moderator-stat--blue">
              <span className="moderator-stat__icon"><AssignmentIndRoundedIcon /></span>
              <div><strong>{stats.in_review}</strong><span>Đang xử lý</span></div>
              <small>Đã được nhận</small>
            </article>
            <article className="moderator-stat moderator-stat--red">
              <span className="moderator-stat__icon"><PriorityHighRoundedIcon /></span>
              <div><strong>{stats.urgent}</strong><span>Khẩn cấp</span></div>
              <small>Ưu tiên cao nhất</small>
            </article>
            <article className="moderator-stat moderator-stat--green">
              <span className="moderator-stat__icon"><CheckCircleRoundedIcon /></span>
              <div><strong>{stats.resolved_today}</strong><span>Xong hôm nay</span></div>
              <small>Đã lưu nhật ký</small>
            </article>
          </section>

          <section id="queue" className="moderator-queue">
            <div className="moderator-section-heading">
              <div>
                <h2>Hàng đợi báo cáo</h2>
                <p>{queue.total} báo cáo trong bộ lọc hiện tại</p>
              </div>
              <span className="moderator-sync"><i /> Dữ liệu trực tiếp</span>
            </div>

            <div className="moderator-filters" role="group" aria-label="Lọc trạng thái">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onPointerEnter={() => router.prefetch(filterHref(filter.value))}
                  onFocus={() => router.prefetch(filterHref(filter.value))}
                  onClick={() => changeFilter(filter.value)}
                  className={optimisticStatus === filter.value ? "is-active" : ""}
                  aria-pressed={optimisticStatus === filter.value}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="moderator-report-list">
              {queue.items.length === 0 ? (
                <div className="moderator-empty">
                  <CheckCircleRoundedIcon />
                  <h3>Không có báo cáo trong mục này</h3>
                  <p>Hàng đợi đã được xử lý gọn gàng.</p>
                </div>
              ) : (
                queue.items.map((report) => {
                  const closed = ["resolved", "dismissed"].includes(report.status);
                  const review = isReview(report);
                  const hidden = report.target?.moderation_status === "hidden";
                  const assignedToOther = Boolean(
                    report.assigned_to && report.assigned_to !== user.id
                  );

                  return (
                    <article key={report.id} className="moderator-report">
                      <div className={`moderator-report__entity moderator-report__entity--${report.priority}`}>
                        {getEntityIcon(report.entity_type)}
                      </div>
                      <div className="moderator-report__body">
                        <div className="moderator-report__topline">
                          <div className="moderator-report__badges">
                            <span className={`moderator-badge moderator-badge--${report.priority}`}>
                              {PRIORITY_LABELS[report.priority] ?? report.priority}
                            </span>
                            <span className={`moderator-badge moderator-badge--${report.status}`}>
                              {STATUS_LABELS[report.status] ?? report.status}
                            </span>
                          </div>
                          <time>{formatDate(report.created_at)}</time>
                        </div>
                        <p className="moderator-report__kind">
                          {ENTITY_LABELS[report.entity_type] ?? report.entity_type}
                        </p>
                        <h3>{getTargetTitle(report)}</h3>
                        <p className="moderator-report__reason"><strong>Lý do:</strong> {report.reason}</p>
                        {report.description ? <p>{report.description}</p> : null}
                        {typeof report.target?.comment === "string" && report.target.comment ? (
                          <blockquote>“{report.target.comment}”</blockquote>
                        ) : null}
                        <div className="moderator-report__meta">
                          <span>Người báo cáo: <strong>{report.reporter?.full_name || "Ẩn danh"}</strong></span>
                          {assignedToOther ? <span className="is-assigned">Đã có Moderator nhận</span> : null}
                        </div>
                      </div>
                      <div className="moderator-report__actions">
                        {!closed && !report.assigned_to ? (
                          <button
                            type="button"
                            className="moderator-button moderator-button--primary"
                            disabled={isPending}
                            onClick={() => runAction(() => claimReportAction(report.id))}
                          >
                            Nhận xử lý
                          </button>
                        ) : null}
                        {!closed && !assignedToOther && review && canReview ? (
                          <button
                            type="button"
                            className="moderator-button moderator-button--primary"
                            disabled={isPending}
                            onClick={() => openDialog(hidden ? "restore" : "hide", report)}
                          >
                            <GavelRoundedIcon /> {hidden ? "Khôi phục" : "Ẩn đánh giá"}
                          </button>
                        ) : null}
                        {!closed && !assignedToOther && canResolve ? (
                          <>
                            <button
                              type="button"
                              className="moderator-button"
                              disabled={isPending}
                              onClick={() => openDialog("dismiss", report)}
                            >
                              Bác báo cáo
                            </button>
                            <button
                              type="button"
                              className="moderator-button moderator-button--text"
                              disabled={isPending}
                              onClick={() => openDialog("escalate", report)}
                            >
                              Chuyển Admin
                            </button>
                          </>
                        ) : null}
                        {closed ? (
                          <span className="moderator-report__done">
                            <CheckCircleRoundedIcon /> Hoàn tất
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            {queue.total > queue.limit || queue.offset > 0 ? (
              <nav className="moderator-pagination" aria-label="Phân trang báo cáo">
                <button
                  type="button"
                  disabled={isPending || currentPage <= 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Trang trước
                </button>
                <span>
                  Trang <strong>{currentPage}</strong> / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={isPending || currentPage >= totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Trang sau
                </button>
              </nav>
            ) : null}
          </section>
        </div>
      </main>

      <Dialog
        open={Boolean(dialog)}
        onClose={isPending ? undefined : () => setDialog(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "moderator-dialog" } }}
      >
        {dialog ? (
          <>
            <DialogTitle className="moderator-dialog__title">
              <span>{DIALOG_COPY[dialog.mode].title}</span>
              <IconButton aria-label="Đóng" onClick={() => setDialog(null)} disabled={isPending}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <p className="moderator-dialog__context">
                {ENTITY_LABELS[dialog.report.entity_type] ?? dialog.report.entity_type}: <strong>{getTargetTitle(dialog.report)}</strong>
              </p>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={4}
                label={DIALOG_COPY[dialog.mode].label}
                value={note}
                error={Boolean(noteError)}
                helperText={noteError || `${note.length}/1000 ký tự`}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                onChange={(event) => {
                  setNote(event.target.value);
                  setNoteError("");
                }}
              />
            </DialogContent>
            <DialogActions className="moderator-dialog__actions">
              <button type="button" className="moderator-button" onClick={() => setDialog(null)} disabled={isPending}>
                Hủy
              </button>
              <button type="button" className="moderator-button moderator-button--primary" onClick={submitDialog} disabled={isPending}>
                {isPending ? <CircularProgress size={18} color="inherit" /> : null}
                {DIALOG_COPY[dialog.mode].submit}
              </button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
