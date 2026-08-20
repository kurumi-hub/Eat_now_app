"use client";

import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  Alert,
  Avatar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import {
  applySiteMediaAction,
  reviewRefundAction,
  reviewRestaurantAction,
  resetSiteMediaAction,
  setAdminRoleAction,
  setModeratorRoleAction,
  setUserActiveAction,
  transferOwnerAction,
} from "@/app/admin/actions";
import type {
  AdminActionResult,
  AdminAuditList,
  AdminDashboardStats,
  AdminRefund,
  AdminRefundList,
  AdminRestaurant,
  AdminRestaurantList,
  AdminSiteMedia,
  AdminTab,
  AdminUser,
  AdminUserList,
} from "@/types/admin";
import type { PublicUser } from "@/types/auth";
import type { SiteMediaSlot } from "@/types/siteMedia";
import { formatRole, hasRole } from "@/utils/roles";
import { signalNavigationStart } from "@/utils/navigationFeedback";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

const SITE_MEDIA_BUCKET = "site-media";
const SITE_MEDIA_MAX_BYTES = 8 * 1024 * 1024;
const SITE_MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

type AdminDashboardProps = {
  user: PublicUser;
  tab: AdminTab;
  searchTerm: string;
  statusFilter: string;
  stats: AdminDashboardStats;
  users: AdminUserList;
  restaurants: AdminRestaurantList;
  refunds: AdminRefundList;
  media: AdminSiteMedia;
  audit: AdminAuditList;
  loadError?: string;
};

type DialogState =
  | { kind: "user_status"; target: AdminUser; activate: boolean }
  | { kind: "moderator_role"; target: AdminUser; assign: boolean }
  | { kind: "admin_role"; target: AdminUser; assign: boolean }
  | { kind: "transfer_owner"; target: AdminUser }
  | {
      kind: "restaurant";
      target: AdminRestaurant;
      decision: "approve" | "reject" | "suspend" | "reactivate";
    }
  | { kind: "refund"; target: AdminRefund; decision: "approve" | "reject" };

const TABS: Array<{
  value: AdminTab;
  label: string;
  icon: typeof DashboardOutlinedIcon;
}> = [
  { value: "overview", label: "Tổng quan", icon: DashboardOutlinedIcon },
  { value: "users", label: "Tài khoản & phân quyền", icon: PeopleOutlineOutlinedIcon },
  { value: "restaurants", label: "Nhà hàng", icon: StorefrontOutlinedIcon },
  { value: "refunds", label: "Hoàn tiền", icon: CurrencyExchangeOutlinedIcon },
  { value: "media", label: "Hình ảnh", icon: PhotoLibraryOutlinedIcon },
  { value: "audit", label: "Nhật ký", icon: HistoryOutlinedIcon },
];

const ACTION_LABELS: Record<string, string> = {
  assign_admin: "Bổ nhiệm Admin",
  revoke_admin: "Thu hồi Admin",
  assign_moderator: "Bổ nhiệm Moderator",
  revoke_moderator: "Thu hồi Moderator",
  suspend_user: "Khóa tài khoản",
  reactivate_user: "Mở tài khoản",
  restaurant_approve: "Duyệt nhà hàng",
  restaurant_reject: "Từ chối nhà hàng",
  restaurant_suspend: "Tạm ngưng nhà hàng",
  restaurant_reactivate: "Mở lại nhà hàng",
  refund_approve: "Duyệt hoàn tiền",
  refund_reject: "Từ chối hoàn tiền",
  transfer_super_admin_in: "Nhận quyền Chủ nền tảng",
  transfer_super_admin_out: "Chuyển quyền Chủ nền tảng",
  site_media_update: "Cập nhật ảnh giao diện",
  site_media_reset: "Khôi phục ảnh giao diện",
};

const REFUND_STATUS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  processing: "Đang hoàn",
  success: "Hoàn thành",
  failed: "Thất bại",
  rejected: "Đã từ chối",
};

const RESTAURANT_DECISION_LABELS = {
  approve: "Duyệt nhà hàng",
  reject: "Từ chối hồ sơ",
  suspend: "Tạm ngưng nhà hàng",
  reactivate: "Mở lại nhà hàng",
};

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((word) => word[0]).join("").toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(value);
}

function restaurantStatus(item: AdminRestaurant) {
  if (!item.is_active) return { key: "suspended", label: "Tạm ngưng" };
  if (!item.is_verified) return { key: "pending", label: "Chờ duyệt" };
  return { key: "active", label: "Đang hoạt động" };
}

export default function AdminDashboard({
  user,
  tab,
  searchTerm,
  statusFilter,
  stats,
  users,
  restaurants,
  refunds,
  media,
  audit,
  loadError,
}: AdminDashboardProps) {
  const router = useRouter();
  const isSuperAdmin = hasRole(user, "SUPER_ADMIN");
  const canManageModerator = user.permissions.includes("staff.moderator.manage");
  const canManageAdmin = user.permissions.includes("staff.admin.manage");
  const canTransferOwner = user.permissions.includes("ownership.transfer");
  const canManageMedia = user.permissions.includes("site_media.manage");
  const visibleTabs = TABS.filter(
    (item) => item.value !== "media" || canManageMedia
  );
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchTerm);
  const [optimisticTab, setOptimisticTab] = useState(tab);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setOptimisticTab(tab);
  }, [tab]);

  const tabHref = (nextTab: AdminTab) =>
    nextTab === "overview" ? "/admin" : `/admin?tab=${nextTab}`;

  const notify = (result: AdminActionResult) => {
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.ok ? "success" : "error",
    });
  };

  const runAction = (action: () => Promise<AdminActionResult>) => {
    startTransition(async () => {
      try {
        const result = await action();
        notify(result);
        if (result.ok) {
          setDialog(null);
          setNote("");
          setAmount("");
        }
      } catch {
        notify({ ok: false, message: "Kết nối bị gián đoạn. Vui lòng thử lại." });
      }
    });
  };

  const openDialog = (next: DialogState) => {
    setDialog(next);
    setNote("");
    setFieldError("");
    setAmount(next.kind === "refund" ? String(next.target.requested_amount) : "");
  };

  const submitDialog = () => {
    if (!dialog) return;
    if (["user_status", "restaurant", "refund"].includes(dialog.kind) && note.trim().length < 5) {
      setFieldError("Vui lòng nhập ít nhất 5 ký tự.");
      return;
    }

    if (dialog.kind === "user_status") {
      runAction(() => setUserActiveAction(dialog.target.id, dialog.activate, note));
    } else if (dialog.kind === "moderator_role") {
      runAction(() => setModeratorRoleAction(dialog.target.id, dialog.assign));
    } else if (dialog.kind === "admin_role") {
      runAction(() => setAdminRoleAction(dialog.target.id, dialog.assign));
    } else if (dialog.kind === "transfer_owner") {
      runAction(() => transferOwnerAction(dialog.target.id, note));
    } else if (dialog.kind === "restaurant") {
      runAction(() => reviewRestaurantAction(dialog.target.id, dialog.decision, note));
    } else {
      runAction(() => reviewRefundAction(dialog.target.id, dialog.decision, amount, note));
    }
  };

  const goToTab = (nextTab: AdminTab) => {
    if (nextTab === tab) return;
    setSearch("");
    setOptimisticTab(nextTab);
    signalNavigationStart();
    startTransition(() => {
      router.push(tabHref(nextTab));
    });
  };

  const setStatus = (status: string) => {
    const params = new URLSearchParams({ tab });
    if (searchTerm) params.set("q", searchTerm);
    if (status) params.set("status", status);
    signalNavigationStart();
    startTransition(() => router.push(`/admin?${params.toString()}`));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ tab });
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    signalNavigationStart();
    startTransition(() => router.push(`/admin?${params.toString()}`));
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams({ tab });
    if (searchTerm) params.set("q", searchTerm);
    if (statusFilter) params.set("status", statusFilter);
    if (page > 1) params.set("page", String(page));
    signalNavigationStart();
    startTransition(() => router.push(`/admin?${params.toString()}`));
  };

  const submitMedia = (
    event: FormEvent<HTMLFormElement>,
    slot: SiteMediaSlot
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    runAction(async () => {
      const file = formData.get("image");
      const altText = String(formData.get("altText") ?? "");
      if (!(file instanceof File) || file.size === 0) {
        return { ok: false, message: "Vui lòng chọn một tệp ảnh." };
      }
      const extension = SITE_MEDIA_TYPES[file.type];
      if (!extension) {
        return { ok: false, message: "Chỉ hỗ trợ JPG, PNG, WebP hoặc AVIF." };
      }
      if (file.size > SITE_MEDIA_MAX_BYTES) {
        return { ok: false, message: "Ảnh không được lớn hơn 8 MB." };
      }

      const supabase = createBrowserClient();
      const objectPath = `${slot}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(SITE_MEDIA_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) {
        return {
          ok: false,
          message: "Không thể tải ảnh lên Supabase Storage.",
        };
      }

      let result: AdminActionResult;
      try {
        result = await applySiteMediaAction(slot, objectPath, altText);
      } catch (error) {
        await supabase.storage.from(SITE_MEDIA_BUCKET).remove([objectPath]);
        throw error;
      }
      if (!result.ok) {
        await supabase.storage.from(SITE_MEDIA_BUCKET).remove([objectPath]);
      }
      if (result.ok) form.reset();
      return result;
    });
  };

  const resetMedia = (slot: SiteMediaSlot) => {
    runAction(() => resetSiteMediaAction(slot));
  };

  const pageData =
    tab === "users"
      ? users
      : tab === "restaurants"
        ? restaurants
        : tab === "refunds"
          ? refunds
          : tab === "audit"
            ? audit
            : null;

  const dialogTitle = (() => {
    if (!dialog) return "";
    if (dialog.kind === "user_status") return dialog.activate ? "Mở lại tài khoản" : "Tạm khóa tài khoản";
    if (dialog.kind === "moderator_role") return dialog.assign ? "Bổ nhiệm Moderator" : "Thu hồi Moderator";
    if (dialog.kind === "admin_role") return dialog.assign ? "Bổ nhiệm Admin" : "Thu hồi Admin";
    if (dialog.kind === "transfer_owner") return "Chuyển quyền Chủ nền tảng";
    if (dialog.kind === "restaurant") return RESTAURANT_DECISION_LABELS[dialog.decision];
    return dialog.decision === "approve" ? "Duyệt hoàn tiền" : "Từ chối hoàn tiền";
  })();

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-content">
          <header className="admin-heading">
            <div>
              <p className="admin-eyebrow"><AdminPanelSettingsOutlinedIcon /> {isSuperAdmin ? "Chủ nền tảng" : "Quản trị EatNow"}</p>
              <h1>{isSuperAdmin ? "Trung tâm điều hành nền tảng" : "Tổng quan vận hành"}</h1>
              <p>Quản lý hoạt động EatNow trong cùng một không gian thống nhất.</p>
            </div>
            <Link href="/moderator" className="admin-moderator-link">
              <GavelOutlinedIcon /> Kiểm duyệt nội dung
              {stats.moderation.open > 0 ? <b>{stats.moderation.open}</b> : null}
            </Link>
          </header>

          <nav className="admin-tabs" aria-label="Chức năng quản trị">
            {visibleTabs.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.value} type="button" className={optimisticTab === item.value ? "is-active" : ""} onPointerEnter={() => router.prefetch(tabHref(item.value))} onFocus={() => router.prefetch(tabHref(item.value))} onClick={() => goToTab(item.value)} aria-current={optimisticTab === item.value ? "page" : undefined}>
                  <Icon /> <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {loadError ? <Alert severity="warning" className="admin-load-error">{loadError}</Alert> : null}

          {tab === "overview" ? (
            <>
              <section className="admin-metrics" aria-label="Chỉ số vận hành">
                <button type="button" onClick={() => goToTab("users")} className="admin-metric admin-metric--users">
                  <span className="admin-metric__icon"><PeopleOutlineOutlinedIcon /></span>
                  <strong>{stats.users.total}</strong><span>Tài khoản</span>
                  <small>{stats.users.suspended} đang tạm khóa</small>
                </button>
                <button type="button" onClick={() => goToTab("restaurants")} className="admin-metric admin-metric--restaurants">
                  <span className="admin-metric__icon"><StorefrontOutlinedIcon /></span>
                  <strong>{stats.restaurants.total}</strong><span>Nhà hàng</span>
                  <small>{stats.restaurants.pending} chờ duyệt</small>
                </button>
                <article className="admin-metric admin-metric--orders">
                  <span className="admin-metric__icon"><ReceiptLongOutlinedIcon /></span>
                  <strong>{stats.orders.today}</strong><span>Đơn hôm nay</span>
                  <small>{stats.orders.open} đơn đang mở</small>
                </article>
                <button type="button" onClick={() => goToTab("refunds")} className="admin-metric admin-metric--refunds">
                  <span className="admin-metric__icon"><CurrencyExchangeOutlinedIcon /></span>
                  <strong>{stats.refunds.pending}</strong><span>Chờ hoàn tiền</span>
                  <small>{stats.refunds.processing} đang xử lý</small>
                </button>
                <Link href="/moderator" className="admin-metric admin-metric--moderation">
                  <span className="admin-metric__icon"><WarningAmberOutlinedIcon /></span>
                  <strong>{stats.moderation.open}</strong><span>Báo cáo mở</span>
                  <small>{stats.moderation.urgent} khẩn cấp</small>
                </Link>
              </section>

              <section className="admin-panel">
                <div className="admin-panel__heading">
                  <div><h2>Hoạt động gần đây</h2><p>Những thay đổi quản trị mới nhất</p></div>
                  <button type="button" onClick={() => goToTab("audit")}>Xem tất cả</button>
                </div>
                <AuditList audit={audit} />
              </section>
            </>
          ) : null}

          {tab === "users" ? (
            <section className="admin-panel">
              <PanelToolbar
                title="Tài khoản & phân quyền"
                subtitle={`${users.total} tài khoản`}
                search={search}
                placeholder="Tìm tên, email hoặc số điện thoại"
                onSearchChange={setSearch}
                onSubmit={submitSearch}
              />
              <div className="admin-list">
                {users.items.length === 0 ? <EmptyState label="Không tìm thấy tài khoản" /> : users.items.map((item) => {
                  const targetIsAdmin = item.roles.includes("ADMIN");
                  const targetIsModerator = item.roles.includes("MODERATOR");
                  const targetIsSuper = item.roles.includes("SUPER_ADMIN");
                  return (
                    <article className="admin-user-row" key={item.id}>
                      <Avatar src={item.avatar_url ?? undefined}>{getInitials(item.full_name)}</Avatar>
                      <div className="admin-user-row__identity">
                        <h3>{item.full_name}</h3><p>{item.email}</p>
                        <div className="admin-role-list">
                          {item.roles.map((role) => <span key={role}>{formatRole(role)}</span>)}
                        </div>
                      </div>
                      <div className="admin-user-row__status">
                        <span className={item.is_active ? "is-active" : "is-suspended"}>{item.is_active ? "Hoạt động" : "Tạm khóa"}</span>
                        <small>Tham gia {formatDate(item.created_at)}</small>
                      </div>
                      <div className="admin-row-actions">
                        {item.can_manage && !targetIsSuper ? (
                          <button type="button" onClick={() => openDialog({ kind: "user_status", target: item, activate: !item.is_active })}>
                            {item.is_active ? "Tạm khóa" : "Mở lại"}
                          </button>
                        ) : null}
                        {item.can_manage && canManageModerator && !targetIsAdmin && !targetIsSuper ? (
                          <button type="button" onClick={() => openDialog({ kind: "moderator_role", target: item, assign: !targetIsModerator })}>
                            {targetIsModerator ? "Thu hồi Mod" : "Cấp Moderator"}
                          </button>
                        ) : null}
                        {item.can_manage && canManageAdmin && !targetIsSuper ? (
                          <button type="button" onClick={() => openDialog({ kind: "admin_role", target: item, assign: !targetIsAdmin })}>
                            {targetIsAdmin ? "Thu hồi Admin" : "Cấp Admin"}
                          </button>
                        ) : null}
                        {item.can_manage && canTransferOwner && item.is_active && !targetIsSuper ? (
                          <button className="is-danger" type="button" onClick={() => openDialog({ kind: "transfer_owner", target: item })}>
                            Chuyển quyền chủ
                          </button>
                        ) : null}
                        {!item.can_manage ? <span className="admin-protected">Được bảo vệ</span> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {tab === "restaurants" ? (
            <section className="admin-panel">
              <PanelToolbar
                title="Quản lý nhà hàng"
                subtitle={`${restaurants.total} nhà hàng`}
                search={search}
                placeholder="Tìm tên, địa chỉ hoặc số điện thoại"
                onSearchChange={setSearch}
                onSubmit={submitSearch}
                filters={[
                  ["", "Tất cả"], ["pending", "Chờ duyệt"], ["active", "Hoạt động"], ["suspended", "Tạm ngưng"],
                ]}
                activeFilter={statusFilter}
                onFilter={setStatus}
              />
              <div className="admin-list">
                {restaurants.items.length === 0 ? <EmptyState label="Không có nhà hàng trong mục này" /> : restaurants.items.map((item) => {
                  const state = restaurantStatus(item);
                  return (
                    <article className="admin-restaurant-row" key={item.id}>
                      <span className="admin-restaurant-row__icon"><StorefrontOutlinedIcon /></span>
                      <div className="admin-restaurant-row__body">
                        <div className="admin-row-title"><h3>{item.name}</h3><span className={`admin-status admin-status--${state.key}`}>{state.label}</span></div>
                        <p>{item.address}</p>
                        <small>Chủ quán: {item.owners.map((owner) => owner.full_name).join(", ") || "Chưa xác định"} · {item.rating_average.toFixed(1)} ★ ({item.rating_count})</small>
                      </div>
                      <div className="admin-row-actions">
                        {!item.is_verified && item.is_active ? (
                          <><button className="is-primary" type="button" onClick={() => openDialog({ kind: "restaurant", target: item, decision: "approve" })}>Duyệt</button><button type="button" onClick={() => openDialog({ kind: "restaurant", target: item, decision: "reject" })}>Từ chối</button></>
                        ) : null}
                        {item.is_verified && item.is_active ? <button type="button" onClick={() => openDialog({ kind: "restaurant", target: item, decision: "suspend" })}>Tạm ngưng</button> : null}
                        {!item.is_active ? <button className="is-primary" type="button" onClick={() => openDialog({ kind: "restaurant", target: item, decision: "reactivate" })}>Mở lại</button> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {tab === "refunds" ? (
            <section className="admin-panel">
              <PanelToolbar
                title="Yêu cầu hoàn tiền"
                subtitle={`${refunds.total} yêu cầu`}
                search={search}
                placeholder="Tìm mã đơn, người yêu cầu hoặc lý do"
                onSearchChange={setSearch}
                onSubmit={submitSearch}
                filters={[["", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["processing", "Đang hoàn"], ["success", "Hoàn thành"], ["rejected", "Từ chối"]]}
                activeFilter={statusFilter}
                onFilter={setStatus}
              />
              <div className="admin-list">
                {refunds.items.length === 0 ? <EmptyState label="Không có yêu cầu hoàn tiền" /> : refunds.items.map((item) => (
                  <article className="admin-refund-row" key={item.id}>
                    <span className="admin-refund-row__icon"><CurrencyExchangeOutlinedIcon /></span>
                    <div className="admin-refund-row__body">
                      <div className="admin-row-title"><h3>{item.order_code || "Đơn hàng"}</h3><span className={`admin-status admin-status--${item.status}`}>{REFUND_STATUS[item.status] ?? item.status}</span></div>
                      <strong>{formatCurrency(item.requested_amount)}</strong>
                      <p>{item.reason}</p>
                      <small>{item.requester?.full_name || "Không rõ người yêu cầu"} · {item.payment.method.toUpperCase()} · {formatDate(item.requested_at)}</small>
                    </div>
                    <div className="admin-row-actions">
                      {item.status === "pending" ? <><button className="is-primary" type="button" onClick={() => openDialog({ kind: "refund", target: item, decision: "approve" })}>Duyệt hoàn</button><button type="button" onClick={() => openDialog({ kind: "refund", target: item, decision: "reject" })}>Từ chối</button></> : <span className="admin-protected"><CheckCircleOutlineOutlinedIcon /> Đã xử lý</span>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {tab === "audit" ? (
            <section className="admin-panel">
              <div className="admin-panel__heading"><div><h2>Nhật ký quản trị</h2><p>Phạm vi hiển thị phụ thuộc cấp quyền</p></div></div>
              <AuditList audit={audit} />
            </section>
          ) : null}

          {tab === "media" && canManageMedia ? (
            <section className="admin-panel admin-media-panel">
              <div className="admin-panel__heading">
                <div>
                  <h2>Hình ảnh giao diện</h2>
                  <p>Ảnh được lưu trong bucket Supabase Storage “site-media”.</p>
                </div>
              </div>
              <div className="admin-media-grid">
                {Object.values(media).map((item) => (
                  <article className="admin-media-card" key={item.slot}>
                    <div
                      className={`admin-media-card__preview admin-media-card__preview--${item.slot}`}
                      style={{ backgroundImage: `url("${item.imageUrl}")` }}
                      role="img"
                      aria-label={item.altText}
                    >
                      <span>{item.usesFallback ? "Ảnh mặc định" : "Supabase Storage"}</span>
                    </div>
                    <div className="admin-media-card__body">
                      <div>
                        <h3>{item.label}</h3>
                        <p>{item.description}</p>
                        <small>Kích thước đề xuất: {item.recommendedSize}</small>
                      </div>
                      <form
                        key={`${item.slot}-${item.updatedAt ?? "default"}`}
                        className="admin-media-form"
                        onSubmit={(event) => submitMedia(event, item.slot)}
                      >
                        <label>
                          Văn bản thay thế
                          <input
                            name="altText"
                            defaultValue={item.altText}
                            maxLength={180}
                          />
                        </label>
                        <label className="admin-media-file">
                          <CloudUploadOutlinedIcon />
                          <span>Chọn ảnh mới</span>
                          <input
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            required
                          />
                        </label>
                        <div className="admin-media-actions">
                          <button
                            type="submit"
                            className="admin-button admin-button--primary"
                            disabled={isPending}
                          >
                            {isPending ? <CircularProgress size={17} color="inherit" /> : null}
                            Tải lên và áp dụng
                          </button>
                          {!item.usesFallback ? (
                            <button
                              type="button"
                              className="admin-button"
                              disabled={isPending}
                              onClick={() => resetMedia(item.slot)}
                            >
                              <RestoreOutlinedIcon /> Khôi phục mặc định
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
              <Alert severity="info">
                Hỗ trợ JPG, PNG, WebP và AVIF, tối đa 8 MB. Ảnh cũ được xóa sau
                khi cấu hình mới lưu thành công.
              </Alert>
            </section>
          ) : null}

          {pageData ? (
            <PaginationControls
              total={pageData.total}
              limit={pageData.limit}
              offset={pageData.offset}
              onPageChange={changePage}
              disabled={isPending}
            />
          ) : null}
        </div>
      </main>

      <Dialog open={Boolean(dialog)} onClose={isPending ? undefined : () => setDialog(null)} fullWidth maxWidth="sm" slotProps={{ paper: { className: "admin-dialog" } }}>
        {dialog ? <>
          <DialogTitle className="admin-dialog__title"><span>{dialogTitle}</span><IconButton aria-label="Đóng" onClick={() => setDialog(null)} disabled={isPending}><CloseRoundedIcon /></IconButton></DialogTitle>
          <DialogContent>
            <p className="admin-dialog__context">
              {dialog.kind === "restaurant" ? dialog.target.name : dialog.kind === "refund" ? `${dialog.target.order_code} · ${formatCurrency(dialog.target.requested_amount)}` : dialog.target.full_name}
            </p>
            {dialog.kind === "transfer_owner" ? <Alert severity="warning" sx={{ mb: 2 }}>Sau khi chuyển, bạn trở thành Admin và không thể tự lấy lại quyền. Nhập <strong>CHUYEN QUYEN</strong> để xác nhận.</Alert> : null}
            {dialog.kind === "refund" && dialog.decision === "approve" ? <TextField fullWidth label="Số tiền duyệt hoàn" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} sx={{ mb: 2 }} /> : null}
            {["user_status", "restaurant", "refund", "transfer_owner"].includes(dialog.kind) ? <TextField autoFocus fullWidth multiline={dialog.kind !== "transfer_owner"} minRows={dialog.kind === "transfer_owner" ? undefined : 3} label={dialog.kind === "transfer_owner" ? "Nhập cụm từ xác nhận" : "Lý do xử lý"} value={note} error={Boolean(fieldError)} helperText={fieldError || (dialog.kind === "transfer_owner" ? "Thao tác thay đổi Chủ nền tảng duy nhất." : `${note.length}/1000 ký tự`)} slotProps={{ htmlInput: { maxLength: 1000 } }} onChange={(event) => { setNote(event.target.value); setFieldError(""); }} /> : <p className="admin-dialog__confirm">Xác nhận thay đổi quyền cho tài khoản này?</p>}
          </DialogContent>
          <DialogActions className="admin-dialog__actions"><button type="button" className="admin-button" onClick={() => setDialog(null)} disabled={isPending}>Hủy</button><button type="button" className={`admin-button admin-button--primary${dialog.kind === "transfer_owner" ? " is-danger" : ""}`} onClick={submitDialog} disabled={isPending}>{isPending ? <CircularProgress size={18} color="inherit" /> : null}{dialogTitle}</button></DialogActions>
        </> : null}
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4800} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

type PanelToolbarProps = {
  title: string;
  subtitle: string;
  search: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  filters?: Array<[string, string]>;
  activeFilter?: string;
  onFilter?: (value: string) => void;
};

function PanelToolbar({ title, subtitle, search, placeholder, onSearchChange, onSubmit, filters, activeFilter, onFilter }: PanelToolbarProps) {
  return <div className="admin-toolbar">
    <div className="admin-panel__heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>
    <form className="admin-search" onSubmit={onSubmit}><SearchOutlinedIcon /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={placeholder} maxLength={80} /><button type="submit">Tìm</button></form>
    {filters ? <div className="admin-filters">{filters.map(([value, label]) => <button key={value || "all"} type="button" className={(activeFilter ?? "") === value ? "is-active" : ""} onClick={() => onFilter?.(value)}>{label}</button>)}</div> : null}
  </div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="admin-empty"><CheckCircleOutlineOutlinedIcon /><h3>{label}</h3><p>Hãy thử thay đổi từ khóa hoặc bộ lọc.</p></div>;
}

function PaginationControls({
  total,
  limit,
  offset,
  onPageChange,
  disabled,
}: {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
}) {
  if (total <= limit && offset === 0) return null;
  const current = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <nav className="admin-pagination" aria-label="Phân trang quản trị">
      <button
        type="button"
        disabled={disabled || current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        Trang trước
      </button>
      <span>
        Trang <strong>{current}</strong> / {pages}
      </span>
      <button
        type="button"
        disabled={disabled || current >= pages}
        onClick={() => onPageChange(current + 1)}
      >
        Trang sau
      </button>
    </nav>
  );
}

function AuditList({ audit }: { audit: AdminAuditList }) {
  return <div className="admin-audit-list">
    {audit.items.length === 0 ? <EmptyState label="Chưa có hoạt động quản trị" /> : audit.items.map((item) => <article key={item.id} className="admin-audit-row">
      <span className="admin-audit-row__icon"><HistoryOutlinedIcon /></span>
      <div><h3>{ACTION_LABELS[item.action] ?? item.action.replaceAll("_", " ")}</h3><p>{item.actor_name || "Hệ thống"} · {item.entity_type}</p></div>
      <time>{formatDate(item.created_at)}</time>
    </article>)}
  </div>;
}
