"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import { useCart } from "@/contexts/CartContext";
import type { OrderStatus } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import {
  findOrderRecordById,
  formatOrderCurrency,
  mockTrackingOrder,
  orderStatusLabels,
  orderTimelineSteps,
} from "./orderData";

type OrderTrackingPageProps = {
  orderId: string;
  user: PublicUser | null;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

const trackableStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivering",
  "completed",
];

function getTimelineState(stepStatus: OrderStatus, orderStatus: OrderStatus) {
  const currentIndex = Math.max(trackableStatuses.indexOf(orderStatus), 0);
  const stepIndex = trackableStatuses.indexOf(stepStatus);

  if (stepIndex < currentIndex) return "is-complete";
  if (stepIndex === currentIndex) return "is-current";
  return "";
}

export default function OrderTrackingPage({
  orderId,
  user,
}: OrderTrackingPageProps) {
  const router = useRouter();
  const { orderHistory } = useCart();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });
  const normalizedOrderId = orderId.replace(/^#/, "");
  const order = useMemo(() => {
    if (normalizedOrderId === mockTrackingOrder.id) {
      return mockTrackingOrder;
    }

    return findOrderRecordById(normalizedOrderId, orderHistory);
  }, [normalizedOrderId, orderHistory]);
  const activeStepLabel = orderStatusLabels[order.status];

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
    <div className="order-tracking-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="order-tracking-main">
        <div className="order-tracking-title-row">
          <button
            type="button"
            aria-label="Quay lại chi tiết đơn hàng"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <h1>Theo dõi đơn hàng</h1>
            <p>
              Mã đơn: <strong>#{order.id}</strong>
            </p>
          </div>
        </div>

        <div className="order-tracking-layout">
          <section className="order-tracking-content">
            <article className="order-tracking-map" aria-label="Bản đồ giao hàng">
              <div className="order-tracking-map__canvas">
                <span className="order-tracking-map__route is-primary" />
                <span className="order-tracking-map__route is-secondary" />
                <span className="order-tracking-map__pin is-restaurant">
                  <RestaurantOutlinedIcon fontSize="small" />
                </span>
                <span className="order-tracking-map__pin is-courier">
                  <DeliveryDiningOutlinedIcon fontSize="small" />
                </span>
                <span className="order-tracking-map__pin is-customer">
                  <LocationOnOutlinedIcon fontSize="small" />
                </span>
              </div>

              <div className="order-tracking-eta-card">
                <span>Dự kiến giao hàng</span>
                <strong>{order.estimatedDeliveryLabel}</strong>
                <small>Cập nhật lúc: {order.updatedAtLabel}</small>
              </div>
            </article>

            <article className="order-tracking-card">
              <div className="order-tracking-card__heading">
                <div>
                  <span>Trạng thái đơn hàng</span>
                  <h2>{activeStepLabel}</h2>
                </div>
                <DeliveryDiningOutlinedIcon />
              </div>

              <div className="order-tracking-timeline">
                {orderTimelineSteps.map((step) => {
                  const stateClass = getTimelineState(step.id, order.status);

                  return (
                    <div
                      className={`order-tracking-timeline-step ${stateClass}`}
                      key={step.id}
                    >
                      <span>
                        {stateClass === "is-complete" ? (
                          <CheckCircleOutlinedIcon fontSize="small" />
                        ) : step.id === "completed" ? (
                          <DoneAllOutlinedIcon fontSize="small" />
                        ) : (
                          <ScheduleOutlinedIcon fontSize="small" />
                        )}
                      </span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>
                          {stateClass === "is-current"
                            ? step.description
                            : step.timeLabel || "Chờ nhận hàng"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <aside className="order-tracking-sidebar">
            <article className="order-tracking-summary-card">
              <div className="order-tracking-summary-heading">
                <h2>Chi tiết đơn hàng</h2>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<SupportAgentOutlinedIcon />}
                  onClick={() =>
                    showSnackbar("EatNow đã ghi nhận yêu cầu hỗ trợ đơn hàng.")
                  }
                >
                  Hỗ trợ
                </Button>
              </div>

              <div className="order-tracking-restaurant">
                <Image
                  src={order.restaurantImage}
                  alt={order.restaurantName}
                  width={48}
                  height={48}
                />
                <div>
                  <h3>{order.restaurantName}</h3>
                  <p>{order.restaurantAddress}</p>
                </div>
              </div>

              <div className="order-tracking-items">
                {order.items.map((item) => (
                  <div className="order-tracking-item" key={item.foodId}>
                    <span>{item.quantity}x</span>
                    <div>
                      <h3>{item.name}</h3>
                      {item.note ? <p>{item.note}</p> : null}
                    </div>
                    <strong>
                      {formatOrderCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-tracking-totals">
                <div>
                  <span>Tạm tính</span>
                  <strong>{formatOrderCurrency(order.subtotal)}</strong>
                </div>
                <div>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(order.deliveryFee)}</strong>
                </div>
                {order.discount > 0 && (
                  <div>
                    <span>
                      Ưu đãi
                      {order.appliedVoucherCode
                        ? ` (${order.appliedVoucherCode})`
                        : ""}
                    </span>
                    <strong className="order-tracking-discount">
                      -{formatOrderCurrency(order.discount)}
                    </strong>
                  </div>
                )}
                {order.surcharge > 0 && (
                  <div>
                    <span>Phụ phí</span>
                    <strong>{formatOrderCurrency(order.surcharge)}</strong>
                  </div>
                )}
                <div>
                  <span>
                    <PaymentsOutlinedIcon fontSize="small" />
                    Thanh toán
                  </span>
                  <strong>{order.paymentLabel}</strong>
                </div>
              </div>

              <div className="order-tracking-total">
                <span>Tổng cộng</span>
                <strong>{formatOrderCurrency(order.total)}</strong>
              </div>
            </article>

            <Link className="order-tracking-detail-link" href={`/orders/${order.id}`}>
              <ReceiptLongOutlinedIcon fontSize="small" />
              Xem chi tiết đơn
            </Link>
          </aside>
        </div>
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
