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
  getOrderStatusClass,
  orderStatusLabels,
  type OrderDisplayRecord,
} from "./orderData";
import ReorderModal from "./ReorderModal";

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
    <div className="order-history-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className="order-history-main">
        <div className="order-history-header-container">
          <div className="order-history-title-row">
            <div>
              <h1>Lịch sử đơn hàng</h1>
              <p className="order-history-subtitle">
                Xem lại và quản lý các đơn hàng bạn đã đặt.
              </p>
            </div>
            <Link className="order-history-cart-link" href="/cart">
              <ReceiptLongOutlinedIcon fontSize="small" />
              Giỏ hàng
            </Link>
          </div>
        </div>

        {/* Toolbar: Filter Chips + Search */}
        <div className="order-history-toolbar">
          <div className="order-history-filter-panel order-history-filters">
            <button
              type="button"
              className={`order-history-chip ${
                selectedStatuses.length === 0 ? "active" : ""
              }`}
              onClick={() => setSelectedStatuses([])}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`order-history-chip ${
                selectedStatuses.includes("pending") ? "active" : ""
              }`}
              onClick={() => toggleStatus("pending")}
            >
              Đang xử lý
            </button>
            <button
              type="button"
              className={`order-history-chip ${
                selectedStatuses.includes("completed") ? "active" : ""
              }`}
              onClick={() => toggleStatus("completed")}
            >
              Đã hoàn thành
            </button>
            <button
              type="button"
              className={`order-history-chip ${
                selectedStatuses.includes("cancelled") ? "active" : ""
              }`}
              onClick={() => toggleStatus("cancelled")}
            >
              Đã hủy
            </button>
            <button
              type="button"
              className={`order-history-chip ${
                selectedStatuses.includes("rejected") ? "active" : ""
              }`}
              onClick={() => toggleStatus("rejected")}
            >
              Bị từ chối
            </button>
          </div>

          <label className="order-history-search">
            <SearchOutlinedIcon fontSize="small" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mã đơn hoặc nhà hàng..."
            />
          </label>
        </div>

        {/* Bento Grid */}
        {visibleOrders.length === 0 ? (
          <div className="order-empty-card">
            <FastfoodOutlinedIcon />
            <h2>Không có đơn hàng nào</h2>
            <p>
              Không tìm thấy đơn hàng phù hợp với bộ lọc hoặc từ khóa tìm kiếm
              của bạn.
            </p>
          </div>
        ) : (
          <div className="order-history-bento-grid">
            {visibleOrders.map((order, index) => {
              const isFirstActive = index === firstActiveOrderIndex;
              const isCancelled =
                order.status === "cancelled" || order.status === "rejected";

              if (isFirstActive) {
                return (
                  <div
                    className="order-history-card order-history-large-card"
                    key={order.id}
                  >
                    <div className="order-history-large-image-area">
                      <Image
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        width={300}
                        height={200}
                        className="order-history-large-image"
                      />
                    </div>
                    <div className="order-history-large-content">
                      <div>
                        <div className="order-history-large-top">
                          <div className="order-history-large-title-group">
                            <span
                              className={`order-status-chip ${getOrderStatusClass(
                                order.status
                              )}`}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                            <h2>{order.restaurantName}</h2>
                          </div>
                          <span className="order-history-price">
                            {formatOrderCurrency(order.total)}
                          </span>
                        </div>
                        <p className="order-history-code">
                          Mã đơn: #{order.id} •{" "}
                          <span
                            className={`order-history-payment-pill ${
                              order.paymentLabel.includes("VNPAY")
                                ? "is-vnpay"
                                : "is-cod"
                            }`}
                          >
                            {order.paymentLabel}
                          </span>
                        </p>
                        <p className="order-history-date">
                          <ScheduleOutlinedIcon fontSize="small" />{" "}
                          {formatOrderDateTime(order.createdAt)}
                        </p>
                      </div>

                      <div className="order-history-large-actions">
                        <Button
                          variant="outlined"
                          component={Link}
                          href={`/orders/${order.id}`}
                          sx={{
                            border: "2px solid #8e7164",
                            color: "#5a4136",
                            borderRadius: "12px",
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#7a3000",
                              color: "#7a3000",
                              background: "#f3f3f6",
                            },
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="contained"
                          component={Link}
                          href={`/orders/${order.id}/tracking`}
                          sx={{
                            background: "#a04100",
                            color: "#ffffff",
                            borderRadius: "12px",
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: "0 4px 14px rgba(160, 65, 0, 0.25)",
                            "&:hover": {
                              background: "#7a3000",
                            },
                          }}
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
                    className="order-history-card order-history-small-card order-history-cancelled"
                    key={order.id}
                  >
                    <div className="order-history-card-top">
                      <span
                        className={`order-status-chip ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {orderStatusLabels[order.status]}
                      </span>
                      <span className="order-history-code">
                        #{order.id} •{" "}
                        <span
                          className={`order-history-payment-pill ${
                            order.paymentLabel.includes("VNPAY")
                              ? "is-vnpay"
                              : "is-cod"
                          }`}
                        >
                          {order.paymentLabel}
                        </span>
                      </span>
                    </div>

                    <div className="order-history-card-body">
                      <div className="order-history-small-image-container">
                        <Image
                          src={order.restaurantImage}
                          alt={order.restaurantName}
                          width={80}
                          height={80}
                          className="order-history-small-image"
                        />
                      </div>
                      <div className="order-history-small-info">
                        <h3>{order.restaurantName}</h3>
                        <p className="order-history-date">
                          {formatOrderDateTime(order.createdAt)}
                        </p>
                        <strong className="order-history-price">
                          {formatOrderCurrency(order.total)}
                        </strong>
                        {order.issueReason && (
                          <small className="order-history-issue-reason">
                            <InfoOutlinedIcon sx={{ fontSize: "14px" }} />
                            {order.issueReason}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="order-history-actions">
                      <Button
                        variant="outlined"
                        component={Link}
                        href={`/orders/${order.id}`}
                        fullWidth
                        sx={{
                          border: "1px solid #ddc1b4",
                          color: "#5a4136",
                          borderRadius: "10px",
                          py: 0.8,
                          fontWeight: 700,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#7a3000",
                            color: "#7a3000",
                            background: "#f3f3f6",
                          },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  className="order-history-card order-history-small-card"
                  key={order.id}
                >
                  <div className="order-history-card-top">
                    <span
                      className={`order-status-chip ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className="order-history-code">
                      #{order.id} •{" "}
                      <span
                        className={`order-history-payment-pill ${
                          order.paymentLabel.includes("VNPAY")
                            ? "is-vnpay"
                            : "is-cod"
                        }`}
                      >
                        {order.paymentLabel}
                      </span>
                    </span>
                  </div>

                  <div className="order-history-card-body">
                    <div className="order-history-small-image-container">
                      <Image
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        width={80}
                        height={80}
                        className="order-history-small-image"
                      />
                    </div>
                    <div className="order-history-small-info">
                      <h3>{order.restaurantName}</h3>
                      <p className="order-history-date">
                        {formatOrderDateTime(order.createdAt)}
                      </p>
                      <strong className="order-history-price">
                        {formatOrderCurrency(order.total)}
                      </strong>
                    </div>
                  </div>

                  <div className="order-history-actions">
                    {order.status === "completed" ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            showSnackbar("Chức năng đánh giá đang phát triển")
                          }
                          fullWidth
                          sx={{
                            border: "1px solid #ddc1b4",
                            color: "#5a4136",
                            borderRadius: "10px",
                            py: 0.8,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#7a3000",
                              color: "#7a3000",
                              background: "#f3f3f6",
                            },
                          }}
                        >
                          Đánh giá
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ReplayOutlinedIcon />}
                          onClick={() => setReorderingOrder(order)}
                          fullWidth
                          sx={{
                            background: "#a04100",
                            color: "#ffffff",
                            borderRadius: "10px",
                            py: 0.8,
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: "0 2px 8px rgba(160, 65, 0, 0.2)",
                            "&:hover": {
                              background: "#7a3000",
                            },
                          }}
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
                          sx={{
                            border: "1px solid #ddc1b4",
                            color: "#5a4136",
                            borderRadius: "10px",
                            py: 0.8,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#7a3000",
                              color: "#7a3000",
                              background: "#f3f3f6",
                            },
                          }}
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
                            sx={{
                              background: "#a04100",
                              color: "#ffffff",
                              borderRadius: "10px",
                              py: 0.8,
                              fontWeight: 700,
                              textTransform: "none",
                              "&:hover": {
                                background: "#7a3000",
                              },
                            }}
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
