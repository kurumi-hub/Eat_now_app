"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import { useCart } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import {
  findOrderRecordById,
  formatOrderCurrency,
  formatOrderDateTime,
  orderStatusDescriptions,
  orderStatusLabels,
  orderTimelineSteps,
} from "./orderData";

type OrderDetailPageProps = {
  orderId: string;
  user: PublicUser | null;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

const pendingStatusLabel = "Chờ xác nhận";

export default function OrderDetailPage({
  orderId,
  user,
}: OrderDetailPageProps) {
  const router = useRouter();
  const { orderHistory } = useCart();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const order = findOrderRecordById(orderId, orderHistory);

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  return (
    <div className="order-detail-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="order-detail-main">
        <div className="order-detail-title-row">
          <button
            type="button"
            aria-label="Quay lại lịch sử đơn hàng"
            onClick={() => router.push("/orders")}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <span>#{order.id}</span>
            <h1>Chi tiết đơn hàng</h1>
          </div>
        </div>

        <div className="order-detail-layout">
          <section className="order-detail-content">
            <article
              className={`order-detail-status-card${
                order.status === "completed" ? " is-completed" : ""
              }${
                order.status === "cancelled" || order.status === "rejected"
                  ? " is-cancelled"
                  : ""
              }`}
            >
              <div>
                <p>
                  Mã đơn: #{order.id} • {order.restaurantName}
                </p>
                <div>
                  <h2>
                    {order.status === "pending"
                      ? pendingStatusLabel
                      : orderStatusLabels[order.status]}
                  </h2>
                  {order.status === "pending" && (
                    <span>
                      <ScheduleOutlinedIcon fontSize="small" />
                      Mới
                    </span>
                  )}
                </div>
              </div>
              <div className="order-detail-status-icon">
                {order.status === "completed" ? (
                  <CheckCircleOutlinedIcon />
                ) : order.status === "cancelled" || order.status === "rejected" ? (
                  <CancelOutlinedIcon />
                ) : (
                  <ScheduleOutlinedIcon />
                )}
              </div>
              <p>
                {order.status === "cancelled" || order.status === "rejected"
                  ? order.issueReason || orderStatusDescriptions[order.status]
                  : orderStatusDescriptions[order.status]}
              </p>
            </article>

            <article className="order-detail-card">
              <h2>Tiến trình</h2>
              <div className="order-detail-timeline">
                {(order.status === "cancelled" || order.status === "rejected"
                  ? [
                      ...orderTimelineSteps.slice(0, 1),
                      { id: "cancelled", title: "Đã hủy", description: "", timeLabel: order.updatedAtLabel }
                    ]
                  : order.status === "completed"
                  ? orderTimelineSteps
                  : orderTimelineSteps.slice(0, 4)
                ).map((step, index) => {
                  let isComplete = false;
                  let isCurrent = false;

                  if (order.status === "completed") {
                    isComplete = true;
                  } else if (order.status === "cancelled" || order.status === "rejected") {
                    isComplete = index === 0;
                    isCurrent = index === 1;
                  } else {
                    isComplete = index === 0;
                    isCurrent = index === 1;
                  }

                  return (
                    <div
                      className={`order-detail-timeline-step${
                        isComplete ? " is-complete" : ""
                      }${isCurrent ? " is-current" : ""}`}
                      key={step.id}
                    >
                      <span />
                      <div>
                        <h3>{step.title}</h3>
                        <p>
                          {order.status === "cancelled" || order.status === "rejected"
                            ? step.timeLabel
                            : order.status === "completed"
                            ? step.timeLabel || "Hoàn thành"
                            : index === 1
                            ? "Đang chờ..."
                            : step.timeLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="order-detail-card">
              <h2>Món ăn đã đặt</h2>
              <div className="order-detail-item-list">
                {order.items.map((item) => (
                  <div className="order-detail-item" key={item.foodId}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                    />
                    <div>
                      <h3>{item.name}</h3>
                      <p>x{item.quantity}</p>
                      {item.note ? <small>{item.note}</small> : null}
                    </div>
                    <strong>
                      {formatOrderCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="order-detail-sidebar">
            <article className="order-detail-card">
              <h2>Tổng cộng</h2>
              <div className="order-detail-total-rows">
                <div>
                  <span>Tạm tính ({order.itemCount} món)</span>
                  <strong>{formatOrderCurrency(order.subtotal)}</strong>
                </div>
                <div>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(order.deliveryFee)}</strong>
                </div>
              </div>
              <div className="order-detail-total">
                <span>Tổng thanh toán</span>
                <strong>{formatOrderCurrency(order.total)}</strong>
              </div>
              <div className="order-detail-payment-note">
                <PaymentsOutlinedIcon fontSize="small" />
                <div>
                  <span>{order.paymentLabel}</span>
                  {order.status === "pending" && (
                    <small>
                      {order.paymentLabel.includes("VNPAY")
                        ? "Đã xác nhận thanh toán qua VNPAY."
                        : "Vui lòng chuẩn bị sẵn tiền mặt."}
                    </small>
                  )}
                </div>
              </div>
            </article>

            <article className="order-detail-card">
              <h2>
                <LocationOnOutlinedIcon fontSize="small" />
                Giao hàng đến
              </h2>
              <p>
                {order.recipientName} - {order.phone}
              </p>
              <p>{order.address}</p>
              <small>Đặt lúc {formatOrderDateTime(order.createdAt)}</small>
            </article>

            {order.status !== "completed" && order.status !== "cancelled" && order.status !== "rejected" && (
              <>
                <Link
                  className="order-detail-track-link"
                  href={`/orders/${order.id}/tracking`}
                >
                  <LocalShippingOutlinedIcon fontSize="small" />
                  Theo dõi đơn hàng
                </Link>
                <Button
                  variant="outlined"
                  className="order-detail-cancel-button"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Hủy đơn hàng
                </Button>
              </>
            )}

            {order.status === "completed" && (
              <Button
                variant="contained"
                className="order-detail-review-button order-submit-button"
                startIcon={<StarOutlinedIcon />}
                onClick={() => showSnackbar("Đánh giá sẽ được phát triển sau.")}
                style={{ borderRadius: 12, minHeight: 48, marginTop: 4 }}
              >
                Đánh giá
              </Button>
            )}

            {(order.status === "completed" || order.status === "cancelled" || order.status === "rejected") && (
              <Button
                variant="outlined"
                className="order-detail-reorder-button"
                startIcon={<ReplayOutlinedIcon />}
                onClick={() => router.push(`/restaurant/${order.restaurantSlug}`)}
                style={{ borderRadius: 12, minHeight: 48, marginTop: 4, borderColor: '#8e7164', color: '#7a3000' }}
              >
                Đặt lại
              </Button>
            )}

            <Link className="order-detail-history-link" href="/orders">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Lịch sử đơn hàng
            </Link>
          </aside>
        </div>
      </main>

      {cancelDialogOpen && (
        <div className="order-cancel-modal">
          <div className="order-cancel-card">
            <div className="order-cancel-icon">
              <CancelOutlinedIcon />
            </div>
            <h2>Xác nhận hủy đơn hàng</h2>
            <p>
              Bạn có chắc muốn hủy đơn hàng #{order.id}? Hành động này không thể
              hoàn tác.
            </p>
            <Button
              variant="contained"
              className="order-cancel-confirm"
              onClick={() => {
                showSnackbar("Hủy đơn sẽ được xử lý khi có API đơn hàng.");
                setCancelDialogOpen(false);
              }}
            >
              Xác nhận hủy
            </Button>
            <Button
              variant="text"
              className="order-cancel-keep"
              onClick={() => setCancelDialogOpen(false)}
            >
              Giữ đơn hàng
            </Button>
          </div>
        </div>
      )}

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
