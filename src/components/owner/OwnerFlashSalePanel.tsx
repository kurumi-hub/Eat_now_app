"use client";

import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { cancelFlashSaleProposalAction, submitFlashSaleProposalAction } from "@/app/owner/actions";
import type { OwnerFlashSaleWorkspace } from "@/types/flashSale";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;
const STATUS = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", cancelled: "Đã hủy" } as const;

export default function OwnerFlashSalePanel({ restaurantId, data }: { restaurantId: string; data: OwnerFlashSaleWorkspace }) {
  const [foodId, setFoodId] = useState(data.foods[0]?.id ?? "");
  const [funding, setFunding] = useState<"restaurant" | "shared">("restaurant");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const food = useMemo(() => data.foods.find((item) => item.id === foodId), [data.foods, foodId]);
  const run = (task: () => Promise<{ ok: boolean; message: string }>) => startTransition(async () => setNotice(await task()));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() => submitFlashSaleProposalAction({
      campaignId: String(form.get("campaignId")), restaurantId, foodId: String(form.get("foodId")),
      salePrice: Number(form.get("salePrice")), stockLimit: Number(form.get("stockLimit")),
      perUserLimit: Number(form.get("perUserLimit")), fundingSource: funding,
      platformFundingPercent: funding === "shared" ? Number(form.get("platformFundingPercent")) : 0,
      note: String(form.get("note") ?? ""),
    }));
  };

  return <div className="owner-flash">
    <header className="owner-card owner-flash__hero">
      <div><p>Flash Sale</p><h2><LocalFireDepartmentOutlinedIcon /> Đăng ký món cho chiến dịch</h2><span>Chọn món, số suất và nguồn tài trợ. Admin duyệt xong thì món mới xuất hiện trong chiến dịch.</span></div>
    </header>
    {notice && <div className={`owner-notice ${notice.ok ? "is-success" : "is-error"}`} role="status">{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}

    <section className="owner-flash__metrics">
      <article><span>Đơn Flash Sale</span><strong>{data.finance.orders}</strong></article>
      <article><span>Số phần đã bán</span><strong>{data.finance.quantity}</strong></article>
      <article><span>Nhà hàng tài trợ</span><strong>{money(data.finance.restaurantFunded)}</strong></article>
      <article><span>EatNow tài trợ</span><strong>{money(data.finance.platformFunded)}</strong></article>
    </section>

    <div className="owner-flash__grid">
      <form className="owner-card owner-flash__form" onSubmit={submit}>
        <h3>Gửi đề xuất mới</h3>
        {data.campaigns.length === 0 ? <p>Hiện chưa có chiến dịch nhận đề xuất.</p> : <>
          <label>Chiến dịch<select name="campaignId" required>{data.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {new Date(campaign.startsAt).toLocaleString("vi-VN")}</option>)}</select></label>
          <label>Món<select name="foodId" required value={foodId} onChange={(event) => setFoodId(event.target.value)}>{data.foods.map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.basePrice)}</option>)}</select></label>
          {food?.sizes.length ? <p className="owner-flash__hint">Giá sale thay giá cơ bản. Size lớn vẫn cộng phần chênh lệch hiện tại: {food.sizes.map((size) => `${size.name} ${money(Math.max(0, size.price - food.basePrice))}`).join(" · ")}.</p> : null}
          <div><label>Giá sale<input name="salePrice" type="number" min="1" max={food ? food.basePrice - 1 : undefined} step="1" inputMode="numeric" required /></label><label>Tổng số suất<input name="stockLimit" type="number" min="1" max="100000" required /></label></div>
          <label>Tối đa mỗi khách<input name="perUserLimit" type="number" min="1" max="20" defaultValue="2" required /></label>
          <label>Nguồn tài trợ<select value={funding} onChange={(event) => setFunding(event.target.value as "restaurant" | "shared")}><option value="restaurant">Nhà hàng tài trợ 100%</option><option value="shared">EatNow và nhà hàng cùng tài trợ</option></select></label>
          {funding === "shared" && <label>EatNow tài trợ (%)<input name="platformFundingPercent" type="number" min="1" max="99" defaultValue="50" required /></label>}
          <label>Ghi chú<textarea name="note" maxLength={1000} rows={3} placeholder="Khung giờ hoặc thông tin Admin cần biết" /></label>
          <button type="submit" disabled={pending || !food}>{pending ? "Đang gửi…" : "Gửi Admin duyệt"}</button>
        </>}
      </form>

      <section className="owner-card owner-flash__proposals">
        <h3>Đề xuất của nhà hàng</h3>
        {data.proposals.length === 0 ? <p>Chưa có đề xuất nào.</p> : data.proposals.map((proposal) => <article key={proposal.id}>
          <div><strong>{proposal.foodName}</strong><span className={`owner-flash__status is-${proposal.status}`}>{STATUS[proposal.status]}</span></div>
          <b>{money(proposal.proposedSalePrice)} · {proposal.proposedStockLimit} suất</b>
          <small>{proposal.campaignName} · {proposal.fundingSource === "restaurant" ? "Nhà hàng tài trợ" : `EatNow ${proposal.platformFundingPercent}%`}</small>
          {proposal.reviewNote && <p>Admin: {proposal.reviewNote}</p>}
          {proposal.status === "pending" && <button className="owner-flash__cancel" type="button" disabled={pending} onClick={() => run(() => cancelFlashSaleProposalAction(proposal.id))}>Hủy đề xuất</button>}
        </article>)}
      </section>
    </div>
  </div>;
}
