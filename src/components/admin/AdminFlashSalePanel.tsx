"use client";

import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { maintainFlashSalesAction, reviewFlashSaleProposalAction, saveFlashSaleCampaignAction } from "@/app/admin/actions";
import type { AdminFlashSaleCampaign, AdminFlashSaleData, FlashSaleProposal } from "@/types/flashSale";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;
const CAMPAIGN_STATUS: Record<AdminFlashSaleCampaign["status"], string> = { draft: "Bản nháp", active: "Đang chạy", paused: "Tạm dừng", ended: "Đã kết thúc" };
const PROPOSAL_STATUS: Record<FlashSaleProposal["status"], string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Đã từ chối", cancelled: "Owner đã hủy", expired: "Hết thời gian" };
type DetailTab = "items" | "pending" | "history";
const initials = (value: string) => value.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join("") || "FS";

function FundingText({ proposal }: { proposal: FlashSaleProposal }) {
  return <>{proposal.fundingSource === "restaurant" ? "Nhà hàng tài trợ 100%" : `EatNow ${proposal.platformFundingPercent}% · Nhà hàng ${100 - proposal.platformFundingPercent}%`}</>;
}

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return <nav className="flash-pagination" aria-label="Phân trang"><button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>‹ Trước</button><span>Trang <b>{page}</b> / {pages}</span><button type="button" disabled={page === pages} onClick={() => onChange(page + 1)}>Sau ›</button></nav>;
}

export default function AdminFlashSalePanel({ data }: { data: AdminFlashSaleData }) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id ?? "");
  const [detailTab, setDetailTab] = useState<DetailTab>("items");
  const [showCreate, setShowCreate] = useState(data.campaigns.length === 0);
  const [campaignPage, setCampaignPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = data.campaigns.find((campaign) => campaign.id === campaignId);
  const campaignItems = data.items.filter((item) => item.campaignId === campaignId);
  const campaignProposals = data.proposals.filter((proposal) => proposal.campaignId === campaignId);
  const pendingProposals = campaignProposals.filter((proposal) => proposal.status === "pending");
  const proposalHistory = campaignProposals.filter((proposal) => proposal.status !== "pending");
  const campaignPageSize = 8;
  const detailPageSize = detailTab === "items" ? 12 : detailTab === "pending" ? 8 : 10;
  const pagedCampaigns = data.campaigns.slice((campaignPage - 1) * campaignPageSize, campaignPage * campaignPageSize);
  const detailTotal = detailTab === "items" ? campaignItems.length : detailTab === "pending" ? pendingProposals.length : proposalHistory.length;
  const pagedItems = campaignItems.slice((detailPage - 1) * detailPageSize, detailPage * detailPageSize);
  const pagedPending = pendingProposals.slice((detailPage - 1) * detailPageSize, detailPage * detailPageSize);
  const pagedHistory = proposalHistory.slice((detailPage - 1) * detailPageSize, detailPage * detailPageSize);

  const run = (task: () => Promise<{ ok: boolean; message: string }>, key: string) => {
    setMessage(null); setWorkingKey(key);
    startTransition(async () => { try { const result = await task(); setMessage({ text: result.message, error: !result.ok }); } finally { setWorkingKey(null); } });
  };
  const saveCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    run(() => saveFlashSaleCampaignAction({ name: String(form.get("name") ?? ""), subtitle: String(form.get("subtitle") ?? ""), startsAt: new Date(String(form.get("startsAt"))).toISOString(), endsAt: new Date(String(form.get("endsAt"))).toISOString(), status: String(form.get("status")) as AdminFlashSaleCampaign["status"], voucherPolicy: String(form.get("voucherPolicy")) as "none" | "shipping_only", fundingSource: "platform" }), "create-campaign");
  };
  const changeStatus = (campaign: AdminFlashSaleCampaign, status: AdminFlashSaleCampaign["status"]) => run(() => saveFlashSaleCampaignAction({ ...campaign, subtitle: campaign.subtitle ?? "", voucherPolicy: campaign.voucherPolicy === "none" ? "none" : "shipping_only", fundingSource: "platform", status }), `campaign-${campaign.id}`);
  const review = (proposal: FlashSaleProposal, approve: boolean) => run(() => reviewFlashSaleProposalAction(proposal.id, approve, reviewNotes[proposal.id] ?? ""), `proposal-${proposal.id}`);
  const chooseCampaign = (id: string) => { setCampaignId(id); setDetailTab("items"); setDetailPage(1); };
  const chooseDetailTab = (value: DetailTab) => { setDetailTab(value); setDetailPage(1); };
  const changeCampaignPage = (value: number) => { setCampaignPage(value); const first = data.campaigns[(value - 1) * campaignPageSize]; if (first) chooseCampaign(first.id); };

  useEffect(() => {
    const nextEnd = data.campaigns.map((campaign) => Date.parse(campaign.endsAt)).filter((value) => Number.isFinite(value) && value > Date.now()).sort((a, b) => a - b)[0];
    if (!nextEnd) return;
    const timer = window.setTimeout(() => router.refresh(), Math.min(Math.max(nextEnd - Date.now() + 500, 500), 2_147_000_000));
    return () => window.clearTimeout(timer);
  }, [data.campaigns, router]);

  return <section className="admin-panel admin-flash-sale-panel">
    <header className="admin-flash-header"><div className="admin-flash-header__icon"><LocalFireDepartmentOutlinedIcon /></div><div><p>Vận hành chiến dịch</p><h2>Flash Sale</h2><span>Chọn một chiến dịch để quản lý món ăn và quy trình duyệt.</span></div><Button variant="outlined" disabled={pending} onClick={() => run(maintainFlashSalesAction, "maintenance")}>{workingKey === "maintenance" ? <CircularProgress size={17} color="inherit" /> : "Chạy bảo trì"}</Button></header>
    {message ? <Alert severity={message.error ? "error" : "success"}>{message.text}</Alert> : null}
    <div className="admin-flash-finance"><article><span>Chiến dịch</span><strong>{data.campaigns.length}</strong></article><article><span>Đang chờ duyệt</span><strong>{data.proposals.filter((p) => p.status === "pending").length}</strong></article><article><span>Đơn Flash Sale</span><strong>{data.finance.orders}</strong></article><article><span>Tổng giảm</span><strong>{money(data.finance.discount)}</strong></article><article><span>Tổng tài trợ</span><strong>{money(data.finance.platformFunded + data.finance.restaurantFunded)}</strong></article></div>

    <div className="admin-flash-workspace">
      <aside className="admin-flash-campaign-sidebar">
        <div className="admin-flash-card__heading"><div><p>Danh sách</p><h3>Chiến dịch</h3></div><button type="button" onClick={() => setShowCreate((value) => !value)}>{showCreate ? "Đóng" : "+ Tạo mới"}</button></div>
        {showCreate && <form className="admin-flash-campaign-form admin-flash-campaign-form--inline" onSubmit={saveCampaign}><label>Tên chiến dịch<input name="name" required maxLength={120} placeholder="Deal trưa đồng giá" /></label><label>Mô tả<input name="subtitle" maxLength={240} placeholder="Thông điệp trên trang chủ" /></label><div className="admin-flash-form-row"><label>Bắt đầu<input name="startsAt" type="datetime-local" required /></label><label>Kết thúc<input name="endsAt" type="datetime-local" required /></label></div><div className="admin-flash-form-row"><label>Trạng thái<select name="status" defaultValue="draft"><option value="draft">Bản nháp</option><option value="active">Kích hoạt</option></select></label><label>Voucher<select name="voucherPolicy" defaultValue="shipping_only"><option value="shipping_only">Chỉ phí giao hàng</option><option value="none">Không áp dụng</option></select></label></div><Button type="submit" variant="contained" disabled={pending}>{workingKey === "create-campaign" ? <CircularProgress size={18} color="inherit" /> : "Tạo chiến dịch"}</Button></form>}
        <div className="admin-flash-campaign-list">{data.campaigns.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có chiến dịch</strong><span>Hãy tạo chiến dịch đầu tiên.</span></div> : pagedCampaigns.map((campaign, index) => { const itemCount = data.items.filter((item) => item.campaignId === campaign.id).length; const waitingCount = data.proposals.filter((proposal) => proposal.campaignId === campaign.id && proposal.status === "pending").length; return <article className={campaign.id === campaignId ? "is-selected" : ""} key={campaign.id}><button className="admin-flash-campaign-select" type="button" onClick={() => chooseCampaign(campaign.id)}><i>{String((campaignPage - 1) * campaignPageSize + index + 1).padStart(2, "0")}</i><span><small>Chiến dịch</small><strong>{campaign.name}</strong><em>{campaign.subtitle || "Chưa có mô tả"}</em><time>{new Date(campaign.startsAt).toLocaleDateString("vi-VN")} – {new Date(campaign.endsAt).toLocaleDateString("vi-VN")}</time></span><b className={`is-${campaign.status}`}>{CAMPAIGN_STATUS[campaign.status]}</b></button><div className="admin-flash-campaign-stats"><span><b>{itemCount}</b> món</span><span><b>{waitingCount}</b> chờ duyệt</span></div></article>; })}</div>
        <Pagination page={campaignPage} total={data.campaigns.length} pageSize={campaignPageSize} onChange={changeCampaignPage} />
      </aside>

      <main className="admin-flash-campaign-detail">{!selected ? <div className="admin-flash-empty admin-flash-empty--detail"><strong>Chọn một chiến dịch</strong><span>Món ăn và các đề xuất sẽ xuất hiện tại đây.</span></div> : <>
        <header className="admin-flash-detail-header"><div><p>Chiến dịch đang chọn</p><h3>{selected.name}</h3><span>{selected.subtitle || "Chưa có mô tả"}</span></div><div><b className={`is-${selected.status}`}>{CAMPAIGN_STATUS[selected.status]}</b><small>{new Date(selected.startsAt).toLocaleString("vi-VN")} – {new Date(selected.endsAt).toLocaleString("vi-VN")}</small></div><footer>{selected.status !== "active" && selected.status !== "ended" ? <button type="button" onClick={() => changeStatus(selected, "active")}>Kích hoạt</button> : null}{selected.status === "active" ? <button type="button" onClick={() => changeStatus(selected, "paused")}>Tạm dừng</button> : null}{selected.status !== "ended" ? <button type="button" onClick={() => changeStatus(selected, "ended")}>Kết thúc</button> : null}</footer></header>
        <nav className="admin-flash-detail-tabs"><button type="button" className={detailTab === "items" ? "is-active" : ""} onClick={() => chooseDetailTab("items")}>Món ăn <b>{campaignItems.length}</b></button><button type="button" className={detailTab === "pending" ? "is-active" : ""} onClick={() => chooseDetailTab("pending")}>Chờ duyệt <b className={pendingProposals.length ? "has-pending" : ""}>{pendingProposals.length}</b></button><button type="button" className={detailTab === "history" ? "is-active" : ""} onClick={() => chooseDetailTab("history")}>Lịch sử duyệt <b>{proposalHistory.length}</b></button></nav>
        {detailTab === "items" && (campaignItems.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có món được duyệt</strong><span>Các món Admin duyệt sẽ xuất hiện tại đây.</span></div> : <div className="admin-flash-approved-grid">{pagedItems.map((item) => { const used = item.soldQuantity + item.reservedQuantity; const remaining = Math.max(item.stockLimit - used, 0); const percent = item.stockLimit > 0 ? Math.min(used / item.stockLimit * 100, 100) : 0; return <article key={item.id}><header><i>{initials(item.restaurantName)}</i><div><span>{item.restaurantName}</span><strong>{item.foodName}</strong></div></header><p><b>{money(item.salePrice)}</b><del>{money(item.originalPrice)}</del></p><div className="admin-flash-stock"><span><b>{remaining}</b>/{item.stockLimit} suất còn lại</span><div><i style={{ width: `${percent}%` }} /></div></div><small>Đã bán {item.soldQuantity} · Đang giữ {item.reservedQuantity}</small><em>{item.fundingSource === "platform" ? "EatNow 100%" : item.fundingSource === "restaurant" ? "Nhà hàng 100%" : `EatNow ${item.platformFundingPercent}% · Nhà hàng ${100 - item.platformFundingPercent}%`}</em></article>; })}</div>)}
        {detailTab === "pending" && (pendingProposals.length === 0 ? <div className="admin-flash-empty"><strong>Không có đề xuất đang chờ</strong><span>Đề xuất mới cho chiến dịch này sẽ xuất hiện tại đây.</span></div> : <div className="admin-flash-review-grid">{pagedPending.map((proposal) => <article className="admin-flash-review-card" key={proposal.id}><header><i>{initials(proposal.restaurantName)}</i><div><span>{proposal.restaurantName}</span><h4>{proposal.foodName}</h4></div><b>{PROPOSAL_STATUS[proposal.status]}</b></header><dl><div><dt>Giá đề xuất</dt><dd>{money(proposal.proposedSalePrice)}</dd></div><div><dt>Số suất</dt><dd>{proposal.proposedStockLimit}</dd></div><div><dt>Giới hạn</dt><dd>{proposal.proposedPerUserLimit}/khách</dd></div></dl><p className="admin-flash-funding"><FundingText proposal={proposal} /></p>{proposal.note && <blockquote>{proposal.note}</blockquote>}<label>Phản hồi cho nhà hàng<textarea rows={2} maxLength={1000} placeholder="Lý do hoặc ghi chú khi duyệt" value={reviewNotes[proposal.id] ?? ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [proposal.id]: event.target.value }))} /></label><footer><button className="is-reject" type="button" disabled={pending} onClick={() => review(proposal, false)}>Từ chối</button><button className="is-approve" type="button" disabled={pending} onClick={() => review(proposal, true)}>{workingKey === `proposal-${proposal.id}` ? <CircularProgress size={16} color="inherit" /> : "Duyệt món"}</button></footer></article>)}</div>)}
        {detailTab === "history" && (proposalHistory.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có lịch sử duyệt</strong></div> : <div className="admin-flash-history-list">{pagedHistory.map((proposal) => <article className={`is-${proposal.status}`} key={proposal.id}><i>{initials(proposal.restaurantName)}</i><div><strong>{proposal.foodName}</strong><span>{proposal.restaurantName}</span></div><div><b>{money(proposal.proposedSalePrice)} · {proposal.proposedStockLimit} suất</b><small><FundingText proposal={proposal} /></small></div><em className={`is-${proposal.status}`}>{PROPOSAL_STATUS[proposal.status]}</em>{proposal.reviewNote && <p>{proposal.reviewNote}</p>}</article>)}</div>)}
        <Pagination page={detailPage} total={detailTotal} pageSize={detailPageSize} onChange={setDetailPage} />
      </>}</main>
    </div>
  </section>;
}
