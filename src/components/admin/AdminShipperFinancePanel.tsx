"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { recordShipperCodRemittanceAction, reviewShipperWithdrawalAction } from "@/app/admin/actions";
import type { AdminActionResult } from "@/types/admin";
import type { AdminShipperFinanceData, AdminShipperWithdrawal } from "@/types/shipper";

const STATUS: Record<string, string> = { requested: "Chờ duyệt", approved: "Chờ chuyển khoản", paid: "Đã chuyển",
  rejected: "Từ chối", cancelled: "Tài xế đã hủy", failed: "Chuyển thất bại" };
function money(value: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value); }
function date(value?: string) { return value ? new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—"; }

export default function AdminShipperFinancePanel({
  data,
  searchTerm,
  statusFilter,
}: {
  data: AdminShipperFinanceData;
  searchTerm: string;
  statusFilter: string;
}) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchTerm);
  const [notice, setNotice] = useState<AdminActionResult | null>(null);
  const navigate = (next: { search?: string; status?: string; page?: number }) => {
    const params = new URLSearchParams({ tab: "shipper_finance" });
    const nextSearch = next.search ?? searchTerm;
    const nextStatus = next.status ?? statusFilter;
    if (nextSearch) params.set("q", nextSearch);
    if (nextStatus) params.set("status", nextStatus);
    if ((next.page ?? 1) > 1) params.set("page", String(next.page));
    startTransition(() => router.push(`/admin?${params.toString()}`));
  };
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ search: search.trim(), page: 1 });
  };
  const run = (task: () => Promise<AdminActionResult>) => startTransition(async () => { const result = await task(); setNotice(result); if (result.ok) router.refresh(); });
  const decide = (item: AdminShipperWithdrawal, decision: "approve" | "reject" | "paid" | "failed") => {
    const note = window.prompt(decision === "paid" ? "Ghi chú chuyển khoản (ít nhất 5 ký tự):" : "Ghi chú xử lý (ít nhất 5 ký tự):"); if (!note) return;
    let reference = ""; if (decision === "paid") { reference = window.prompt("Mã giao dịch ngân hàng:") || ""; if (!reference) return; }
    run(() => reviewShipperWithdrawalAction(item.id, decision, note, reference));
  };
  const remit = (shipperId: string, maximum: number) => {
    const amountRaw = window.prompt(`Số tiền COD đã nộp (tối đa ${money(maximum)}):`, String(Math.round(maximum))); if (!amountRaw) return;
    const reference = window.prompt("Mã phiếu nộp tiền/giao dịch:") || ""; if (!reference) return;
    const note = window.prompt("Ghi chú đối soát (ít nhất 5 ký tự):") || ""; if (!note) return;
    run(() => recordShipperCodRemittanceAction(shipperId, Number(amountRaw), reference, note));
  };
  const currentPage = Math.floor(data.offset / data.limit) + 1;
  const pageCount = Math.max(1, Math.ceil(data.withdrawalTotal / data.limit));
  return <div className="admin-shipper-finance">
    {notice && <div className={`admin-alert ${notice.ok ? "is-success" : "is-error"}`} role="status">{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}
    <section className="admin-panel"><div className="admin-panel__heading"><div><h2>Rút tiền tài xế</h2><p>{data.withdrawalTotal} yêu cầu · chuyển khoản thủ công có mã đối soát</p></div></div><div className="admin-shipper-finance__toolbar"><form className="admin-search" onSubmit={submitSearch}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc tài khoản ngân hàng" maxLength={80}/><button type="submit" disabled={pending}>Tìm</button></form><div className="admin-filters">{[["", "Tất cả"], ["requested", "Chờ duyệt"], ["approved", "Chờ chuyển"], ["paid", "Đã chuyển"], ["failed", "Thất bại"]].map(([value, label]) => <button key={value || "all"} type="button" className={statusFilter === value ? "is-active" : ""} disabled={pending} onClick={() => navigate({ status: value, page: 1 })}>{label}</button>)}</div></div><div className="admin-list">{data.withdrawals.length ? data.withdrawals.map((item) => <article className="admin-shipper-money-row" key={item.id}><div><div className="admin-row-title"><h3>{item.shipperName}</h3><span className={`admin-status admin-status--${item.status}`}>{STATUS[item.status] || item.status}</span></div><strong>{money(item.amount)}</strong><p>{item.bankName} ({item.bankCode}) · {item.accountNumber} · {item.accountHolder}</p><small>Yêu cầu {date(item.requestedAt)}{item.shipperNote ? ` · ${item.shipperNote}` : ""}{item.transferReference ? ` · Mã CK: ${item.transferReference}` : ""}</small>{item.reviewNote && <small>{item.reviewNote}</small>}</div><div className="admin-row-actions">{item.status === "requested" && <><button className="is-primary" disabled={pending} onClick={() => decide(item, "approve")}>Duyệt</button><button disabled={pending} onClick={() => decide(item, "reject")}>Từ chối</button></>}{item.status === "approved" && <><button className="is-primary" disabled={pending} onClick={() => decide(item, "paid")}>Đã chuyển khoản</button><button disabled={pending} onClick={() => decide(item, "failed")}>Chuyển thất bại</button></>}</div></article>) : <div className="admin-empty-state">Không có yêu cầu rút tiền trong bộ lọc hiện tại.</div>}</div>{pageCount > 1 && <nav className="admin-pagination" aria-label="Phân trang yêu cầu rút tiền"><button type="button" disabled={pending || currentPage <= 1} onClick={() => navigate({ page: currentPage - 1 })}>Trang trước</button><span>Trang <strong>{currentPage}</strong> / {pageCount}</span><button type="button" disabled={pending || currentPage >= pageCount} onClick={() => navigate({ page: currentPage + 1 })}>Trang sau</button></nav>}</section>
    <section className="admin-panel"><div className="admin-panel__heading"><div><h2>Đối soát COD</h2><p>Công nợ ròng đã tự bù trừ với thu nhập khả dụng của tài xế.</p></div></div><div className="admin-list">{data.codAccounts.length ? data.codAccounts.map((item) => <article className="admin-shipper-money-row" key={item.shipperId}><div><div className="admin-row-title"><h3>{item.shipperName}</h3><span>{item.plateNumber}</span></div><strong>Cần nộp ròng: {money(item.codDue)}</strong><p>COD đang ghi nhận {money(item.codLiability)} · Thu nhập khả dụng {money(item.earningAvailable)}</p><small>Sau đối trừ có thể rút: {money(item.availableToWithdraw)}</small></div><div className="admin-row-actions"><button className="is-primary" disabled={pending || item.codLiability <= 0} onClick={() => remit(item.shipperId, item.codLiability)}>Ghi nhận nộp COD</button></div></article>) : <div className="admin-empty-state">Chưa có công nợ COD cần theo dõi.</div>}</div></section>
  </div>;
}
