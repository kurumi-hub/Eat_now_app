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
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import * as voucherStyles from "./tailwindClasses";
import {
  mockPromos,
  mockUserVouchers,
  voucherCategories,
  type PromoItem,
  type VoucherCategory,
  type VoucherItem,
} from "./voucherData";

type VoucherPageProps = {
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

const voucherIconMap: Record<string, ReactNode> = {
  local_shipping: <LocalShippingOutlinedIcon />,
  restaurant: <RestaurantOutlinedIcon />,
  receipt_long: <ReceiptLongOutlinedIcon />,
  event_busy: <EventBusyOutlinedIcon />,
  redeem: <RedeemOutlinedIcon />,
  cake: <CakeOutlinedIcon />,
  local_offer: <LocalOfferOutlinedIcon />,
};

export default function VoucherPage({
  user,
  deliveryLocationLabel,
}: VoucherPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<VoucherCategory>("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const showSnackbar = (message: string) => setSnackbar({ open: true, message });
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));
  const handleSectionNavigate = (sectionId: string) =>
    router.push(`/#${sectionId}`);

  const filteredVouchers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return mockUserVouchers.filter((voucher) => {
      const matchesCategory =
        selectedCategory === "all" ||
        voucher.category === selectedCategory ||
        (selectedCategory === "expiring" && voucher.isExpiringSoon);
      const matchesSearch =
        !q ||
        voucher.title.toLowerCase().includes(q) ||
        voucher.code.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleApplyCode = () => {
    const code = searchTerm.trim();

    if (!code) return;

    showSnackbar(
      `Đã áp dụng mã "${code.toUpperCase()}". Chức năng sẽ hoàn thiện sau.`
    );
  };

  return (
    <div className={voucherStyles.voucherPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={voucherStyles.voucherMainClassName}>
        <section className={voucherStyles.voucherHeroClassName}>
          <div className={voucherStyles.voucherHeroContentClassName}>
            <h1>Deal hot hôm nay</h1>
            <p>
              Sưu tầm voucher ngon, đặt món tiết kiệm hơn mỗi ngày cùng EatNow.
            </p>
          </div>
          <div
            className={voucherStyles.voucherHeroVisualClassName}
            aria-hidden="true"
          />
        </section>

        <section className={voucherStyles.voucherToolbarClassName}>
          <div className={voucherStyles.voucherSearchBarClassName}>
            <SearchOutlinedIcon
              className={voucherStyles.voucherSearchIconClassName}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm voucher hoặc nhập mã ưu đãi"
              className={voucherStyles.voucherSearchInputClassName}
            />
            <button
              className={voucherStyles.voucherApplyButtonClassName}
              onClick={handleApplyCode}
            >
              Áp dụng mã
            </button>
          </div>

          <div className={voucherStyles.voucherFiltersClassName}>
            {voucherCategories.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  className={voucherStyles.voucherFilterChipClassName(isActive)}
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className={voucherStyles.voucherSectionClassName}>
          <h2>Voucher của bạn</h2>
          <div className={voucherStyles.voucherGridClassName}>
            {filteredVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onUse={() =>
                  showSnackbar(
                    `Đã chọn voucher "${voucher.title}". Chức năng áp dụng sẽ hoàn thiện sau.`
                  )
                }
              />
            ))}
            {filteredVouchers.length === 0 && (
              <div className={voucherStyles.voucherEmptyStateClassName}>
                <ConfirmationNumberOutlinedIcon
                  className={voucherStyles.voucherEmptyIconClassName}
                />
                <p>Không tìm thấy voucher phù hợp.</p>
              </div>
            )}
          </div>
        </section>

        <section className={voucherStyles.voucherSectionClassName}>
          <div className={voucherStyles.voucherSectionHeaderClassName}>
            <h2>Ưu đãi đang diễn ra</h2>
            <button
              className={voucherStyles.voucherSeeAllButtonClassName}
              onClick={() =>
                showSnackbar("Xem tất cả ưu đãi sẽ hoàn thiện sau.")
              }
            >
              Xem tất cả
            </button>
          </div>
          <div className={voucherStyles.voucherPromoGridClassName}>
            {mockPromos.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                onClaim={() =>
                  showSnackbar(
                    `Đã nhận ưu đãi "${promo.title}". Chức năng sẽ hoàn thiện sau.`
                  )
                }
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

function VoucherCard({
  voucher,
  onUse,
}: {
  voucher: VoucherItem;
  onUse: () => void;
}) {
  const isInactive = voucher.status === "used" || voucher.status === "expired";

  return (
    <article
      className={voucherStyles.voucherCardClassName(isInactive)}
      data-status={voucher.status}
    >
      <div className={voucherStyles.voucherCardLeftClassName(voucher.tone)}>
        <span className={voucherStyles.voucherIconToneClassName(voucher.tone)}>
          {voucherIconMap[voucher.icon] || <ConfirmationNumberOutlinedIcon />}
        </span>
        <span className={voucherStyles.voucherCodeClassName(voucher.tone)}>
          {voucher.code}
        </span>
      </div>
      <div className={voucherStyles.voucherCardRightClassName}>
        {voucher.status === "used" && (
          <span className={voucherStyles.voucherBadgeClassName(voucher.status)}>
            Đã sử dụng
          </span>
        )}
        {voucher.status === "expired" && (
          <span className={voucherStyles.voucherBadgeClassName(voucher.status)}>
            Hết hạn
          </span>
        )}
        <div className={voucherStyles.voucherCardInfoClassName}>
          <h3
            className={voucherStyles.voucherCardTitleClassName(voucher.status)}
            data-status={voucher.status}
          >
            {voucher.title}
          </h3>
          <p className={voucherStyles.voucherCardDescriptionClassName(isInactive)}>
            {voucher.description}
          </p>
        </div>
        <div className={voucherStyles.voucherCardFooterClassName}>
          {voucher.status === "active" && (
            <>
              <span
                className={voucherStyles.voucherCardExpiryClassName(
                  voucher.isExpiringSoon
                )}
                data-urgent={Boolean(voucher.isExpiringSoon)}
              >
                {voucher.isExpiringSoon
                  ? `Sắp hết hạn: ${voucher.expiryDate}`
                  : `HSD: ${voucher.expiryDate}`}
              </span>
              <button
                className={voucherStyles.voucherCardUseButtonClassName}
                onClick={onUse}
              >
                Dùng ngay
              </button>
            </>
          )}
          {voucher.status === "used" && (
            <span className={voucherStyles.voucherCardExpiryClassName()}>
              Đã dùng: {voucher.usedDate}
            </span>
          )}
          {voucher.status === "expired" && (
            <span className={voucherStyles.voucherCardExpiryClassName()}>
              HSD: {voucher.expiryDate}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function PromoCard({
  promo,
  onClaim,
}: {
  promo: PromoItem;
  onClaim: () => void;
}) {
  return (
    <article className={voucherStyles.voucherPromoCardClassName}>
      <div className={voucherStyles.voucherPromoHeaderClassName(promo.tone)}>
        <span className={voucherStyles.voucherPromoIconClassName(promo.tone)}>
          {voucherIconMap[promo.icon] || <LocalOfferOutlinedIcon />}
        </span>
        <span className={voucherStyles.voucherPromoLabelClassName(promo.tone)}>
          {promo.labelText}
        </span>
      </div>
      <div className={voucherStyles.voucherPromoBodyClassName}>
        <div>
          <h3>{promo.title}</h3>
          <p>{promo.description}</p>
        </div>
        <button
          className={voucherStyles.voucherPromoCtaClassName(promo.isAvailable)}
          data-available={promo.isAvailable}
          disabled={!promo.isAvailable}
          onClick={promo.isAvailable ? onClaim : undefined}
        >
          {promo.isAvailable ? "Nhận ngay" : promo.unavailableReason}
        </button>
      </div>
    </article>
  );
}
