"use client";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { claimVoucherAction } from "@/app/vouchers/actions";
import type { CustomerVoucherData, PublicVoucher, VoucherWalletItem } from "@/types/voucher";

type Filter = "all" | "shipping" | "items" | "percent" | "restaurant" | "expiring";
type Tab = "discover" | "wallet" | "history";
type DisplayVoucher = PublicVoucher | VoucherWalletItem;

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

function isWalletItem(voucher: DisplayVoucher): voucher is VoucherWalletItem {
  return "walletId" in voucher;
}

function matches(voucher: DisplayVoucher, query: string, filter: Filter) {
  const matchesSearch = !query || voucher.code.toLocaleLowerCase("vi").includes(query) ||
    voucher.name.toLocaleLowerCase("vi").includes(query) || voucher.description.toLocaleLowerCase("vi").includes(query);
  const matchesFilter = filter === "all" || voucher.benefitScope === filter ||
    (filter === "percent" && voucher.discountType === "percent") ||
    (filter === "restaurant" && voucher.issuerType === "restaurant") ||
    (filter === "expiring" && expiringSoon(isWalletItem(voucher) ? voucher.walletExpiresAt : voucher.expiredAt));
  return matchesSearch && matchesFilter;
}

export default function VoucherPage({ data, isAuthenticated }: {
  data: CustomerVoucherData;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [claimingId, setClaimingId] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", error: false });
  const [pending, startTransition] = useTransition();

  const availableWallet = data.wallet.filter((item) => item.walletStatus === "available" || item.walletStatus === "reserved");
  const walletHistory = data.wallet.filter((item) => !["available", "reserved"].includes(item.walletStatus));
  const source: DisplayVoucher[] = tab === "discover" ? data.discover : tab === "wallet" ? availableWallet : walletHistory;
  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    return source.filter((voucher) => matches(voucher, query, filter));
  }, [filter, searchTerm, source]);

  const copyForCheckout = (voucher: DisplayVoucher) => {
    navigator.clipboard?.writeText(voucher.code).catch(() => undefined);
    setSnackbar({ open: true, error: false, message: `Đã sao chép ${voucher.code}. Chọn mã này khi xác nhận đơn hàng.` });
  };

  const claim = (voucher: PublicVoucher) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/vouchers");
      return;
    }
    if (!voucher.canClaim) {
      setSnackbar({ open: true, error: false, message: voucher.walletAvailableCount > 0 ? "Voucher đã có trong kho của bạn." : "Bạn không thể nhận thêm voucher này." });
      return;
    }
    setClaimingId(voucher.id);
    startTransition(async () => {
      const result = await claimVoucherAction(voucher.id);
      setClaimingId("");
      setSnackbar({ open: true, error: !result.ok, message: result.message });
      if (result.ok) { setTab("wallet"); router.refresh(); }
    });
  };

  const applySearch = () => {
    const code = searchTerm.trim().toUpperCase();
    if (!code) return setSnackbar({ open: true, error: false, message: "Hãy nhập mã voucher trước." });
    const voucher = [...data.discover, ...data.wallet].find((item) => item.code.toUpperCase() === code);
    setSnackbar({ open: true, error: !voucher, message: voucher
      ? `${voucher.code} đã được tìm thấy trong ${isWalletItem(voucher) ? "kho voucher" : "danh sách ưu đãi"}.`
      : "Không tìm thấy mã đang hoạt động hoặc mã đã hết điều kiện." });
  };

  return <div className="voucher-page"><main className="voucher-main">
    <section className="voucher-hero"><div className="voucher-hero__content"><span className="voucher-hero__eyebrow">Kho ưu đãi cá nhân</span><h1>Nhận trước, dùng đúng lúc</h1><p>Voucher tự động luôn khả dụng. Voucher giới hạn cần được nhận vào kho trước khi thanh toán.</p></div><div className="voucher-hero__visual" aria-hidden="true"><LocalOfferOutlinedIcon /><strong>{availableWallet.length}</strong></div></section>

    <nav className="voucher-tabs" aria-label="Kho voucher">
      <button className={tab === "discover" ? "is-active" : ""} onClick={() => setTab("discover")}><span>Khám phá</span><small>{data.discover.length}</small></button>
      <button className={tab === "wallet" ? "is-active" : ""} onClick={() => setTab("wallet")}><span>Kho của tôi</span><small>{availableWallet.length}</small></button>
      <button className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")}><span>Đã dùng / Hết hạn</span><small>{walletHistory.length}</small></button>
    </nav>

    <section className="voucher-toolbar" aria-label="Tìm và lọc voucher"><div className="voucher-search-bar"><SearchOutlinedIcon className="voucher-search-icon" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") applySearch(); }} placeholder="Tìm voucher hoặc nhập mã ưu đãi" className="voucher-search-input" /><button className="voucher-apply-button" type="button" onClick={applySearch}>Kiểm tra mã</button></div><div className="voucher-filters">{FILTERS.map((item) => <button key={item.id} type="button" className={`voucher-filter-chip ${filter === item.id ? "is-active" : ""}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></section>

    <section className="voucher-section"><div className="voucher-section-heading"><div><span>{tab === "discover" ? "Ưu đãi đang phát hành" : tab === "wallet" ? "Sẵn sàng sử dụng" : "Lịch sử kho"}</span><h2>{tab === "discover" ? "Voucher dành cho bạn" : tab === "wallet" ? "Kho voucher của tôi" : "Voucher không còn khả dụng"}</h2></div><small>{filtered.length} voucher</small></div><div className="voucher-grid">
      {filtered.map((voucher) => {
        const wallet = isWalletItem(voucher) ? voucher : null;
        const inactive = wallet && !["available", "reserved"].includes(wallet.walletStatus);
        const expiry = wallet?.walletExpiresAt ?? voucher.expiredAt;
        return <article className={`voucher-card ${inactive ? "is-inactive" : ""}`} key={wallet?.walletId ?? voucher.id}>
          <div className={`voucher-card__left ${voucher.benefitScope === "shipping" ? "voucher-icon-bg--info" : inactive ? "voucher-icon-bg--disabled" : "voucher-icon-bg--primary"}`}><span className={`voucher-card__icon ${voucher.benefitScope === "shipping" ? "voucher-icon--info" : inactive ? "voucher-icon--disabled" : "voucher-icon--primary"}`}>{voucher.benefitScope === "shipping" ? <LocalShippingOutlinedIcon /> : voucher.issuerType === "restaurant" ? <RestaurantOutlinedIcon /> : <ConfirmationNumberOutlinedIcon />}</span><span className="voucher-card__code">{voucher.code}</span></div>
          <div className="voucher-card__right">
            {wallet && <span className={`voucher-badge is-${wallet.walletStatus}`}>{wallet.walletStatus === "available" ? "Có thể dùng" : wallet.walletStatus === "reserved" ? "Đang giữ cho đơn" : wallet.walletStatus === "used" ? "Đã dùng" : wallet.walletStatus === "expired" ? "Hết hạn" : "Đã thu hồi"}</span>}
            {!wallet && <span className={`voucher-badge is-${voucher.distributionMode}`}>{voucher.distributionMode === "auto" ? "Tự động" : voucher.walletAvailableCount > 0 ? `Trong kho: ${voucher.walletAvailableCount}` : "Cần nhận"}</span>}
            <div className="voucher-card__info"><h3>{voucher.name}</h3><p>{benefit(voucher)}. {scope(voucher)}{voucher.minOrderValue > 0 ? ` · Đơn từ ${money(voucher.minOrderValue)}` : ""}.</p></div>
            <div className="voucher-card__footer"><span className={`voucher-card__expiry ${expiringSoon(expiry) ? "is-urgent" : ""}`}>HSD: {new Date(expiry).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}</span>
              {tab === "discover" && voucher.distributionMode === "claim" ? <button type="button" disabled={pending && claimingId === voucher.id} onClick={() => claim(voucher)}>{!isAuthenticated ? "Đăng nhập để nhận" : pending && claimingId === voucher.id ? "Đang nhận..." : voucher.canClaim ? (voucher.walletAvailableCount > 0 ? "Nhận thêm" : "Nhận voucher") : voucher.walletAvailableCount > 0 ? "Đã có trong kho" : "Hết lượt nhận"}</button>
                : tab !== "history" && wallet?.walletStatus !== "reserved" ? <button type="button" onClick={() => copyForCheckout(voucher)}>Dùng khi đặt món</button> : null}
            </div>
          </div>
        </article>;
      })}
      {filtered.length === 0 && <div className="voucher-empty"><ConfirmationNumberOutlinedIcon /><h3>{tab === "wallet" && !isAuthenticated ? "Đăng nhập để mở kho voucher" : "Chưa có voucher trong nhóm này"}</h3><p>{tab === "discover" ? "Thử từ khóa hoặc nhóm ưu đãi khác." : "Voucher phù hợp sẽ xuất hiện tại đây."}</p></div>}
    </div></section>
  </main><Snackbar open={snackbar.open} autoHideDuration={3200} onClose={() => setSnackbar((value) => ({ ...value, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={snackbar.error ? "error" : "info"} variant="filled" onClose={() => setSnackbar((value) => ({ ...value, open: false }))}>{snackbar.message}</Alert></Snackbar></div>;
}
