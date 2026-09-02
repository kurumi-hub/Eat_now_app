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
import * as orderStyles from "./tailwindClasses";

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
    <main className={orderStyles.orderResultPageClassName}>
      <section className={orderStyles.orderResultCardClassName} aria-live="polite">
        <div className={orderStyles.orderResultIconClassName("success")}>
          <CheckCircleIcon aria-hidden="true" />
        </div>
        <h1 className={orderStyles.orderResultTitleClassName}>
          Đặt hàng thành công!
        </h1>
        <p className={orderStyles.orderResultTextClassName}>
          Đơn hàng của bạn đang được xử lý.
        </p>

        {lastOrder ? (
          <div className={orderStyles.orderReceiptCardClassName}>
            <div className={orderStyles.orderReceiptIdClassName}>
              <span>Mã đơn hàng</span>
              <strong>#{lastOrder.id}</strong>
            </div>

            <div className={orderStyles.orderReceiptRowClassName}>
              <span>Nhà hàng</span>
              <strong>{getReceiptRestaurantLabel(lastOrder)}</strong>
            </div>
            {lastOrder.discount > 0 ? (
              <div className={orderStyles.orderReceiptRowClassName}>
                <span>
                  Ưu đãi
                  {lastOrder.appliedVoucherCode
                    ? ` (${lastOrder.appliedVoucherCode})`
                    : ""}
                </span>
                <strong className={orderStyles.orderDiscountTextClassName}>
                  -{formatOrderCurrency(lastOrder.discount)}
                </strong>
              </div>
            ) : null}
            <div className={orderStyles.orderReceiptRowClassName}>
              <span>Tổng cộng</span>
              <strong>{formatOrderCurrency(lastOrder.total)}</strong>
            </div>
            <div className={orderStyles.orderReceiptRowClassName}>
              <span>Thanh toán</span>
              <strong>
                {lastOrder.paymentMethod === "vnpay"
                  ? "VNPAY"
                  : "Tiền mặt (COD)"}
              </strong>
            </div>
            <div className={orderStyles.orderReceiptAddressRowClassName}>
              <span>
                <LocationOnOutlinedIcon fontSize="small" />
                Giao đến
              </span>
              <strong>{lastOrder.address}</strong>
            </div>
            <div className={orderStyles.orderReceiptRowClassName}>
              <span>
                <LocalShippingOutlinedIcon fontSize="small" />
                Thời gian dự kiến
              </span>
              <strong className={orderStyles.orderReceiptPillClassName}>
                {lastOrder.estimatedDeliveryLabel}
              </strong>
            </div>
          </div>
        ) : (
          <div className={orderStyles.orderReceiptCardClassName}>
            <ReceiptLongOutlinedIcon aria-hidden="true" />
            <p>
              EatNow chưa tìm thấy biên nhận gần nhất trên thiết bị này. Bạn có
              thể tiếp tục mua sắm hoặc quay lại giỏ hàng.
            </p>
          </div>
        )}

        <div className={orderStyles.orderResultActionsClassName}>
          {lastOrder ? (
            <Link
              className={orderStyles.orderPrimaryActionLinkClassName}
              href={`/orders/${lastOrder.id}/tracking`}
            >
              <LocalShippingOutlinedIcon fontSize="small" />
              Theo dõi đơn hàng
            </Link>
          ) : (
            <Link className={orderStyles.orderPrimaryActionLinkClassName} href="/orders">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Lịch sử đơn hàng
            </Link>
          )}
          <Button
            variant="outlined"
            className={orderStyles.orderContinueButtonClassName}
            onClick={handleContinueShopping}
            endIcon={<ArrowForwardOutlinedIcon />}
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        <Link className={orderStyles.orderHomeLinkClassName} href="/">
          <HomeOutlinedIcon fontSize="small" />
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
