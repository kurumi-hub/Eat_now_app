"use client";

import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Alert, Snackbar } from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";

import {
  mockPromos,
  mockUserVouchers,
  voucherCategories,
  type PromoItem,
  type VoucherCategory,
  type VoucherItem,
} from "@/components/voucher/voucherData";

const voucherIconMap: Record<string, ReactNode> = {
  local_shipping: <LocalShippingOutlinedIcon />,
  restaurant: <RestaurantOutlinedIcon />,
  receipt_long: <ReceiptLongOutlinedIcon />,
  event_busy: <EventBusyOutlinedIcon />,
  redeem: <RedeemOutlinedIcon />,
  cake: <CakeOutlinedIcon />,
  local_offer: <LocalOfferOutlinedIcon />,
};

export default function VoucherPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const showMessage = (message: string) => setSnackbar({ open: true, message });

  const filteredVouchers = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    return mockUserVouchers.filter((voucher) => {
      const matchesCategory =
        selectedCategory === "all" ||
        voucher.category === selectedCategory ||
        (selectedCategory === "expiring" && voucher.isExpiringSoon);
      const matchesSearch =
        !query ||
        voucher.title.toLocaleLowerCase("vi").includes(query) ||
        voucher.code.toLocaleLowerCase("vi").includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleApplyCode = () => {
    if (!searchTerm.trim()) {
      showMessage("Hãy nhập mã voucher trước khi áp dụng.");
      return;
    }
    showMessage(`Đã chọn mã ${searchTerm.trim().toUpperCase()} · Đây là giao diện minh họa.`);
  };

  return (
    <div className="voucher-page">
      <main className="voucher-main">
        <section className="voucher-hero">
          <div className="voucher-hero__content">
            <span className="voucher-hero__eyebrow">Ưu đãi dành cho bạn</span>
            <h1>Deal hot hôm nay</h1>
            <p>Sưu tầm voucher ngon, đặt món tiết kiệm hơn mỗi ngày cùng EatNow.</p>
          </div>
          <div className="voucher-hero__visual" aria-hidden="true">
            <LocalOfferOutlinedIcon />
            <strong>-30%</strong>
          </div>
        </section>

        <section className="voucher-toolbar" aria-label="Tìm và lọc voucher">
          <div className="voucher-search-bar">
            <SearchOutlinedIcon className="voucher-search-icon" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") handleApplyCode(); }}
              placeholder="Tìm voucher hoặc nhập mã ưu đãi"
              className="voucher-search-input"
            />
            <button className="voucher-apply-button" type="button" onClick={handleApplyCode}>Áp dụng mã</button>
          </div>

          <div className="voucher-filters">
            {voucherCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`voucher-filter-chip ${selectedCategory === category.id ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>

        <section className="voucher-section">
          <div className="voucher-section-heading">
            <div><span>Ví voucher</span><h2>Voucher của bạn</h2></div>
            <small>{filteredVouchers.length} voucher</small>
          </div>
          <div className="voucher-grid">
            {filteredVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} onUse={() => showMessage(`Đã chọn ${voucher.code} · Bạn sẽ áp dụng mã ở bước xác nhận đơn.`)} />
            ))}
            {filteredVouchers.length === 0 && (
              <div className="voucher-empty"><ConfirmationNumberOutlinedIcon /><h3>Không tìm thấy voucher</h3><p>Thử từ khóa hoặc nhóm ưu đãi khác nhé.</p></div>
            )}
          </div>
        </section>

        <section className="voucher-section">
          <div className="voucher-section-heading"><div><span>Đang diễn ra</span><h2>Ưu đãi nổi bật</h2></div><button type="button" onClick={() => showMessage("Danh sách hiện sử dụng dữ liệu giao diện mẫu.")}>Xem tất cả</button></div>
          <div className="voucher-promo-grid">
            {mockPromos.map((promo) => <PromoCard key={promo.id} promo={promo} onClaim={() => showMessage(`Đã nhận ưu đãi “${promo.title}” · Đây là giao diện minh họa.`)} />)}
          </div>
        </section>
      </main>

      <Snackbar open={snackbar.open} autoHideDuration={2800} onClose={() => setSnackbar((value) => ({ ...value, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="info" variant="filled" onClose={() => setSnackbar((value) => ({ ...value, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

function VoucherCard({ voucher, onUse }: { voucher: VoucherItem; onUse: () => void }) {
  const inactive = voucher.status !== "active";
  return (
    <article className={`voucher-card ${inactive ? "is-inactive" : ""}`}>
      <div className={`voucher-card__left ${voucher.iconBg}`}><span className={`voucher-card__icon ${voucher.iconColor}`}>{voucherIconMap[voucher.icon] ?? <ConfirmationNumberOutlinedIcon />}</span><span className={`voucher-card__code ${voucher.iconColor}`}>{voucher.code}</span></div>
      <div className="voucher-card__right">
        {voucher.status === "used" && <span className="voucher-badge is-used">Đã sử dụng</span>}
        {voucher.status === "expired" && <span className="voucher-badge is-expired">Hết hạn</span>}
        <div className="voucher-card__info"><h3 className={voucher.status === "expired" ? "is-strikethrough" : ""}>{voucher.title}</h3><p>{voucher.description}</p></div>
        <div className="voucher-card__footer">
          {voucher.status === "active" && <><span className={`voucher-card__expiry ${voucher.isExpiringSoon ? "is-urgent" : ""}`}>{voucher.isExpiringSoon ? `Sắp hết hạn: ${voucher.expiryDate}` : `HSD: ${voucher.expiryDate}`}</span><button type="button" onClick={onUse}>Dùng ngay</button></>}
          {voucher.status === "used" && <span className="voucher-card__expiry">Đã dùng: {voucher.usedDate}</span>}
          {voucher.status === "expired" && <span className="voucher-card__expiry">HSD: {voucher.expiryDate}</span>}
        </div>
      </div>
    </article>
  );
}

function PromoCard({ promo, onClaim }: { promo: PromoItem; onClaim: () => void }) {
  return (
    <article className="voucher-promo-card">
      <div className={`voucher-promo-card__header ${promo.headerBg}`}><span className={`voucher-promo-card__bg-icon ${promo.iconColor}`}>{voucherIconMap[promo.icon] ?? <LocalOfferOutlinedIcon />}</span><span className={`voucher-promo-card__label ${promo.iconColor}`}>{promo.labelText}</span></div>
      <div className="voucher-promo-card__body"><div><h3>{promo.title}</h3><p>{promo.description}</p></div><button type="button" className={!promo.isAvailable ? "is-disabled" : ""} disabled={!promo.isAvailable} onClick={promo.isAvailable ? onClaim : undefined}>{promo.isAvailable ? "Nhận ngay" : promo.unavailableReason}</button></div>
    </article>
  );
}
