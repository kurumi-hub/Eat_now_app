"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { Button } from "@mui/material";
import Image from "next/image";
import { formatOrderCurrency, OrderDisplayItem } from "./orderData";
import * as orderStyles from "./tailwindClasses";

type ReorderModalProps = {
  open: boolean;
  items: OrderDisplayItem[];
  onClose: () => void;
  onConfirm: () => void;
};

// Mock: randomly mark some items as unavailable for demo
function getItemAvailability(items: OrderDisplayItem[]) {
  return items.map((item, index) => ({
    ...item,
    available: index === 0, // First item available, rest may not be
  }));
}

export default function ReorderModal({ open, items, onClose, onConfirm }: ReorderModalProps) {
  if (!open) return null;
  
  const checkedItems = getItemAvailability(items);
  const availableItems = checkedItems.filter(item => item.available);
  const newTotal = availableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <div className={orderStyles.orderReorderModalClassName}>
      <div className={orderStyles.orderReorderCardClassName}>
        {/* Header */}
        <div className={orderStyles.orderReorderHeaderClassName}>
          <div>
            <h2>Kiểm tra lại đơn hàng</h2>
            <p>Giá và tình trạng món có thể đã thay đổi.</p>
          </div>
          <button
            className={orderStyles.orderReorderCloseButtonClassName}
            onClick={onClose}
          >
            <CloseOutlinedIcon />
          </button>
        </div>
        
        {/* Items */}
        <div className={orderStyles.orderReorderItemsClassName}>
          {checkedItems.map(item => (
            <div 
              className={orderStyles.orderReorderItemClassName(item.available)}
              data-availability={item.available ? "available" : "unavailable"}
              key={item.foodId}
            >
              <div className={orderStyles.orderReorderItemMediaClassName}>
                {!item.available && (
                  <div className={orderStyles.orderReorderItemOverlayClassName}>
                    <BlockOutlinedIcon />
                  </div>
                )}
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className={orderStyles.orderReorderItemImageClassName}
                />
              </div>
              <div className={orderStyles.orderReorderItemInfoClassName}>
                <div>
                  <h3 className={orderStyles.orderReorderItemTitleClassName(item.available)}>
                    {item.quantity}x {item.name}
                  </h3>
                  <span className={orderStyles.orderReorderItemPriceClassName(item.available)}>
                    {formatOrderCurrency(item.price * item.quantity)}
                  </span>
                </div>
                <span className={orderStyles.orderReorderBadgeClassName(item.available)}>
                  {item.available ? (
                    <><CheckCircleOutlinedIcon fontSize="small" /> Còn hàng</>
                  ) : (
                    <><ErrorOutlinedIcon fontSize="small" /> Hết món</>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className={orderStyles.orderReorderFooterClassName}>
          <div className={orderStyles.orderReorderTotalClassName}>
            <span>Tổng cộng mới</span>
            <strong>{formatOrderCurrency(newTotal)}</strong>
          </div>
          <div className={orderStyles.orderReorderActionsClassName}>
            <Button
              variant="outlined"
              className={orderStyles.orderReorderCancelButtonClassName}
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              className={orderStyles.orderReorderConfirmButtonClassName}
              onClick={onConfirm}
            >
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
