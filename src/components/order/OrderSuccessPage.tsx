"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type OrderSuccessSummary = {
  id: string;
  code: string;
  status: string;
  restaurantName: string;
  deliveryAddress: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Đang chờ nhà hàng xác nhận",
  confirmed: "Nhà hàng đã xác nhận",
  preparing: "Nhà hàng đang chuẩn bị món",
  ready: "Đơn hàng sẵn sàng giao",
  delivering: "Đơn hàng đang được giao",
  completed: "Đã giao thành công",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
  zalopay: "ZaloPay",
  card: "Thẻ ngân hàng",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

export default function OrderSuccessPage({ order }: { order: OrderSuccessSummary }) {
  const router = useRouter();
  const isOnlinePayment = order.paymentMethod !== "cod";
  const isPaymentPending = isOnlinePayment && order.paymentStatus === "pending";
  const isPaymentFailed = isOnlinePayment && order.paymentStatus === "failed";
  const isConfirmed = !isOnlinePayment || order.paymentStatus === "success";
  const paymentText = order.paymentMethod === "cod"
    ? PAYMENT_LABELS.cod
    : `${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} · ${
        order.paymentStatus === "success"
          ? "Đã thanh toán"
          : order.paymentStatus === "failed"
            ? "Thanh toán không thành công"
            : order.paymentStatus === "refunded"
              ? "Đã hoàn tiền"
              : "Đang xác nhận thanh toán"
      }`;

  useEffect(() => {
    if (!isPaymentPending) return;
    let refreshCount = 0;
    const timer = window.setInterval(() => {
      refreshCount += 1;
      router.refresh();
      if (refreshCount >= 10) window.clearInterval(timer);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPaymentPending, router]);

  const title = isPaymentPending
    ? "Đang xác nhận thanh toán"
    : isPaymentFailed
      ? "Thanh toán không thành công"
      : "Đặt hàng thành công!";
  const description = isPaymentPending
    ? "VNPay đã tiếp nhận giao dịch. EatNow đang chờ xác nhận cuối cùng và chưa chuyển đơn đến nhà hàng."
    : isPaymentFailed
      ? "Giao dịch chưa được xác nhận. Vui lòng xem chi tiết đơn hàng để kiểm tra trạng thái mới nhất."
      : "Cảm ơn bạn đã đặt món. Đơn hàng đã được ghi nhận và đang chuyển đến nhà hàng.";
  const statusLabel = isPaymentPending
    ? "Đang xác nhận thanh toán"
    : isPaymentFailed
      ? "Thanh toán không thành công"
      : STATUS_LABELS[order.status] ?? order.status;

  return (
    <main className="order-result-page">
      <section className="order-success-card">
        <div className="order-success-icon">{isConfirmed ? <CheckCircleRoundedIcon /> : <ScheduleOutlinedIcon />}</div>
        <h1>{title}</h1>
        <p>{description}</p>

        <div className="order-receipt-card">
          <div className="order-receipt-id"><span>Mã đơn hàng</span><strong>#{order.code}</strong></div>
          <div className="order-receipt-row"><span>Nhà hàng</span><strong>{order.restaurantName}</strong></div>
          <div className="order-receipt-row"><span>Tổng thanh toán</span><strong>{formatCurrency(order.total)}</strong></div>
          <div className="order-receipt-row"><span>Thanh toán</span><strong>{paymentText}</strong></div>
          <div className="order-receipt-row"><span>Trạng thái</span><strong className="order-receipt-pill">{statusLabel}</strong></div>
          <div className="order-receipt-row is-address"><span><PlaceOutlinedIcon fontSize="small" /> Giao đến</span><strong>{order.deliveryAddress}</strong></div>
        </div>

        <div className="order-result-actions">
          <Button className="order-tracking-button" variant="contained" component={Link} href={`/orders/${order.id}`} startIcon={<ReceiptLongOutlinedIcon />}>Xem chi tiết đơn</Button>
          <Button className="order-continue-button" variant="outlined" component={Link} href="/">Tiếp tục đặt món</Button>
        </div>
      </section>
    </main>
  );
}
