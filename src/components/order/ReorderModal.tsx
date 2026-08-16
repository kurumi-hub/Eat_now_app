"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { Button } from "@mui/material";
import Image from "next/image";
import { formatOrderCurrency, OrderDisplayItem } from "./orderData";

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
    <div className="order-reorder-modal">
      <div className="order-reorder-card">
        {/* Header */}
        <div className="order-reorder-header">
          <div>
            <h2>Kiểm tra lại đơn hàng</h2>
            <p>Giá và tình trạng món có thể đã thay đổi.</p>
          </div>
          <button className="order-reorder-close" onClick={onClose}>
            <CloseOutlinedIcon />
          </button>
        </div>
        
        {/* Items */}
        <div className="order-reorder-items">
          {checkedItems.map(item => (
            <div 
              className={`order-reorder-item ${!item.available ? 'is-unavailable' : ''}`}
              key={item.foodId}
            >
              <div className="order-reorder-item__media">
                {!item.available && (
                  <div className="order-reorder-item__overlay">
                    <BlockOutlinedIcon />
                  </div>
                )}
                <Image src={item.image} alt={item.name} fill sizes="64px" />
              </div>
              <div className="order-reorder-item__info">
                <div>
                  <h3 className={!item.available ? 'is-strikethrough' : ''}>
                    {item.quantity}x {item.name}
                  </h3>
                  <span className={!item.available ? 'is-strikethrough' : ''}>
                    {formatOrderCurrency(item.price * item.quantity)}
                  </span>
                </div>
                <span className={`order-reorder-badge ${item.available ? 'is-available' : 'is-soldout'}`}>
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
        <div className="order-reorder-footer">
          <div className="order-reorder-total">
            <span>Tổng cộng mới</span>
            <strong>{formatOrderCurrency(newTotal)}</strong>
          </div>
          <div className="order-reorder-actions">
            <Button
              variant="outlined"
              className="order-reorder-cancel"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              className="order-reorder-confirm"
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
