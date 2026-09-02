"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import { Button, IconButton } from "@mui/material";
import type { ReactElement } from "react";

import type { VoucherItem } from "@/components/voucher/voucherData";
import { mockUserVouchers } from "@/components/voucher/voucherData";
import * as orderStyles from "./tailwindClasses";

type VoucherPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (voucher: VoucherItem) => void;
  appliedCode?: string | null;
};

const pickerIconMap: Record<string, ReactElement> = {
  local_shipping: <LocalShippingOutlinedIcon />,
  restaurant: <RestaurantOutlinedIcon />,
  receipt_long: <ReceiptLongOutlinedIcon />,
  local_offer: <LocalOfferOutlinedIcon />,
  percent: <PercentOutlinedIcon />,
};

function getPickerIcon(iconName: string): ReactElement {
  return pickerIconMap[iconName] ?? <LocalOfferOutlinedIcon />;
}

export default function VoucherPickerModal({
  open,
  onClose,
  onSelect,
  appliedCode,
}: VoucherPickerModalProps) {
  if (!open) return null;

  const activeVouchers = mockUserVouchers.filter(
    (v) => v.status === "active"
  );

  return (
    <div
      className={orderStyles.orderVoucherPickerOverlayClassName}
      role="dialog"
      aria-modal="true"
    >
      <div className={orderStyles.orderVoucherPickerModalClassName}>
        <div className={orderStyles.orderVoucherPickerHeaderClassName}>
          <h3 className={orderStyles.orderVoucherPickerTitleClassName}>
            Chọn mã ưu đãi
          </h3>
          <IconButton onClick={onClose} size="small" aria-label="Đóng">
            <CloseOutlinedIcon />
          </IconButton>
        </div>

        {activeVouchers.length === 0 ? (
          <p className={orderStyles.orderVoucherPickerEmptyClassName}>
            Bạn chưa có mã ưu đãi nào khả dụng.
          </p>
        ) : (
          <div className={orderStyles.orderVoucherPickerListClassName}>
            {activeVouchers.map((voucher) => {
              const isApplied =
                appliedCode?.toUpperCase() === voucher.code.toUpperCase();

              return (
                <div
                  className={orderStyles.orderVoucherPickerItemClassName}
                  key={voucher.id}
                >
                  <div className={orderStyles.orderVoucherPickerItemIconClassName}>
                    {getPickerIcon(voucher.icon)}
                  </div>
                  <div className={orderStyles.orderVoucherPickerItemInfoClassName}>
                    <strong>{voucher.title}</strong>
                    <span>{voucher.description}</span>
                    <small>
                      Mã: <code>{voucher.code}</code>
                      {voucher.expiryDate
                        ? ` · HSD: ${voucher.expiryDate}`
                        : null}
                    </small>
                  </div>
                  <Button
                    variant={isApplied ? "outlined" : "contained"}
                    size="small"
                    className={orderStyles.orderVoucherPickerItemButtonClassName}
                    disabled={isApplied}
                    onClick={() => onSelect(voucher)}
                  >
                    {isApplied ? "Đã chọn" : "Chọn"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
