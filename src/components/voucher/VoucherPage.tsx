"use client";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Alert, Snackbar } from "@mui/material";
import { useMemo, useState } from "react";

import type { PublicVoucher } from "@/types/voucher";

type Filter = "all" | "shipping" | "items" | "percent" | "restaurant" | "expiring";
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Tất cả" }, { id: "shipping", label: "Freeship" },
  { id: "items", label: "Giảm món" }, { id: "percent", label: "Giảm theo %" },
  { id: "restaurant", label: "Nhà hàng" }, { id: "expiring", label: "Sắp hết hạn" },
];

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function expiringSoon(value: string) {
  const remaining = new Date(value).getTime() - Date.now();
  return remaining > 0 && remaining <= 3 * 86_400_000;
}

function benefit(voucher: PublicVoucher) {
  const target = voucher.benefitScope === "shipping" ? "phí giao hàng" : "tiền món";
  if (voucher.discountType === "fixed") return `Giảm ${money(voucher.discountValue)} ${target}`;
  return `Giảm ${voucher.discountValue}% ${target}${voucher.maxDiscount ? `, tối đa ${money(voucher.maxDiscount)}` : ""}`;
}

function scope(voucher: PublicVoucher) {
  if (voucher.targetScope === "system") return "Áp dụng toàn hệ thống";
  if (voucher.targetScope === "restaurant") return voucher.targets.length
    ? `Áp dụng tại ${voucher.targets.map((target) => target.name).join(", ")}`
    : "Áp dụng tại nhà hàng phát hành";
  if (voucher.targetScope === "category") return `Cho category: ${voucher.targets.map((target) => target.name).join(", ")}`;
  return `Cho món: ${voucher.targets.map((target) => target.name).join(", ")}`;
}

export default function VoucherPage({ vouchers }: { vouchers: PublicVoucher[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    return vouchers.filter((voucher) => {
      const matchesSearch = !query || voucher.code.toLocaleLowerCase("vi").includes(query) ||
        voucher.name.toLocaleLowerCase("vi").includes(query) || voucher.description.toLocaleLowerCase("vi").includes(query);
      const matchesFilter = filter === "all" || voucher.benefitScope === filter ||
        (filter === "percent" && voucher.discountType === "percent") ||
        (filter === "restaurant" && voucher.targetScope === "restaurant") ||
        (filter === "expiring" && expiringSoon(voucher.expiredAt));
      return matchesSearch && matchesFilter;
    });
  }, [filter, searchTerm, vouchers]);

  const choose = (voucher: PublicVoucher) => {
    navigator.clipboard?.writeText(voucher.code).catch(() => undefined);
    setSnackbar({ open: true, message: `Đã sao chép ${voucher.code}. Chọn mã này khi xác nhận đơn hàng.` });
  };

  const applySearch = () => {
    const code = searchTerm.trim().toUpperCase();
    if (!code) return setSnackbar({ open: true, message: "Hãy nhập mã voucher trước." });
    const voucher = vouchers.find((item) => item.code.toUpperCase() === code);
    setSnackbar({ open: true, message: voucher
      ? `${voucher.code} đang hoạt động. Bạn có thể chọn mã ở bước xác nhận đơn.`
      : "Không tìm thấy mã đang hoạt động hoặc mã đã hết điều kiện." });
  };

  return <div className="voucher-page"><main className="voucher-main">
    <section className="voucher-hero"><div className="voucher-hero__content"><span className="voucher-hero__eyebrow">Ưu đãi đang hoạt động</span><h1>Deal thật, giảm đúng</h1><p>Voucher được lấy trực tiếp từ chiến dịch của EatNow và các nhà hàng.</p></div><div className="voucher-hero__visual" aria-hidden="true"><LocalOfferOutlinedIcon /><strong>{vouchers.length}</strong></div></section>
    <section className="voucher-toolbar" aria-label="Tìm và lọc voucher"><div className="voucher-search-bar"><SearchOutlinedIcon className="voucher-search-icon" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") applySearch(); }} placeholder="Tìm voucher hoặc nhập mã ưu đãi" className="voucher-search-input" /><button className="voucher-apply-button" type="button" onClick={applySearch}>Kiểm tra mã</button></div><div className="voucher-filters">{FILTERS.map((item) => <button key={item.id} type="button" className={`voucher-filter-chip ${filter === item.id ? "is-active" : ""}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></section>
    <section className="voucher-section"><div className="voucher-section-heading"><div><span>Có thể sử dụng</span><h2>Voucher dành cho đơn hàng</h2></div><small>{filtered.length} voucher</small></div><div className="voucher-grid">
      {filtered.map((voucher) => <article className="voucher-card" key={voucher.id}><div className={`voucher-card__left ${voucher.benefitScope === "shipping" ? "voucher-icon-bg--info" : "voucher-icon-bg--primary"}`}><span className={`voucher-card__icon ${voucher.benefitScope === "shipping" ? "voucher-icon--info" : "voucher-icon--primary"}`}>{voucher.benefitScope === "shipping" ? <LocalShippingOutlinedIcon /> : voucher.targetScope === "restaurant" ? <RestaurantOutlinedIcon /> : <ConfirmationNumberOutlinedIcon />}</span><span className="voucher-card__code">{voucher.code}</span></div><div className="voucher-card__right"><div className="voucher-card__info"><h3>{voucher.name}</h3><p>{benefit(voucher)}. {scope(voucher)}{voucher.minOrderValue > 0 ? ` · Đơn từ ${money(voucher.minOrderValue)}` : ""}.</p></div><div className="voucher-card__footer"><span className={`voucher-card__expiry ${expiringSoon(voucher.expiredAt) ? "is-urgent" : ""}`}>HSD: {new Date(voucher.expiredAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}</span><button type="button" onClick={() => choose(voucher)}>Dùng khi đặt món</button></div></div></article>)}
      {filtered.length === 0 && <div className="voucher-empty"><ConfirmationNumberOutlinedIcon /><h3>Chưa có voucher phù hợp</h3><p>Thử từ khóa hoặc nhóm ưu đãi khác.</p></div>}
    </div></section>
  </main><Snackbar open={snackbar.open} autoHideDuration={3200} onClose={() => setSnackbar((value) => ({ ...value, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity="info" variant="filled" onClose={() => setSnackbar((value) => ({ ...value, open: false }))}>{snackbar.message}</Alert></Snackbar></div>;
}
