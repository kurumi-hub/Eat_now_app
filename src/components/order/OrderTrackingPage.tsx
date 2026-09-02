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
import * as orderStyles from "./tailwindClasses";

type OrderTrackingPageProps = {
  orderId: string;
  user: PublicUser | null;
  deliveryLocationLabel?: string;
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

  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}

export default function OrderTrackingPage({
  orderId,
  user,
  deliveryLocationLabel,
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
    <div className={orderStyles.orderTrackingPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={orderStyles.orderTrackingMainClassName}>
        <div className={orderStyles.orderTrackingTitleRowClassName}>
          <button
            className={orderStyles.orderBackButtonClassName}
            type="button"
            aria-label="Quay lại chi tiết đơn hàng"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <h1>Theo dõi đơn hàng</h1>
            <p className={orderStyles.orderTrackingTitleMetaClassName}>
              Mã đơn: <strong>#{order.id}</strong>
            </p>
          </div>
        </div>

        <div className={orderStyles.orderTrackingLayoutClassName}>
          <section className={orderStyles.orderTrackingContentClassName}>
            <article
              className={orderStyles.orderTrackingMapClassName}
              aria-label="Bản đồ giao hàng"
            >
              <div className={orderStyles.orderTrackingMapCanvasClassName}>
                <span className={orderStyles.orderTrackingMapRouteClassName("primary")} />
                <span className={orderStyles.orderTrackingMapRouteClassName("secondary")} />
                <span className={orderStyles.orderTrackingMapPinClassName("restaurant")}>
                  <RestaurantOutlinedIcon fontSize="small" />
                </span>
                <span className={orderStyles.orderTrackingMapPinClassName("courier")}>
                  <DeliveryDiningOutlinedIcon fontSize="small" />
                </span>
                <span className={orderStyles.orderTrackingMapPinClassName("customer")}>
                  <LocationOnOutlinedIcon fontSize="small" />
                </span>
              </div>

              <div className={orderStyles.orderTrackingEtaCardClassName}>
                <span>Dự kiến giao hàng</span>
                <strong>{order.estimatedDeliveryLabel}</strong>
                <small>Cập nhật lúc: {order.updatedAtLabel}</small>
              </div>
            </article>

            <article className={orderStyles.orderTrackingCardClassName}>
              <div className={orderStyles.orderTrackingCardHeadingClassName}>
                <div>
                  <span>Trạng thái đơn hàng</span>
                  <h2>{activeStepLabel}</h2>
                </div>
                <DeliveryDiningOutlinedIcon />
              </div>

              <div className={orderStyles.orderTrackingTimelineClassName}>
                {orderTimelineSteps.map((step) => {
                  const stateClass = getTimelineState(step.id, order.status);

                  return (
                    <div
                      className={orderStyles.orderTrackingTimelineStepClassName(
                        stateClass
                      )}
                      data-state={stateClass}
                      key={step.id}
                    >
                      <span
                        className={orderStyles.orderTrackingTimelineMarkerClassName(
                          stateClass
                        )}
                      >
                        {stateClass === "complete" ? (
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
                          {stateClass === "current"
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

          <aside className={orderStyles.orderTrackingSidebarClassName}>
            <article className={orderStyles.orderTrackingSummaryCardClassName}>
              <div className={orderStyles.orderTrackingSummaryHeadingClassName}>
                <h2>Chi tiết đơn hàng</h2>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<SupportAgentOutlinedIcon />}
                  className={orderStyles.orderTrackingSupportButtonClassName}
                  onClick={() =>
                    showSnackbar("EatNow đã ghi nhận yêu cầu hỗ trợ đơn hàng.")
                  }
                >
                  Hỗ trợ
                </Button>
              </div>

              <div className={orderStyles.orderTrackingRestaurantClassName}>
                <Image
                  src={order.restaurantImage}
                  alt={order.restaurantName}
                  width={48}
                  height={48}
                  className={orderStyles.orderTrackingRestaurantImageClassName}
                />
                <div>
                  <h3 className={orderStyles.orderTrackingRestaurantTitleClassName}>
                    {order.restaurantName}
                  </h3>
                  <p className={orderStyles.orderTrackingRestaurantTextClassName}>
                    {order.restaurantAddress}
                  </p>
                </div>
              </div>

              <div className={orderStyles.orderTrackingItemsClassName}>
                {order.items.map((item) => (
                  <div className={orderStyles.orderTrackingItemClassName} key={item.foodId}>
                    <span className={orderStyles.orderTrackingItemQuantityClassName}>
                      {item.quantity}x
                    </span>
                    <div>
                      <h3 className={orderStyles.orderTrackingItemTitleClassName}>
                        {item.name}
                      </h3>
                      {item.note ? (
                        <p className={orderStyles.orderTrackingItemNoteClassName}>
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                    <strong className={orderStyles.orderTrackingItemPriceClassName}>
                      {formatOrderCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className={orderStyles.orderTrackingTotalsClassName}>
                <div className={orderStyles.orderTrackingTotalRowClassName}>
                  <span>Tạm tính</span>
                  <strong>{formatOrderCurrency(order.subtotal)}</strong>
                </div>
                <div className={orderStyles.orderTrackingTotalRowClassName}>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(order.deliveryFee)}</strong>
                </div>
                {order.discount > 0 && (
                  <div className={orderStyles.orderTrackingTotalRowClassName}>
                    <span>
                      Ưu đãi
                      {order.appliedVoucherCode
                        ? ` (${order.appliedVoucherCode})`
                        : ""}
                    </span>
                    <strong className={orderStyles.orderTrackingDiscountClassName}>
                      -{formatOrderCurrency(order.discount)}
                    </strong>
                  </div>
                )}
                {order.surcharge > 0 && (
                  <div className={orderStyles.orderTrackingTotalRowClassName}>
                    <span>Phụ phí</span>
                    <strong>{formatOrderCurrency(order.surcharge)}</strong>
                  </div>
                )}
                <div className={orderStyles.orderTrackingTotalRowClassName}>
                  <span>
                    <PaymentsOutlinedIcon fontSize="small" />
                    Thanh toán
                  </span>
                  <strong>{order.paymentLabel}</strong>
                </div>
              </div>

              <div className={orderStyles.orderTrackingTotalClassName}>
                <span>Tổng cộng</span>
                <strong>{formatOrderCurrency(order.total)}</strong>
              </div>
            </article>

            <Link
              className={orderStyles.orderTrackingDetailLinkClassName}
              href={`/orders/${order.id}`}
            >
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
