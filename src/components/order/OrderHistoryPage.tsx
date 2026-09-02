"use client";

import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
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
  formatOrderCurrency,
  formatOrderDateTime,
  getMergedOrderHistory,
  orderStatusLabels,
  type OrderDisplayRecord,
} from "./orderData";
import ReorderModal from "./ReorderModal";
import * as orderStyles from "./tailwindClasses";

type OrderHistoryPageProps = {
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

export default function OrderHistoryPage({
  user,
  deliveryLocationLabel,
}: OrderHistoryPageProps) {
  const router = useRouter();
  const { orderHistory, addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [reorderingOrder, setReorderingOrder] =
    useState<OrderDisplayRecord | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

  const orders = useMemo(
    () => getMergedOrderHistory(orderHistory),
    [orderHistory]
  );

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(order.status);
      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.restaurantName.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, selectedStatuses]);

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const toggleStatus = (status: OrderStatus) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    );
  };

  const handleConfirmReorder = (order: OrderDisplayRecord) => {
    order.items.forEach((item) => {
      const restaurantSlug =
        item.restaurantSlug || order.restaurantSlug || "com-tam-sau-hieu";

      addItem(
        {
          restaurantId: restaurantSlug,
          restaurantSlug,
          restaurantName: item.restaurantName || order.restaurantName,
        },
        {
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          customizationKey: item.customizationKey,
          optionSummary: item.optionSummary,
          note: item.note,
        }
      );
    });

    setReorderingOrder(null);
    showSnackbar("Đã thêm món vào giỏ hàng!");
    router.push("/cart");
  };

  const firstActiveOrderIndex = visibleOrders.findIndex((o) =>
    ["pending", "delivering", "preparing"].includes(o.status)
  );

  return (
    <div className={orderStyles.orderHistoryPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={orderStyles.orderHistoryMainClassName}>
        <div>
          <div className={orderStyles.orderHistoryTitleRowClassName}>
            <div>
              <h1>Lịch sử đơn hàng</h1>
              <p className={orderStyles.orderHistorySubtitleClassName}>
                Xem lại và quản lý các đơn hàng bạn đã đặt.
              </p>
            </div>
            <Link className={orderStyles.orderHistoryCartLinkClassName} href="/cart">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Giỏ hàng
            </Link>
          </div>
        </div>

        {/* Toolbar: Filter Chips + Search */}
        <div className={orderStyles.orderHistoryToolbarClassName}>
          <div className={orderStyles.orderHistoryFilterPanelClassName}>
            <button
              type="button"
              className={orderStyles.orderHistoryChipClassName(
                selectedStatuses.length === 0
              )}
              data-active={selectedStatuses.length === 0}
              onClick={() => setSelectedStatuses([])}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={orderStyles.orderHistoryChipClassName(
                selectedStatuses.includes("pending")
              )}
              data-active={selectedStatuses.includes("pending")}
              onClick={() => toggleStatus("pending")}
            >
              Đang xử lý
            </button>
            <button
              type="button"
              className={orderStyles.orderHistoryChipClassName(
                selectedStatuses.includes("completed")
              )}
              data-active={selectedStatuses.includes("completed")}
              onClick={() => toggleStatus("completed")}
            >
              Đã hoàn thành
            </button>
            <button
              type="button"
              className={orderStyles.orderHistoryChipClassName(
                selectedStatuses.includes("cancelled")
              )}
              data-active={selectedStatuses.includes("cancelled")}
              onClick={() => toggleStatus("cancelled")}
            >
              Đã hủy
            </button>
            <button
              type="button"
              className={orderStyles.orderHistoryChipClassName(
                selectedStatuses.includes("rejected")
              )}
              data-active={selectedStatuses.includes("rejected")}
              onClick={() => toggleStatus("rejected")}
            >
              Bị từ chối
            </button>
          </div>

          <label className={orderStyles.orderHistorySearchClassName}>
            <SearchOutlinedIcon
              className={orderStyles.orderHistorySearchIconClassName}
              fontSize="small"
            />
            <input
              className={orderStyles.orderHistorySearchInputClassName}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mã đơn hoặc nhà hàng..."
            />
          </label>
        </div>

        {/* Bento Grid */}
        {visibleOrders.length === 0 ? (
          <div className={orderStyles.orderEmptyCardClassName}>
            <FastfoodOutlinedIcon className={orderStyles.orderEmptyIconClassName} />
            <h2>Không có đơn hàng nào</h2>
            <p className={orderStyles.orderEmptyTextClassName}>
              Không tìm thấy đơn hàng phù hợp với bộ lọc hoặc từ khóa tìm kiếm
              của bạn.
            </p>
          </div>
        ) : (
          <div className={orderStyles.orderHistoryBentoGridClassName}>
            {visibleOrders.map((order, index) => {
              const isFirstActive = index === firstActiveOrderIndex;
              const isCancelled =
                order.status === "cancelled" || order.status === "rejected";

              if (isFirstActive) {
                return (
                  <div
                    className={orderStyles.orderHistoryLargeCardClassName}
                    key={order.id}
                  >
                    <div className={orderStyles.orderHistoryLargeImageAreaClassName}>
                      <Image
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        width={300}
                        height={200}
                        className={orderStyles.orderHistoryImageClassName}
                      />
                    </div>
                    <div className={orderStyles.orderHistoryLargeContentClassName}>
                      <div>
                        <div className={orderStyles.orderHistoryLargeTopClassName}>
                          <div className={orderStyles.orderHistoryLargeTitleGroupClassName}>
                            <span
                              className={orderStyles.orderStatusChipClassName(
                                order.status
                              )}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                            <h2 className={orderStyles.orderHistoryLargeTitleClassName}>
                              {order.restaurantName}
                            </h2>
                          </div>
                          <span className={orderStyles.orderHistoryLargePriceClassName}>
                            {formatOrderCurrency(order.total)}
                          </span>
                        </div>
                        <p className={orderStyles.orderHistoryCodeClassName}>
                          Mã đơn: #{order.id} •{" "}
                          <span
                            className={orderStyles.orderHistoryPaymentPillClassName(
                              order.paymentLabel.includes("VNPAY")
                                ? "vnpay"
                                : "cod"
                            )}
                          >
                            {order.paymentLabel}
                          </span>
                        </p>
                        <p className={orderStyles.orderHistoryDateClassName}>
                          <ScheduleOutlinedIcon fontSize="small" />{" "}
                          {formatOrderDateTime(order.createdAt)}
                        </p>
                      </div>

                      <div className={orderStyles.orderHistoryLargeActionsClassName}>
                        <Button
                          variant="outlined"
                          component={Link}
                          href={`/orders/${order.id}`}
                          className={orderStyles.orderHistoryLargeOutlinedButtonClassName}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="contained"
                          component={Link}
                          href={`/orders/${order.id}/tracking`}
                          className={orderStyles.orderHistoryLargeContainedButtonClassName}
                        >
                          Theo dõi đơn
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (isCancelled) {
                return (
                  <div
                    className={orderStyles.orderHistorySmallCardClassName(true)}
                    key={order.id}
                  >
                    <div className={orderStyles.orderHistoryCardTopClassName}>
                      <span
                        className={orderStyles.orderStatusChipClassName(
                          order.status
                        )}
                      >
                        {orderStatusLabels[order.status]}
                      </span>
                      <span className={orderStyles.orderHistoryCodeClassName}>
                        #{order.id} •{" "}
                        <span
                          className={orderStyles.orderHistoryPaymentPillClassName(
                            order.paymentLabel.includes("VNPAY")
                              ? "vnpay"
                              : "cod"
                          )}
                        >
                          {order.paymentLabel}
                        </span>
                      </span>
                    </div>

                    <div className={orderStyles.orderHistoryCardBodyClassName}>
                      <div className={orderStyles.orderHistorySmallImageContainerClassName}>
                        <Image
                          src={order.restaurantImage}
                          alt={order.restaurantName}
                          width={80}
                          height={80}
                          className={orderStyles.orderHistoryImageClassName}
                        />
                      </div>
                      <div className={orderStyles.orderHistorySmallInfoClassName}>
                        <h3 className={orderStyles.orderHistorySmallTitleClassName}>
                          {order.restaurantName}
                        </h3>
                        <p className={orderStyles.orderHistorySmallDateClassName}>
                          {formatOrderDateTime(order.createdAt)}
                        </p>
                        <strong className={orderStyles.orderHistorySmallPriceClassName}>
                          {formatOrderCurrency(order.total)}
                        </strong>
                        {order.issueReason && (
                          <small className={orderStyles.orderHistoryIssueReasonClassName}>
                            <InfoOutlinedIcon sx={{ fontSize: "14px" }} />
                            {order.issueReason}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className={orderStyles.orderHistoryActionsClassName}>
                      <Button
                        variant="outlined"
                        component={Link}
                        href={`/orders/${order.id}`}
                        fullWidth
                        className={orderStyles.orderHistoryOutlinedButtonClassName}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  className={orderStyles.orderHistorySmallCardClassName()}
                  key={order.id}
                >
                  <div className={orderStyles.orderHistoryCardTopClassName}>
                    <span
                      className={orderStyles.orderStatusChipClassName(
                        order.status
                      )}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className={orderStyles.orderHistoryCodeClassName}>
                      #{order.id} •{" "}
                      <span
                        className={orderStyles.orderHistoryPaymentPillClassName(
                          order.paymentLabel.includes("VNPAY")
                            ? "vnpay"
                            : "cod"
                        )}
                      >
                        {order.paymentLabel}
                      </span>
                    </span>
                  </div>

                  <div className={orderStyles.orderHistoryCardBodyClassName}>
                    <div className={orderStyles.orderHistorySmallImageContainerClassName}>
                      <Image
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        width={80}
                        height={80}
                        className={orderStyles.orderHistoryImageClassName}
                      />
                    </div>
                    <div className={orderStyles.orderHistorySmallInfoClassName}>
                      <h3 className={orderStyles.orderHistorySmallTitleClassName}>
                        {order.restaurantName}
                      </h3>
                      <p className={orderStyles.orderHistorySmallDateClassName}>
                        {formatOrderDateTime(order.createdAt)}
                      </p>
                      <strong className={orderStyles.orderHistorySmallPriceClassName}>
                        {formatOrderCurrency(order.total)}
                      </strong>
                    </div>
                  </div>

                  <div className={orderStyles.orderHistoryActionsClassName}>
                    {order.status === "completed" ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            showSnackbar("Chức năng đánh giá đang phát triển")
                          }
                          fullWidth
                          className={orderStyles.orderHistoryOutlinedButtonClassName}
                        >
                          Đánh giá
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ReplayOutlinedIcon />}
                          onClick={() => setReorderingOrder(order)}
                          fullWidth
                          className={orderStyles.orderHistoryContainedButtonClassName}
                        >
                          Đặt lại
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          component={Link}
                          href={`/orders/${order.id}`}
                          fullWidth
                          className={orderStyles.orderHistoryOutlinedButtonClassName}
                        >
                          Xem chi tiết
                        </Button>
                        {["pending", "delivering", "preparing"].includes(
                          order.status
                        ) && (
                          <Button
                            variant="contained"
                            component={Link}
                            href={`/orders/${order.id}/tracking`}
                            fullWidth
                            className={orderStyles.orderHistoryContainedButtonClassName}
                          >
                            Theo dõi
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerFooter onPlaceholder={showSnackbar} />

      {/* Reorder Modal */}
      {reorderingOrder && (
        <ReorderModal
          open={Boolean(reorderingOrder)}
          items={reorderingOrder.items}
          onClose={() => setReorderingOrder(null)}
          onConfirm={() => handleConfirmReorder(reorderingOrder)}
        />
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
