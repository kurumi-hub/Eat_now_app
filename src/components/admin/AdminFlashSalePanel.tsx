"use client";

import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useState, useTransition, type FormEvent } from "react";

import { maintainFlashSalesAction, reviewFlashSaleProposalAction, saveFlashSaleCampaignAction, saveFlashSaleItemAction } from "@/app/admin/actions";
import type { AdminFlashSaleCampaign, AdminFlashSaleData } from "@/types/flashSale";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;
export default function AdminFlashSalePanel({ data }: { data: AdminFlashSaleData }) {
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id ?? "");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const selected = data.campaigns.find((campaign) => campaign.id === campaignId);
  const campaignItems = data.items.filter((item) => item.campaignId === campaignId);

  const run = (task: () => Promise<{ ok: boolean; message: string }>) => {
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      setMessage({ text: result.message, error: !result.ok });
    });
  };

  const saveCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() => saveFlashSaleCampaignAction({
      name: String(form.get("name") ?? ""), subtitle: String(form.get("subtitle") ?? ""),
      startsAt: new Date(String(form.get("startsAt"))).toISOString(),
      endsAt: new Date(String(form.get("endsAt"))).toISOString(),
      status: String(form.get("status")) as AdminFlashSaleCampaign["status"],
      voucherPolicy: String(form.get("voucherPolicy")) as "none" | "shipping_only",
      fundingSource: "platform",
    }));
  };

  const changeStatus = (campaign: AdminFlashSaleCampaign, status: AdminFlashSaleCampaign["status"]) => run(() =>
    saveFlashSaleCampaignAction({ ...campaign, startsAt: campaign.startsAt, endsAt: campaign.endsAt,
      subtitle: campaign.subtitle ?? "", voucherPolicy: campaign.voucherPolicy === "none" ? "none" : "shipping_only",
      fundingSource: "platform", status })
  );

  const saveItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() => saveFlashSaleItemAction({
      campaignId, foodId: String(form.get("foodId")), salePrice: Number(form.get("salePrice")),
      stockLimit: Number(form.get("stockLimit")), perUserLimit: Number(form.get("perUserLimit")),
      displayOrder: Number(form.get("displayOrder")), isActive: true,
    }));
  };

  return (
    <section className="admin-panel admin-flash-sale-panel">
      <div className="admin-panel__heading"><div><h2><LocalFireDepartmentOutlinedIcon /> Flash Sale</h2><p>Duyệt món do nhà hàng đề xuất, phân bổ suất, theo dõi nguồn tài trợ và tồn giữ theo thời gian thực.</p></div><Button variant="outlined" disabled={pending} onClick={() => run(maintainFlashSalesAction)}>Chạy bảo trì</Button></div>
      {message ? <Alert severity={message.error ? "error" : "success"}>{message.text}</Alert> : null}
      <div className="admin-flash-finance">
        <article><span>Đơn Flash Sale</span><strong>{data.finance.orders}</strong></article><article><span>Số phần</span><strong>{data.finance.quantity}</strong></article>
        <article><span>Tổng giảm</span><strong>{money(data.finance.discount)}</strong></article><article><span>EatNow tài trợ</span><strong>{money(data.finance.platformFunded)}</strong></article><article><span>Nhà hàng tài trợ</span><strong>{money(data.finance.restaurantFunded)}</strong></article>
      </div>
      <div className="admin-flash-grid">
        <form className="admin-flash-form" onSubmit={saveCampaign}>
          <h3>Tạo chiến dịch</h3>
          <label>Tên<input name="name" required maxLength={120} /></label>
          <label>Mô tả<input name="subtitle" maxLength={240} /></label>
          <div><label>Bắt đầu<input name="startsAt" type="datetime-local" required /></label><label>Kết thúc<input name="endsAt" type="datetime-local" required /></label></div>
          <div><label>Trạng thái<select name="status" defaultValue="draft"><option value="draft">Bản nháp</option><option value="active">Kích hoạt</option></select></label><label>Voucher<select name="voucherPolicy" defaultValue="shipping_only"><option value="shipping_only">Chỉ phí giao hàng</option><option value="none">Không áp dụng</option></select></label></div>
          <Button type="submit" variant="contained" disabled={pending}>{pending ? <CircularProgress size={18} /> : "Tạo chiến dịch"}</Button>
        </form>

        <div className="admin-flash-campaigns">
          <h3>Chiến dịch</h3>
          {data.campaigns.length === 0 ? <p>Chưa có chiến dịch.</p> : data.campaigns.map((campaign) => (
            <article key={campaign.id} className={campaign.id === campaignId ? "is-selected" : ""} onClick={() => setCampaignId(campaign.id)}>
              <div><strong>{campaign.name}</strong><span>{campaign.status}</span></div>
              <small>{new Date(campaign.startsAt).toLocaleString("vi-VN")} – {new Date(campaign.endsAt).toLocaleString("vi-VN")}</small>
              <div className="admin-flash-actions">
                {campaign.status !== "active" ? <button type="button" onClick={(e) => { e.stopPropagation(); changeStatus(campaign,"active"); }}>Kích hoạt</button> : <button type="button" onClick={(e) => { e.stopPropagation(); changeStatus(campaign,"paused"); }}>Tạm dừng</button>}
                <button type="button" onClick={(e) => { e.stopPropagation(); changeStatus(campaign,"ended"); }}>Kết thúc</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected ? <div className="admin-flash-items">
        <form className="admin-flash-form" onSubmit={saveItem}>
          <h3>Thêm món vào “{selected.name}”</h3>
          <label>Món<select name="foodId" required defaultValue=""><option value="" disabled>Chọn món</option>{data.foods.map((food) => <option value={food.id} key={food.id}>{food.restaurantName} · {food.name} · {money(food.basePrice)}</option>)}</select></label>
          <p className="admin-flash-hint">Với món có size, giá sale thay giá cơ bản và hệ thống giữ nguyên phần chênh lệch của từng size.</p>
          <div><label>Giá sale<input name="salePrice" type="number" min="1" step="1000" required /></label><label>Tổng số suất<input name="stockLimit" type="number" min="1" max="100000" required /></label></div>
          <div><label>Tối đa/khách<input name="perUserLimit" type="number" min="1" max="20" defaultValue="2" required /></label><label>Thứ tự<input name="displayOrder" type="number" min="0" defaultValue="0" /></label></div>
          <Button type="submit" variant="contained" disabled={pending}>Lưu món</Button>
        </form>
        <div className="admin-flash-item-list">
          {campaignItems.map((item) => <article key={item.id}><div><strong>{item.foodName}</strong><span>{item.restaurantName}</span></div><b>{money(item.salePrice)} <del>{money(item.originalPrice)}</del></b><small>Đã bán {item.soldQuantity} · Đang giữ {item.reservedQuantity} · Còn {item.stockLimit-item.soldQuantity-item.reservedQuantity}</small><small>{item.fundingSource === "platform" ? "EatNow tài trợ 100%" : item.fundingSource === "restaurant" ? "Nhà hàng tài trợ 100%" : `EatNow ${item.platformFundingPercent}% · Nhà hàng ${100-item.platformFundingPercent}%`}</small></article>)}
        </div>
      </div> : null}

      <section className="admin-flash-proposals">
        <h3>Đề xuất từ nhà hàng</h3>
        {data.proposals.length === 0 ? <p>Chưa có đề xuất.</p> : data.proposals.map((proposal) => <article key={proposal.id}>
          <div><strong>{proposal.restaurantName} · {proposal.foodName}</strong><span className={`is-${proposal.status}`}>{proposal.status}</span></div>
          <b>{proposal.campaignName} · {money(proposal.proposedSalePrice)} · {proposal.proposedStockLimit} suất</b>
          <small>{proposal.fundingSource === "restaurant" ? "Nhà hàng tài trợ 100%" : `EatNow ${proposal.platformFundingPercent}% · Nhà hàng ${100-proposal.platformFundingPercent}%`} · tối đa {proposal.proposedPerUserLimit}/khách</small>
          {proposal.note && <p>Owner: {proposal.note}</p>}{proposal.reviewNote && <p>Admin: {proposal.reviewNote}</p>}
          {proposal.status === "pending" && <><textarea rows={2} maxLength={1000} placeholder="Ghi chú phản hồi" value={reviewNotes[proposal.id] ?? ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [proposal.id]: event.target.value }))} /><div className="admin-flash-actions"><button type="button" disabled={pending} onClick={() => run(() => reviewFlashSaleProposalAction(proposal.id, true, reviewNotes[proposal.id] ?? ""))}>Duyệt</button><button type="button" disabled={pending} onClick={() => run(() => reviewFlashSaleProposalAction(proposal.id, false, reviewNotes[proposal.id] ?? ""))}>Từ chối</button></div></>}
        </article>)}
      </section>
    </section>
  );
}
