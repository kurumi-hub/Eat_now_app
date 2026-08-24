"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { cancelShipperWithdrawalAction, requestShipperWithdrawalAction, saveShipperBankAccountAction } from "@/app/shipper/actions";
import type { ShipperActionResult, ShipperWalletData } from "@/types/shipper";

const WITHDRAWAL_STATUS: Record<string, string> = {
  requested: "Chờ duyệt", approved: "Đã duyệt", paid: "Đã chuyển khoản",
  rejected: "Từ chối", cancelled: "Đã hủy", failed: "Chuyển thất bại",
};
const ENTRY_LABEL: Record<string, string> = {
  order_earning: "Thu nhập đơn hàng", earning_adjustment: "Điều chỉnh thu nhập",
  withdrawal_debit: "Yêu cầu rút tiền", withdrawal_hold: "Đang giữ để chuyển khoản",
  withdrawal_release: "Hoàn lại số dư", withdrawal_paid: "Đã chuyển khoản",
  cod_collected: "Đã thu COD", cod_remittance: "Đã nộp COD", cod_adjustment: "Điều chỉnh COD",
};

function money(value: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value); }
function date(value?: string) { if (!value) return "—"; return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }); }

export default function ShipperWalletPanel({ wallet }: { wallet: ShipperWalletData }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<ShipperActionResult | null>(null); const [showBankForm, setShowBankForm] = useState(!wallet.bankAccount);
  const run = (task: () => Promise<ShipperActionResult>) => startTransition(async () => { const result = await task(); setNotice(result); if (result.ok) router.refresh(); });
  const saveBank = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => saveShipperBankAccountAction({ bankCode: String(form.get("bankCode") || ""), bankName: String(form.get("bankName") || ""), accountHolder: String(form.get("accountHolder") || ""), accountNumber: String(form.get("accountNumber") || "") })); };
  const requestWithdrawal = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => requestShipperWithdrawalAction(Number(form.get("amount")), String(form.get("note") || ""))); };
  const hasOpenWithdrawal = wallet.withdrawals.some((item) => ["requested", "approved"].includes(item.status));

  return <section className="shipper-panel shipper-wallet">
    <div className="shipper-panel__heading"><div><p>Thu nhập tài xế</p><h2>Số dư & rút tiền</h2><span>Tiền COD được tự động đối trừ trước khi tính số có thể rút.</span></div><strong>{money(wallet.balances.availableToWithdraw)}</strong></div>
    {notice && <div className={`shipper-notice ${notice.ok ? "is-success" : "is-error"}`} role="status"><span>{notice.message}</span><button onClick={() => setNotice(null)}>×</button></div>}
    <div className="shipper-wallet-balances">
      <article className="is-primary"><span>Có thể rút</span><strong>{money(wallet.balances.availableToWithdraw)}</strong><small>Sau khi trừ công nợ COD</small></article>
      <article><span>Đang chờ mở khóa</span><strong>{money(wallet.balances.pending)}</strong><small>Giữ {wallet.settings.earningHoldDays} ngày sau giao hàng</small></article>
      <article><span>Đang chờ chuyển</span><strong>{money(wallet.balances.held)}</strong><small>Đã tạo yêu cầu rút tiền</small></article>
      <article className={wallet.balances.codDue > 0 ? "is-warning" : ""}><span>COD cần nộp ròng</span><strong>{money(wallet.balances.codDue)}</strong><small>COD đang ghi nhận: {money(wallet.balances.codLiability)}</small></article>
    </div>
    <div className="shipper-wallet-grid">
      <article className="shipper-wallet-card"><div className="shipper-wallet-card__heading"><div><strong>Tài khoản nhận tiền</strong><span>Chỉ Admin tài chính được xem số tài khoản đầy đủ.</span></div>{wallet.bankAccount && <button type="button" onClick={() => setShowBankForm((value) => !value)}>{showBankForm ? "Đóng" : "Thay đổi"}</button>}</div>{wallet.bankAccount && !showBankForm ? <div className="shipper-bank-summary"><b>{wallet.bankAccount.bankName}</b><strong>{wallet.bankAccount.maskedAccountNumber}</strong><span>{wallet.bankAccount.accountHolder}</span></div> : <form className="shipper-wallet-form" onSubmit={saveBank}><label>Mã ngân hàng<input name="bankCode" required maxLength={20} defaultValue={wallet.bankAccount?.bankCode || ""} placeholder="VCB" /></label><label>Tên ngân hàng<input name="bankName" required maxLength={120} defaultValue={wallet.bankAccount?.bankName || ""} placeholder="Vietcombank" /></label><label>Chủ tài khoản<input name="accountHolder" required maxLength={120} defaultValue={wallet.bankAccount?.accountHolder || ""} placeholder="NGUYEN VAN A" /></label><label>Số tài khoản<input name="accountNumber" required inputMode="numeric" pattern="[0-9]{6,25}" placeholder={wallet.bankAccount ? "Nhập lại số tài khoản mới" : "Nhập số tài khoản"} /></label><button disabled={pending}>Lưu tài khoản</button></form>}</article>
      <article className="shipper-wallet-card"><div className="shipper-wallet-card__heading"><div><strong>Tạo yêu cầu rút</strong><span>Tối thiểu {money(wallet.settings.minimumWithdrawal)}, theo bước {money(wallet.settings.withdrawalStep)}.</span></div></div><form className="shipper-wallet-form" onSubmit={requestWithdrawal}><label>Số tiền<input name="amount" type="number" required min={wallet.settings.minimumWithdrawal} max={Math.min(wallet.settings.maximumWithdrawal, wallet.balances.availableToWithdraw)} step={wallet.settings.withdrawalStep} placeholder="100000" /></label><label>Ghi chú<textarea name="note" maxLength={300} placeholder="Không bắt buộc" /></label><button disabled={pending || !wallet.bankAccount || hasOpenWithdrawal || wallet.balances.availableToWithdraw < wallet.settings.minimumWithdrawal}>{hasOpenWithdrawal ? "Đang có yêu cầu chờ xử lý" : "Gửi yêu cầu rút tiền"}</button></form>{!wallet.bankAccount && <small className="shipper-wallet-hint">Hãy thêm tài khoản ngân hàng trước.</small>}</article>
    </div>
    <div className="shipper-wallet-history"><div><h3>Yêu cầu rút gần đây</h3>{wallet.withdrawals.length ? wallet.withdrawals.map((item) => <article key={item.id}><div><strong>{money(item.amount)}</strong><span>{item.bankName} · {item.maskedAccountNumber}</span><small>{date(item.requestedAt)}{item.transferReference ? ` · Mã CK: ${item.transferReference}` : ""}</small>{item.reviewNote && <small>{item.reviewNote}</small>}</div><div><b className={`is-${item.status}`}>{WITHDRAWAL_STATUS[item.status] || item.status}</b>{item.status === "requested" && <button disabled={pending} onClick={() => run(() => cancelShipperWithdrawalAction(item.id))}>Hủy</button>}</div></article>) : <p>Chưa có yêu cầu rút tiền.</p>}</div><div><h3>Biến động gần đây</h3>{wallet.entries.length ? wallet.entries.map((item) => <article key={item.id}><div><strong>{ENTRY_LABEL[item.entryType] || item.description}</strong><span>{item.description}</span><small>{date(item.createdAt)}{item.bucket === "earning" && item.amount > 0 && new Date(item.availableAt) > new Date() ? ` · khả dụng ${date(item.availableAt)}` : ""}</small></div><em className={item.amount > 0 ? "is-plus" : "is-minus"}>{item.amount > 0 ? "+" : ""}{money(item.amount)}</em></article>) : <p>Chưa có biến động số dư.</p>}</div></div>
  </section>;
}
