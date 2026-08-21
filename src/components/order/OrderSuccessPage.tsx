"use client";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCart } from "@/contexts/CartContext";
import type { OrderReceipt } from "@/contexts/CartContext";
import { formatOrderCurrency } from "./orderData";

function getReceiptRestaurantLabel(lastOrder: OrderReceipt) {
  const restaurantNames = Array.from(
    new Set(lastOrder.items.map((item) => item.restaurantName))
  );

  return restaurantNames.length > 0
    ? restaurantNames.join(", ")
    : lastOrder.restaurant.restaurantName;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const { clearCart, clearLastOrder, lastOrder } = useCart();

  useEffect(() => {
    if (lastOrder) {
      clearCart();
    }
  }, [clearCart, lastOrder]);

  const handleContinueShopping = () => {
    clearLastOrder();
    router.push("/");
  };

  return (
    <main className="order-result-page">
      <section className="order-success-card" aria-live="polite">
        <div className="order-success-icon">
          <CheckCircleIcon aria-hidden="true" />
        </div>
        <h1>Đặt hàng thành công!</h1>
        <p>Đơn hàng của bạn đang được xử lý.</p>

        {lastOrder ? (
          <div className="order-receipt-card">
            <div className="order-receipt-id">
              <span>Mã đơn hàng</span>
              <strong>#{lastOrder.id}</strong>
            </div>

            <div className="order-receipt-row">
              <span>Nhà hàng</span>
              <strong>{getReceiptRestaurantLabel(lastOrder)}</strong>
            </div>
            {lastOrder.discount > 0 ? (
              <div className="order-receipt-row">
                <span>
                  Ưu đãi
                  {lastOrder.appliedVoucherCode
                    ? ` (${lastOrder.appliedVoucherCode})`
                    : ""}
                </span>
                <strong className="order-discount-text">
                  -{formatOrderCurrency(lastOrder.discount)}
                </strong>
              </div>
            ) : null}
            <div className="order-receipt-row">
              <span>Tổng cộng</span>
              <strong>{formatOrderCurrency(lastOrder.total)}</strong>
            </div>
            <div className="order-receipt-row">
              <span>Thanh toán</span>
              <strong>
                {lastOrder.paymentMethod === "vnpay"
                  ? "VNPAY"
                  : "Tiền mặt (COD)"}
              </strong>
            </div>
            <div className="order-receipt-row is-address">
              <span>
                <LocationOnOutlinedIcon fontSize="small" />
                Giao đến
              </span>
              <strong>{lastOrder.address}</strong>
            </div>
            <div className="order-receipt-row">
              <span>
                <LocalShippingOutlinedIcon fontSize="small" />
                Thời gian dự kiến
              </span>
              <strong className="order-receipt-pill">
                {lastOrder.estimatedDeliveryLabel}
              </strong>
            </div>
          </div>
        ) : (
          <div className="order-receipt-card">
            <ReceiptLongOutlinedIcon aria-hidden="true" />
            <p>
              EatNow chưa tìm thấy biên nhận gần nhất trên thiết bị này. Bạn có
              thể tiếp tục mua sắm hoặc quay lại giỏ hàng.
            </p>
          </div>
        )}

        <div className="order-result-actions">
          {lastOrder ? (
            <Link
              className="order-tracking-link"
              href={`/orders/${lastOrder.id}/tracking`}
            >
              <LocalShippingOutlinedIcon fontSize="small" />
              Theo dõi đơn hàng
            </Link>
          ) : (
            <Link className="order-tracking-link" href="/orders">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Lịch sử đơn hàng
            </Link>
          )}
          <Button
            variant="outlined"
            className="order-continue-button"
            onClick={handleContinueShopping}
            endIcon={<ArrowForwardOutlinedIcon />}
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        <Link className="order-home-link" href="/">
          <HomeOutlinedIcon fontSize="small" />
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
