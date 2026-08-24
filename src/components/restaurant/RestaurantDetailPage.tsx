"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cartStore";
import { signalNavigationStart } from "@/utils/navigationFeedback";
import type {
  RestaurantDetail,
  RestaurantMenuItem,
} from "./restaurantDetailData";

const FoodOptionsModal = dynamic(
  () => import("@/components/cart/FoodOptionsModal"),
  { ssr: false }
);

type RestaurantDetailPageProps = {
  restaurant: RestaurantDetail;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RestaurantDetailPage({
  restaurant,
}: RestaurantDetailPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(
    restaurant.menuCategories[0]?.id || ""
  );
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

  // ---- Giỏ hàng ----
  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore(
    (state) => state.hasConflictingRestaurant
  );
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedFood, setSelectedFood] = useState<RestaurantMenuItem | null>(
    null
  );
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);

  // Khi thêm món của quán khác trong lúc giỏ đang có món của quán A,
  // giữ lại lựa chọn (selection) đang chờ để add sau khi người dùng xác nhận xoá giỏ cũ.
  const [pendingConflictSelection, setPendingConflictSelection] = useState<{
    food: RestaurantMenuItem;
    selection: {
      size?: { id: string; name: string; price: number };
      toppings: { id: string; name: string; price: number }[];
      note?: string;
      quantity: number;
    };
  } | null>(null);
  const activeCategoryLabel = useMemo(
    () =>
      restaurant.menuCategories.find((category) => category.id === activeCategory)
        ?.label || restaurant.menuCategories[0]?.label,
    [activeCategory, restaurant.menuCategories]
  );

  const showPlaceholder = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddItem = (item: RestaurantMenuItem) => {
    if (!restaurant.isOpen) {
      showPlaceholder(restaurant.availabilityMessage || "Nhà hàng hiện chưa nhận đơn.");
      return;
    }

    if (!item.isAvailable) {
      showPlaceholder("Món này hiện chưa sẵn sàng để đặt.");
      return;
    }

    // Không check đăng nhập ở đây -- chỉ check khi người dùng xác nhận đặt đơn.
    setSelectedFood(item);
    setOptionsModalOpen(true);
  };

  const addToCart = (
    food: RestaurantMenuItem,
    selection: {
      size?: { id: string; name: string; price: number };
      toppings: { id: string; name: string; price: number }[];
      note?: string;
      quantity: number;
    }
  ) => {
    addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      foodId: food.id,
      foodName: food.name,
      foodImage: food.image,
      basePrice: food.price,
      size: selection.size,
      toppings: selection.toppings,
      note: selection.note,
      quantity: selection.quantity,
    });
    showPlaceholder(`Đã thêm ${food.name} vào giỏ hàng.`);
  };

  const handleOptionsConfirm = (selection: {
    size?: { id: string; name: string; price: number };
    toppings: { id: string; name: string; price: number }[];
    note?: string;
    quantity: number;
  }) => {
    if (!selectedFood) return;

    // Giỏ đang có món của quán khác -> hỏi xác nhận trước khi xoá & thêm món mới.
    if (hasConflictingRestaurant(restaurant.id)) {
      setPendingConflictSelection({ food: selectedFood, selection });
      return;
    }

    addToCart(selectedFood, selection);
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingConflictSelection) return;
    clearCart();
    addToCart(pendingConflictSelection.food, pendingConflictSelection.selection);
    setPendingConflictSelection(null);
  };

  const handleCancelReplaceCart = () => {
    setPendingConflictSelection(null);
  };

  return (
    <div className="restaurant-detail-page">
      <main className="restaurant-detail-main">
        <section className="restaurant-hero" aria-labelledby="restaurant-title">
          <div className="restaurant-hero__media">
            {restaurant.image ? (
              <Image
                src={restaurant.image}
                alt={`Ảnh nhà hàng ${restaurant.name}`}
                fill
                priority
                unoptimized
                sizes="(max-width: 900px) 100vw, 390px"
              />
            ) : (
              <div className="restaurant-image-placeholder">
                <RestaurantMenuOutlinedIcon />
                <span>Nhà hàng chưa cập nhật ảnh bìa</span>
              </div>
            )}
          </div>

          <div className="restaurant-hero__body">
            <div>
              <div className="restaurant-hero__status-row">
                <Chip
                  size="small"
                  label={restaurant.availabilityLabel || (restaurant.isOpen ? "Đang nhận đơn" : "Chưa nhận đơn")}
                  color={restaurant.isOpen ? "success" : "error"}
                  className="restaurant-status-chip"
                />
                <span>{restaurant.isOpen && restaurant.openUntil
                  ? `Mở đến ${restaurant.openUntil}`
                  : restaurant.availabilityMessage}</span>
              </div>
              <h1 id="restaurant-title">{restaurant.name}</h1>
              <div className="restaurant-meta-row">
                <span>
                  <StarOutlinedIcon fontSize="inherit" />
                  <strong>{restaurant.rating}</strong>
                  <span>{restaurant.reviewCount}</span>
                </span>
                <span>
                  <LocationOnOutlinedIcon fontSize="inherit" />
                  {restaurant.address}
                </span>
              </div>
            </div>

            <div className="restaurant-service-row">
              <span>
                <AccessTimeOutlinedIcon fontSize="small" />
                {restaurant.deliveryTime}
              </span>
              <span>
                <LocalShippingOutlinedIcon fontSize="small" />
                {restaurant.deliveryFee}
              </span>
            </div>
          </div>
        </section>

        {!restaurant.isOpen && <Alert severity="warning" className="restaurant-availability-alert">
          {restaurant.availabilityMessage || "Nhà hàng hiện chưa thể nhận đơn mới."}
        </Alert>}

        <nav
          className="restaurant-category-tabs"
          aria-label="Danh mục món ăn"
        >
          {restaurant.menuCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={category.id === activeCategory ? "is-active" : ""}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <div className="restaurant-content-grid">
          <div className="restaurant-menu-column">
            {restaurant.menuCategories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="restaurant-menu-section"
              >
                <h2>{category.label}</h2>
                <div className="restaurant-menu-list">
                  {category.items.map((item) => (
                    <article
                      key={item.id}
                      className={`restaurant-menu-card${
                        !item.isAvailable ? " is-unavailable" : ""
                      }`}
                    >
                      <div className="restaurant-menu-card__content">
                        {item.isPopular ? (
                          <span className="restaurant-menu-card__badge">
                            Bán chạy
                          </span>
                        ) : null}
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <strong>{formatCurrency(item.price)}</strong>
                        {!item.isAvailable ? (
                          <span className="restaurant-menu-card__unavailable">
                            Tạm hết món
                          </span>
                        ) : null}
                      </div>

                      <div className="restaurant-menu-card__media">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            sizes="96px"
                          />
                        ) : (
                          <div className="restaurant-image-placeholder restaurant-image-placeholder--food">
                            <RestaurantMenuOutlinedIcon />
                            <span>Chưa có ảnh</span>
                          </div>
                        )}
                        <IconButton
                          aria-label={`Thêm ${item.name}`}
                          className="restaurant-add-button"
                          onClick={() => handleAddItem(item)}
                          disabled={!restaurant.isOpen || !item.isAvailable}
                        >
                          <AddOutlinedIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="restaurant-side-panel" aria-label="Tóm tắt đặt món">
            <h2>{activeCategoryLabel}</h2>
            <Button
              variant="outlined"
              onClick={() =>
                showPlaceholder(
                  "Bộ lọc món ăn sẽ được triển khai ở sprint tiếp theo."
                )
              }
            >
              Lọc món đang có sẵn
            </Button>
          </aside>
        </div>
      </main>

      <nav className="restaurant-bottom-nav" aria-label="Điều hướng nhanh">
        <button type="button" onClick={() => {
          signalNavigationStart();
          router.push("/");
        }}>
          <HomeOutlinedIcon />
          <span>Trang chủ</span>
        </button>
        <button className="is-active" type="button">
          <RestaurantMenuOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button
          type="button"
          onClick={() =>
            showPlaceholder(
              "Đơn hàng sẽ được triển khai ở sprint tiếp theo."
            )
          }
        >
          <ReceiptLongOutlinedIcon />
          <span>Đơn hàng</span>
        </button>
      </nav>

      <FoodOptionsModal
        open={optionsModalOpen}
        food={selectedFood}
        onClose={() => setOptionsModalOpen(false)}
        onConfirm={handleOptionsConfirm}
      />

      <Dialog
        open={Boolean(pendingConflictSelection)}
        onClose={handleCancelReplaceCart}
      >
        <DialogTitle>Bắt đầu giỏ hàng mới?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Giỏ hàng của bạn đang có món từ một nhà hàng khác. Bạn chỉ có thể
            đặt món từ một nhà hàng trong mỗi đơn. Xoá giỏ hàng hiện tại để
            thêm món từ {restaurant.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReplaceCart}>Huỷ</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReplaceCart}>
            Xoá giỏ & thêm món mới
          </Button>
        </DialogActions>
      </Dialog>

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
