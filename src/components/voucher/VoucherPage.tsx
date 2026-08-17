"use client";

import { Alert, Button, Snackbar } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import {
  mockPromos,
  mockUserVouchers,
  voucherCategories,
  type VoucherCategory,
  type VoucherItem,
  type PromoItem,
} from "./voucherData";

type VoucherPageProps = {
  user: PublicUser | null;
};

const voucherIconMap: Record<string, React.ReactNode> = {
  local_shipping: <LocalShippingOutlinedIcon />,
  restaurant: <RestaurantOutlinedIcon />,
  receipt_long: <ReceiptLongOutlinedIcon />,
  event_busy: <EventBusyOutlinedIcon />,
  redeem: <RedeemOutlinedIcon />,
  cake: <CakeOutlinedIcon />,
  local_offer: <LocalOfferOutlinedIcon />,
};

export default function VoucherPage({ user }: VoucherPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const showSnackbar = (message: string) => setSnackbar({ open: true, message });
  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));
  const handleSectionNavigate = (sectionId: string) => router.push(`/#${sectionId}`);

  const filteredVouchers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mockUserVouchers.filter(v => {
      const matchesCategory = selectedCategory === "all" 
        || v.category === selectedCategory
        || (selectedCategory === "expiring" && v.isExpiringSoon);
      const matchesSearch = !q || v.title.toLowerCase().includes(q) || v.code.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleApplyCode = () => {
    if (!searchTerm.trim()) return;
    showSnackbar(`Đã áp dụng mã "${searchTerm.trim().toUpperCase()}". Chức năng sẽ hoàn thiện sau.`);
  };

  return (
    <div className="voucher-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="voucher-main">
        {/* Hero Banner */}
        <section className="voucher-hero">
          <div className="voucher-hero__content">
            <h1>Deal hot hôm nay</h1>
            <p>Sưu tầm voucher ngon, đặt món tiết kiệm hơn mỗi ngày cùng EatNow.</p>
          </div>
          <div className="voucher-hero__visual" aria-hidden="true" />
        </section>

        {/* Search & Apply */}
        <section className="voucher-toolbar">
          <div className="voucher-search-bar">
            <SearchOutlinedIcon className="voucher-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm voucher hoặc nhập mã ưu đãi"
              className="voucher-search-input"
            />
            <button 
              className="voucher-apply-button"
              onClick={handleApplyCode}
            >
              Áp dụng mã
            </button>
          </div>

          {/* Filter Chips */}
          <div className="voucher-filters">
            {voucherCategories.map((cat) => (
              <button
                key={cat.id}
                className={`voucher-filter-chip ${selectedCategory === cat.id ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* User Vouchers Section */}
        <section className="voucher-section">
          <h2>Voucher của bạn</h2>
          <div className="voucher-grid">
            {filteredVouchers.map((voucher) => (
              <VoucherCard 
                key={voucher.id} 
                voucher={voucher} 
                onUse={() => showSnackbar(`Đã chọn voucher "${voucher.title}". Chức năng áp dụng sẽ hoàn thiện sau.`)}
              />
            ))}
            {filteredVouchers.length === 0 && (
              <div className="voucher-empty">
                <ConfirmationNumberOutlinedIcon className="voucher-empty__icon" />
                <p>Không tìm thấy voucher phù hợp.</p>
              </div>
            )}
          </div>
        </section>

        {/* Active Promos Section */}
        <section className="voucher-section">
          <div className="voucher-section-header">
            <h2>Ưu đãi đang diễn ra</h2>
            <button 
              className="voucher-see-all"
              onClick={() => showSnackbar("Xem tất cả ưu đãi sẽ hoàn thiện sau.")}
            >
              Xem tất cả
            </button>
          </div>
          <div className="voucher-promo-grid">
            {mockPromos.map((promo) => (
              <PromoCard 
                key={promo.id} 
                promo={promo}
                onClaim={() => showSnackbar(`Đã nhận ưu đãi "${promo.title}". Chức năng sẽ hoàn thiện sau.`)}
              />
            ))}
          </div>
        </section>
      </main>

      <CustomerFooter onPlaceholder={showSnackbar} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

/* ---- Sub-components ---- */

function VoucherCard({ voucher, onUse }: { voucher: VoucherItem; onUse: () => void }) {
  const isInactive = voucher.status === "used" || voucher.status === "expired";

  return (
    <article className={`voucher-card ${isInactive ? "is-inactive" : ""}`}>
      <div className={`voucher-card__left ${voucher.iconBg}`}>
        <span className={`voucher-card__icon ${voucher.iconColor}`}>
          {voucherIconMap[voucher.icon] || <ConfirmationNumberOutlinedIcon />}
        </span>
        <span className={`voucher-card__code ${voucher.iconColor}`}>{voucher.code}</span>
      </div>
      <div className="voucher-card__right">
        {voucher.status === "used" && (
          <span className="voucher-badge is-used">Đã sử dụng</span>
        )}
        {voucher.status === "expired" && (
          <span className="voucher-badge is-expired">Hết hạn</span>
        )}
        <div className="voucher-card__info">
          <h3 className={voucher.status === "expired" ? "is-strikethrough" : ""}>
            {voucher.title}
          </h3>
          <p>{voucher.description}</p>
        </div>
        <div className="voucher-card__footer">
          {voucher.status === "active" && (
            <>
              <span className={`voucher-card__expiry ${voucher.isExpiringSoon ? "is-urgent" : ""}`}>
                {voucher.isExpiringSoon ? `Sắp hết hạn: ${voucher.expiryDate}` : `HSD: ${voucher.expiryDate}`}
              </span>
              <button className="voucher-card__use" onClick={onUse}>Dùng ngay</button>
            </>
          )}
          {voucher.status === "used" && (
            <span className="voucher-card__expiry">Đã dùng: {voucher.usedDate}</span>
          )}
          {voucher.status === "expired" && (
            <span className="voucher-card__expiry">HSD: {voucher.expiryDate}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function PromoCard({ promo, onClaim }: { promo: PromoItem; onClaim: () => void }) {
  return (
    <article className="voucher-promo-card">
      <div className={`voucher-promo-card__header ${promo.headerBg}`}>
        <span className={`voucher-promo-card__bg-icon ${promo.iconColor}`}>
          {voucherIconMap[promo.icon] || <LocalOfferOutlinedIcon />}
        </span>
        <span className={`voucher-promo-card__label ${promo.iconColor}`}>{promo.labelText}</span>
      </div>
      <div className="voucher-promo-card__body">
        <div>
          <h3>{promo.title}</h3>
          <p>{promo.description}</p>
        </div>
        <button
          className={`voucher-promo-card__cta ${!promo.isAvailable ? "is-disabled" : ""}`}
          disabled={!promo.isAvailable}
          onClick={promo.isAvailable ? onClaim : undefined}
        >
          {promo.isAvailable ? "Nhận ngay" : promo.unavailableReason}
        </button>
      </div>
    </article>
  );
}
