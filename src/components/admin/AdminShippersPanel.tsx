"use client";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Avatar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { setShipperActiveAction } from "@/app/admin/actions";
import type { AdminShipper, AdminShipperList } from "@/types/shipper";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

function date(value?: string) {
  if (!value) return "Chưa cập nhật";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Chưa cập nhật"
    : parsed.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminShippersPanel({
  data,
  searchTerm,
  statusFilter,
}: {
  data: AdminShipperList;
  searchTerm: string;
  statusFilter: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchTerm);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const navigate = (next: { q?: string; status?: string }) => {
    const params = new URLSearchParams({ tab: "shippers" });
    const query = next.q ?? searchTerm;
    const status = next.status ?? statusFilter;
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    startTransition(() => router.push(`/admin?${params.toString()}`));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ q: search.trim() });
  };

  const changeStatus = (item: AdminShipper) => {
    const active = !item.isActive;
    const verb = active ? "mở lại" : "tạm ngưng";
    if (!window.confirm(`Bạn muốn ${verb} tài xế ${item.fullName}?`)) return;
    const reason = window.prompt(`Nhập lý do ${verb} tài xế:`) || "";
    if (reason.trim().length < 5) {
      setNotice({ ok: false, message: "Lý do phải có ít nhất 5 ký tự." });
      return;
    }
    startTransition(async () => {
      const result = await setShipperActiveAction(item.id, active, reason);
      setNotice(result);
      if (result.ok) router.refresh();
    });
  };

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <div className="admin-panel__heading">
          <div><h2>Danh sách tài xế</h2><p>{data.total} tài xế trong bộ lọc hiện tại</p></div>
        </div>
        <form className="admin-search" onSubmit={submit}>
          <LocalShippingOutlinedIcon />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên, email, số điện thoại hoặc biển số"
            maxLength={80}
          />
          <button type="submit" disabled={pending}>Tìm</button>
        </form>
        <div className="admin-filters">
          {[["", "Tất cả"], ["active", "Đang hoạt động"], ["online", "Đang online"], ["offline", "Đang offline"], ["suspended", "Tạm ngưng"]].map(([value, label]) => (
            <button
              key={value || "all"}
              type="button"
              className={statusFilter === value ? "is-active" : ""}
              disabled={pending}
              onClick={() => navigate({ status: value, q: searchTerm })}
            >{label}</button>
          ))}
        </div>
      </div>

      {notice ? (
        <div className={`admin-inline-notice ${notice.ok ? "is-success" : "is-error"}`}>
          {notice.message}<button type="button" onClick={() => setNotice(null)}>×</button>
        </div>
      ) : null}

      <div className="admin-list admin-shipper-management-list">
        {data.items.length ? data.items.map((item) => (
          <article className="admin-shipper-management-row" key={item.id}>
            <Avatar src={item.avatarUrl}>{initials(item.fullName)}</Avatar>
            <div className="admin-shipper-management-row__identity">
              <div className="admin-row-title">
                <h3>{item.fullName}</h3>
                <span className={`admin-status admin-status--${item.isActive ? "active" : "suspended"}`}>
                  {item.isActive ? "Hoạt động" : "Tạm ngưng"}
                </span>
                {item.isActive ? <span className={`admin-online-state ${item.isOnline ? "is-online" : "is-offline"}`}>{item.isOnline ? "Online" : "Offline"}</span> : null}
              </div>
              <p>{item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
              <small>{item.vehicleType} · {item.plateNumber} · Vị trí: {date(item.lastLocationAt)}</small>
            </div>
            <dl>
              <div><dt>Đơn hoàn thành</dt><dd>{item.completedDeliveries}</dd></div>
              <div><dt>Chuyến đang giữ</dt><dd>{item.activeDeliveries}</dd></div>
              <div><dt>Đánh giá</dt><dd>{item.ratingAverage.toFixed(1)} ★ ({item.ratingCount})</dd></div>
            </dl>
            <div className="admin-row-actions">
              <button
                type="button"
                className={item.isActive ? "is-danger" : "is-primary"}
                disabled={pending || (item.isActive && item.activeDeliveries > 0)}
                title={item.activeDeliveries > 0 ? "Không thể tạm ngưng tài xế đang giữ chuyến" : undefined}
                onClick={() => changeStatus(item)}
              >{item.isActive ? "Tạm ngưng" : "Mở lại"}</button>
            </div>
          </article>
        )) : (
          <div className="admin-empty-state">Không có tài xế trong bộ lọc hiện tại.</div>
        )}
      </div>
    </section>
  );
}
