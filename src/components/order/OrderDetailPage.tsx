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

import CustomerFooter from "@/components/home/CustomerFooter";
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
import * as orderStyles from "./tailwindClasses";

type OrderDetailPageProps = {
  orderId: string;
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

const pendingStatusLabel = "Chờ xác nhận";

export default function OrderDetailPage({
  orderId,
  user,
  deliveryLocationLabel,
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
    <div className={orderStyles.orderDetailPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={orderStyles.orderDetailMainClassName}>
        <div className={orderStyles.orderDetailTitleRowClassName}>
          <button
            className={orderStyles.orderBackButtonClassName}
            type="button"
            aria-label="Quay lại lịch sử đơn hàng"
            onClick={() => router.push("/orders")}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <span className={orderStyles.orderFlowTitleEyebrowClassName}>
              #{order.id}
            </span>
            <h1>Chi tiết đơn hàng</h1>
          </div>
        </div>

        <div className={orderStyles.orderDetailLayoutClassName}>
          <section className={orderStyles.orderDetailContentClassName}>
            <article className={orderStyles.orderDetailStatusCardClassName}>
              <div className={orderStyles.orderDetailStatusTopClassName}>
                <p className={orderStyles.orderDetailStatusMetaClassName}>
                  Mã đơn: #{order.id} • {order.restaurantName}
                </p>
                <div className={orderStyles.orderDetailStatusTitleGroupClassName}>
                  <h2 className={orderStyles.orderDetailStatusTitleClassName}>
                    {order.status === "pending"
                      ? pendingStatusLabel
                      : orderStatusLabels[order.status]}
                  </h2>
                  {order.status === "pending" && (
                    <span className={orderStyles.orderDetailStatusNewPillClassName}>
                      <ScheduleOutlinedIcon fontSize="small" />
                      Mới
                    </span>
                  )}
                </div>
              </div>
              <div className={orderStyles.orderDetailStatusIconClassName(order.status)}>
                {order.status === "completed" ? (
                  <CheckCircleOutlinedIcon />
                ) : order.status === "cancelled" || order.status === "rejected" ? (
                  <CancelOutlinedIcon />
                ) : (
                  <ScheduleOutlinedIcon />
                )}
              </div>
              <p className={orderStyles.orderDetailStatusDescriptionClassName}>
                {order.status === "cancelled" || order.status === "rejected"
                  ? order.issueReason || orderStatusDescriptions[order.status]
                  : orderStatusDescriptions[order.status]}
              </p>
            </article>

            <article className={orderStyles.orderDetailCardClassName}>
              <h2>Tiến trình</h2>
              <div className={orderStyles.orderDetailTimelineClassName}>
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
                  const timelineState = isComplete
                    ? "complete"
                    : isCurrent
                    ? "current"
                    : "pending";

                  return (
                    <div
                      className={orderStyles.orderDetailTimelineStepClassName(
                        timelineState
                      )}
                      data-state={timelineState}
                      key={step.id}
                    >
                      <span
                        className={orderStyles.orderDetailTimelineMarkerClassName(
                          timelineState
                        )}
                      />
                      <div>
                        <h3 className={orderStyles.orderDetailTimelineTitleClassName}>
                          {step.title}
                        </h3>
                        <p className={orderStyles.orderDetailCardTextClassName}>
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

            <article className={orderStyles.orderDetailCardClassName}>
              <h2>Món ăn đã đặt</h2>
              <div className={orderStyles.orderDetailItemListClassName}>
                {order.items.map((item) => (
                  <div className={orderStyles.orderDetailItemClassName} key={item.foodId}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className={orderStyles.orderDetailItemImageClassName}
                    />
                    <div>
                      <h3 className={orderStyles.orderDetailItemNameClassName}>
                        {item.name}
                      </h3>
                      <p className={orderStyles.orderDetailItemMetaClassName}>
                        x{item.quantity}
                      </p>
                      {item.note ? (
                        <small className={orderStyles.orderDetailItemNoteClassName}>
                          {item.note}
                        </small>
                      ) : null}
                    </div>
                    <strong className={orderStyles.orderDetailItemPriceClassName}>
                      {formatOrderCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className={orderStyles.orderDetailSidebarClassName}>
            <article className={orderStyles.orderDetailCardClassName}>
              <h2>Tổng cộng</h2>
              <div className={orderStyles.orderDetailTotalRowsClassName}>
                <div className={orderStyles.orderDetailTotalRowClassName}>
                  <span>Tạm tính ({order.itemCount} món)</span>
                  <strong>{formatOrderCurrency(order.subtotal)}</strong>
                </div>
                <div className={orderStyles.orderDetailTotalRowClassName}>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(order.deliveryFee)}</strong>
                </div>
                {order.discount > 0 && (
                  <div className={orderStyles.orderDetailTotalRowClassName}>
                    <span>
                      Ưu đãi
                      {order.appliedVoucherCode
                        ? ` (${order.appliedVoucherCode})`
                        : ""}
                    </span>
                    <strong className={orderStyles.orderDetailDiscountClassName}>
                      -{formatOrderCurrency(order.discount)}
                    </strong>
                  </div>
                )}
              </div>
              <div className={orderStyles.orderDetailTotalClassName}>
                <span>Tổng thanh toán</span>
                <strong>{formatOrderCurrency(order.total)}</strong>
              </div>
              <div className={orderStyles.orderDetailPaymentNoteClassName}>
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

            <article className={orderStyles.orderDetailCardClassName}>
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
                  className={orderStyles.orderDetailTrackLinkClassName}
                  href={`/orders/${order.id}/tracking`}
                >
                  <LocalShippingOutlinedIcon fontSize="small" />
                  Theo dõi đơn hàng
                </Link>
                <Button
                  variant="outlined"
                  className={orderStyles.orderDetailCancelButtonClassName}
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
                className={orderStyles.orderDetailReviewButtonClassName}
                startIcon={<StarOutlinedIcon />}
                onClick={() => showSnackbar("Đánh giá sẽ được phát triển sau.")}
              >
                Đánh giá
              </Button>
            )}

            {(order.status === "completed" || order.status === "cancelled" || order.status === "rejected") && (
              <Button
                variant="outlined"
                className={orderStyles.orderDetailReorderButtonClassName}
                startIcon={<ReplayOutlinedIcon />}
                onClick={() => router.push(`/restaurant/${order.restaurantSlug}`)}
              >
                Đặt lại
              </Button>
            )}

            <Link className={orderStyles.orderDetailHistoryLinkClassName} href="/orders">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Lịch sử đơn hàng
            </Link>
          </aside>
        </div>
      </main>

      <CustomerFooter onPlaceholder={showSnackbar} />

      {cancelDialogOpen && (
        <div className={orderStyles.orderDetailCancelModalClassName}>
          <div className={orderStyles.orderDetailCancelCardClassName}>
            <div className={orderStyles.orderDetailCancelIconClassName}>
              <CancelOutlinedIcon />
            </div>
            <h2>Xác nhận hủy đơn hàng</h2>
            <p>
              Bạn có chắc muốn hủy đơn hàng #{order.id}? Hành động này không thể
              hoàn tác.
            </p>
            <Button
              variant="contained"
              className={orderStyles.orderDetailCancelConfirmClassName}
              onClick={() => {
                showSnackbar("Hủy đơn sẽ được xử lý khi có API đơn hàng.");
                setCancelDialogOpen(false);
              }}
            >
              Xác nhận hủy
            </Button>
            <Button
              variant="text"
              className={orderStyles.orderDetailCancelKeepClassName}
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
