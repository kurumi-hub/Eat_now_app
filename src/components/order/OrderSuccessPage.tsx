"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Button } from "@mui/material";
import Link from "next/link";

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
  const paymentText = order.paymentMethod === "cod"
    ? PAYMENT_LABELS.cod
    : `${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}${order.paymentStatus === "success" ? " · Đã thanh toán" : " · Đang cập nhật thanh toán"}`;

  return (
    <main className="order-result-page">
      <section className="order-success-card">
        <div className="order-success-icon"><CheckCircleRoundedIcon /></div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã đặt món. Đơn hàng đã được ghi nhận và đang chuyển đến nhà hàng.</p>

        <div className="order-receipt-card">
          <div className="order-receipt-id"><span>Mã đơn hàng</span><strong>#{order.code}</strong></div>
          <div className="order-receipt-row"><span>Nhà hàng</span><strong>{order.restaurantName}</strong></div>
          <div className="order-receipt-row"><span>Tổng thanh toán</span><strong>{formatCurrency(order.total)}</strong></div>
          <div className="order-receipt-row"><span>Thanh toán</span><strong>{paymentText}</strong></div>
          <div className="order-receipt-row"><span>Trạng thái</span><strong className="order-receipt-pill">{STATUS_LABELS[order.status] ?? order.status}</strong></div>
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
