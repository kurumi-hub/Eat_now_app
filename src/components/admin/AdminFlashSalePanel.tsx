"use client";

import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { maintainFlashSalesAction, reviewFlashSaleProposalAction, saveFlashSaleCampaignAction } from "@/app/admin/actions";
import type { AdminFlashSaleCampaign, AdminFlashSaleData, FlashSaleProposal } from "@/types/flashSale";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;
const CAMPAIGN_STATUS: Record<AdminFlashSaleCampaign["status"], string> = { draft: "Bản nháp", active: "Đang chạy", paused: "Tạm dừng", ended: "Đã kết thúc" };
const PROPOSAL_STATUS: Record<FlashSaleProposal["status"], string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Đã từ chối", cancelled: "Owner đã hủy" };
type FlashSaleTab = "campaigns" | "pending" | "approved" | "history";
const initials = (value: string) => value.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join("") || "FS";

function FundingText({ proposal }: { proposal: FlashSaleProposal }) {
  return <>{proposal.fundingSource === "restaurant" ? "Nhà hàng tài trợ 100%" : `EatNow ${proposal.platformFundingPercent}% · Nhà hàng ${100 - proposal.platformFundingPercent}%`}</>;
}

export default function AdminFlashSalePanel({ data }: { data: AdminFlashSaleData }) {
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id ?? "");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [tab, setTab] = useState<FlashSaleTab>(data.proposals.some((proposal) => proposal.status === "pending") ? "pending" : "campaigns");
  const [pending, startTransition] = useTransition();
  const selected = data.campaigns.find((campaign) => campaign.id === campaignId);
  const campaignItems = data.items.filter((item) => item.campaignId === campaignId);
  const pendingProposals = useMemo(() => data.proposals.filter((proposal) => proposal.status === "pending"), [data.proposals]);
  const proposalHistory = useMemo(() => data.proposals.filter((proposal) => proposal.status !== "pending"), [data.proposals]);

  const run = (task: () => Promise<{ ok: boolean; message: string }>, key: string) => {
    setMessage(null);
    setWorkingKey(key);
    startTransition(async () => {
      try {
        const result = await task();
        setMessage({ text: result.message, error: !result.ok });
      } finally {
        setWorkingKey(null);
      }
    });
  };

  const saveCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() => saveFlashSaleCampaignAction({
      name: String(form.get("name") ?? ""), subtitle: String(form.get("subtitle") ?? ""),
      startsAt: new Date(String(form.get("startsAt"))).toISOString(), endsAt: new Date(String(form.get("endsAt"))).toISOString(),
      status: String(form.get("status")) as AdminFlashSaleCampaign["status"],
      voucherPolicy: String(form.get("voucherPolicy")) as "none" | "shipping_only", fundingSource: "platform",
    }), "create-campaign");
  };

  const changeStatus = (campaign: AdminFlashSaleCampaign, status: AdminFlashSaleCampaign["status"]) => run(
    () => saveFlashSaleCampaignAction({ ...campaign, subtitle: campaign.subtitle ?? "",
      voucherPolicy: campaign.voucherPolicy === "none" ? "none" : "shipping_only", fundingSource: "platform", status }),
    `campaign-${campaign.id}`
  );

  const review = (proposal: FlashSaleProposal, approve: boolean) => run(
    () => reviewFlashSaleProposalAction(proposal.id, approve, reviewNotes[proposal.id] ?? ""),
    `proposal-${proposal.id}`
  );

  return <section className="admin-panel admin-flash-sale-panel">
    <header className="admin-flash-header">
      <div className="admin-flash-header__icon"><LocalFireDepartmentOutlinedIcon /></div>
      <div><p>Vận hành chiến dịch</p><h2>Flash Sale</h2><span>Nhà hàng gửi món, Admin kiểm tra và duyệt trước khi mở bán.</span></div>
      <Button variant="outlined" disabled={pending} onClick={() => run(maintainFlashSalesAction, "maintenance")}>{workingKey === "maintenance" ? <CircularProgress size={17} color="inherit" /> : "Chạy bảo trì"}</Button>
    </header>
    {message ? <Alert severity={message.error ? "error" : "success"}>{message.text}</Alert> : null}

    <div className="admin-flash-finance">
      <article><span>Đang chờ duyệt</span><strong>{pendingProposals.length}</strong></article>
      <article><span>Đơn Flash Sale</span><strong>{data.finance.orders}</strong></article>
      <article><span>Tổng giảm</span><strong>{money(data.finance.discount)}</strong></article>
      <article><span>EatNow tài trợ</span><strong>{money(data.finance.platformFunded)}</strong></article>
      <article><span>Nhà hàng tài trợ</span><strong>{money(data.finance.restaurantFunded)}</strong></article>
    </div>

    <nav className="admin-flash-tabs" aria-label="Quản lý Flash Sale">
      <button type="button" className={tab === "campaigns" ? "is-active" : ""} aria-current={tab === "campaigns" ? "page" : undefined} onClick={() => setTab("campaigns")}><span>Chiến dịch</span><b>{data.campaigns.length}</b></button>
      <button type="button" className={tab === "pending" ? "is-active" : ""} aria-current={tab === "pending" ? "page" : undefined} onClick={() => setTab("pending")}><span>Chờ duyệt</span><b className={pendingProposals.length ? "has-pending" : ""}>{pendingProposals.length}</b></button>
      <button type="button" className={tab === "approved" ? "is-active" : ""} aria-current={tab === "approved" ? "page" : undefined} onClick={() => setTab("approved")}><span>Món đã duyệt</span><b>{data.items.length}</b></button>
      <button type="button" className={tab === "history" ? "is-active" : ""} aria-current={tab === "history" ? "page" : undefined} onClick={() => setTab("history")}><span>Lịch sử duyệt</span><b>{proposalHistory.length}</b></button>
    </nav>

    {tab === "pending" && <section className="admin-flash-section admin-flash-section--pending admin-flash-tab-panel">
      <div className="admin-flash-section__heading"><div><p>Cần xử lý</p><h3>Hàng chờ duyệt</h3></div><span>{pendingProposals.length} đề xuất</span></div>
      {pendingProposals.length === 0 ? <div className="admin-flash-empty"><strong>Đã xử lý hết đề xuất</strong><span>Đề xuất mới từ nhà hàng sẽ xuất hiện tại đây.</span></div> : <div className="admin-flash-review-grid">
        {pendingProposals.map((proposal, index) => <article className={`admin-flash-review-card tone-${index % 4}`} key={proposal.id}>
          <header><i>{initials(proposal.restaurantName)}</i><div><span>{proposal.restaurantName}</span><h4>{proposal.foodName}</h4></div><b>{PROPOSAL_STATUS[proposal.status]}</b></header>
          <dl><div><dt>Chiến dịch</dt><dd>{proposal.campaignName}</dd></div><div><dt>Giá đề xuất</dt><dd>{money(proposal.proposedSalePrice)}</dd></div><div><dt>Số suất</dt><dd>{proposal.proposedStockLimit}</dd></div><div><dt>Giới hạn</dt><dd>{proposal.proposedPerUserLimit}/khách</dd></div></dl>
          <p className="admin-flash-funding"><FundingText proposal={proposal} /></p>
          {proposal.note && <blockquote>{proposal.note}</blockquote>}
          <label>Phản hồi cho nhà hàng<textarea rows={2} maxLength={1000} placeholder="Lý do hoặc ghi chú khi duyệt" value={reviewNotes[proposal.id] ?? ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [proposal.id]: event.target.value }))} /></label>
          <footer><button className="is-reject" type="button" disabled={pending} onClick={() => review(proposal, false)}>Từ chối</button><button className="is-approve" type="button" disabled={pending} onClick={() => review(proposal, true)}>{workingKey === `proposal-${proposal.id}` ? <CircularProgress size={16} color="inherit" /> : "Duyệt món"}</button></footer>
        </article>)}
      </div>}
    </section>}

    {tab === "campaigns" && <div className="admin-flash-management admin-flash-tab-panel">
      <form className="admin-flash-card admin-flash-campaign-form" onSubmit={saveCampaign}>
        <div className="admin-flash-card__heading"><div><p>Thiết lập</p><h3>Tạo chiến dịch</h3></div></div>
        <label>Tên chiến dịch<input name="name" required maxLength={120} placeholder="Ví dụ: Deal trưa đồng giá" /></label>
        <label>Mô tả<input name="subtitle" maxLength={240} placeholder="Thông điệp hiển thị trên trang chủ" /></label>
        <div className="admin-flash-form-row"><label>Bắt đầu<input name="startsAt" type="datetime-local" required /></label><label>Kết thúc<input name="endsAt" type="datetime-local" required /></label></div>
        <div className="admin-flash-form-row"><label>Trạng thái<select name="status" defaultValue="draft"><option value="draft">Bản nháp</option><option value="active">Kích hoạt</option></select></label><label>Voucher<select name="voucherPolicy" defaultValue="shipping_only"><option value="shipping_only">Chỉ phí giao hàng</option><option value="none">Không áp dụng</option></select></label></div>
        <Button type="submit" variant="contained" disabled={pending}>{workingKey === "create-campaign" ? <CircularProgress size={18} color="inherit" /> : "Tạo chiến dịch"}</Button>
      </form>

      <section className="admin-flash-card admin-flash-campaign-list">
        <div className="admin-flash-card__heading"><div><p>Điều phối</p><h3>Chiến dịch</h3></div><span>{data.campaigns.length}</span></div>
        {data.campaigns.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có chiến dịch</strong></div> : data.campaigns.map((campaign, index) => {
          const itemCount = data.items.filter((item) => item.campaignId === campaign.id).length;
          const waitingCount = pendingProposals.filter((proposal) => proposal.campaignId === campaign.id).length;
          return <article className={`${campaign.id === campaignId ? "is-selected " : ""}tone-${index % 4}`} key={campaign.id}>
            <button className="admin-flash-campaign-select" type="button" onClick={() => setCampaignId(campaign.id)}><i>{String(index + 1).padStart(2, "0")}</i><span><small>Chiến dịch</small><strong>{campaign.name}</strong><em>{campaign.subtitle || "Chưa có mô tả"}</em><time>{new Date(campaign.startsAt).toLocaleString("vi-VN")} – {new Date(campaign.endsAt).toLocaleString("vi-VN")}</time></span><b className={`is-${campaign.status}`}>{CAMPAIGN_STATUS[campaign.status]}</b></button>
            <div className="admin-flash-campaign-stats"><span><b>{itemCount}</b> món đã duyệt</span><span><b>{waitingCount}</b> đang chờ</span></div>
            <footer>{campaign.status !== "active" && campaign.status !== "ended" ? <button type="button" onClick={() => changeStatus(campaign, "active")}>Kích hoạt</button> : null}{campaign.status === "active" ? <button type="button" onClick={() => changeStatus(campaign, "paused")}>Tạm dừng</button> : null}{campaign.status !== "ended" ? <button type="button" onClick={() => changeStatus(campaign, "ended")}>Kết thúc</button> : null}</footer>
          </article>;
        })}
      </section>
    </div>}

    {tab === "approved" && <section className="admin-flash-section admin-flash-tab-panel">
      <div className="admin-flash-section__heading"><div><p>Theo chiến dịch</p><h3>Món đã được duyệt</h3></div><div className="admin-flash-approved-filter"><select aria-label="Lọc món theo chiến dịch" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>{data.campaigns.map((campaign) => <option value={campaign.id} key={campaign.id}>{campaign.name}</option>)}</select><span>{campaignItems.length} món</span></div></div>
      {!selected || campaignItems.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có món được duyệt</strong><span>Chọn chiến dịch và duyệt đề xuất của nhà hàng để thêm món.</span></div> : <div className="admin-flash-approved-grid">{campaignItems.map((item, index) => {
        const used = item.soldQuantity + item.reservedQuantity;
        const remaining = Math.max(item.stockLimit - used, 0);
        const percent = item.stockLimit > 0 ? Math.min(used / item.stockLimit * 100, 100) : 0;
        return <article className={`tone-${index % 4}`} key={item.id}><header><i>{initials(item.restaurantName)}</i><div><span>{item.restaurantName}</span><strong>{item.foodName}</strong></div></header><p><b>{money(item.salePrice)}</b><del>{money(item.originalPrice)}</del></p><div className="admin-flash-stock"><span><b>{remaining}</b>/{item.stockLimit} suất còn lại</span><div><i style={{ width: `${percent}%` }} /></div></div><small>Đã bán {item.soldQuantity} · Đang giữ {item.reservedQuantity}</small><em>{item.fundingSource === "platform" ? "EatNow 100%" : item.fundingSource === "restaurant" ? "Nhà hàng 100%" : `EatNow ${item.platformFundingPercent}% · Nhà hàng ${100 - item.platformFundingPercent}%`}</em></article>;
      })}</div>}
    </section>}

    {tab === "history" && <section className="admin-flash-section admin-flash-section--history admin-flash-tab-panel">
      <div className="admin-flash-section__heading"><div><p>Đã xử lý</p><h3>Lịch sử duyệt</h3></div><span>{proposalHistory.length} đề xuất</span></div>
      {proposalHistory.length === 0 ? <div className="admin-flash-empty"><strong>Chưa có lịch sử</strong></div> : <div className="admin-flash-history-list">{proposalHistory.map((proposal) => <article className={`is-${proposal.status}`} key={proposal.id}><i>{initials(proposal.restaurantName)}</i><div><strong>{proposal.foodName}</strong><span>{proposal.restaurantName} · {proposal.campaignName}</span></div><div><b>{money(proposal.proposedSalePrice)} · {proposal.proposedStockLimit} suất</b><small><FundingText proposal={proposal} /></small></div><em className={`is-${proposal.status}`}>{PROPOSAL_STATUS[proposal.status]}</em>{proposal.reviewNote && <p>{proposal.reviewNote}</p>}</article>)}</div>}
    </section>}
  </section>;
}
