"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
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
  Snackbar,
} from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/store/cartStore";
import ReviewComposer from "./ReviewComposer";
import type { FoodReviewData, ReviewEligibleOrder } from "./reviewData";
import type { RestaurantDetail, RestaurantMenuItem } from "./restaurantDetailData";

const FoodOptionsModal = dynamic(
  () => import("@/components/cart/FoodOptionsModal"),
  { ssr: false }
);

type CartSelection = {
  size?: { id: string; name: string; price: number };
  toppings: { id: string; name: string; price: number }[];
  note?: string;
  quantity: number;
};

type FoodDetailPageProps = {
  restaurant: RestaurantDetail;
  food: RestaurantMenuItem;
  categoryLabel: string;
  reviewData: FoodReviewData;
  reviewOrders: ReviewEligibleOrder[];
  isAuthenticated: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Gần đây" : date.toLocaleDateString("vi-VN");
}

export default function FoodDetailPage({
  restaurant,
  food,
  categoryLabel,
  reviewData,
  reviewOrders,
  isAuthenticated,
}: FoodDetailPageProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<CartSelection | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore((state) => state.hasConflictingRestaurant);
  const clearCart = useCartStore((state) => state.clearCart);

  const canOrder = restaurant.isOpen && food.isAvailable;

  const showNotice = (message: string) => setSnackbar({ open: true, message });

  const openOptions = () => {
    if (!restaurant.isOpen) {
      showNotice(restaurant.availabilityMessage || "Nhà hàng hiện chưa nhận đơn.");
      return;
    }
    if (!food.isAvailable) {
      showNotice("Món này hiện chưa sẵn sàng để đặt.");
      return;
    }
    setOptionsOpen(true);
  };

  const addToCart = (selection: CartSelection) => {
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
    setOptionsOpen(false);
    showNotice(`Đã thêm ${food.name} vào giỏ hàng.`);
  };

  const handleConfirm = (selection: CartSelection) => {
    if (hasConflictingRestaurant(restaurant.id)) {
      setPendingSelection(selection);
      return;
    }
    addToCart(selection);
  };

  const handleReplaceCart = () => {
    if (!pendingSelection) return;
    clearCart();
    addToCart(pendingSelection);
    setPendingSelection(null);
  };

  return (
    <div className="restaurant-detail-page food-detail-page">
      <main className="food-detail-main">
        <nav className="restaurant-detail-breadcrumb" aria-label="Đường dẫn">
          <Link href="/?home=1">Trang chủ</Link><span>/</span>
          <Link href="/restaurants">Nhà hàng</Link><span>/</span>
          <Link href={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link><span>/</span>
          <strong>{food.name}</strong>
        </nav>

        <Link className="food-detail-back" href={`/restaurants/${restaurant.slug}`}>
          <ArrowBackOutlinedIcon fontSize="small" /> Quay lại thực đơn
        </Link>

        <section className="food-detail-hero" aria-labelledby="food-detail-title">
          <div className="food-detail-hero__media">
            {food.image ? (
              <Image
                src={food.image}
                alt={food.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            ) : (
              <div className="restaurant-image-placeholder">
                <RestaurantMenuOutlinedIcon />
                <span>Món ăn chưa cập nhật hình ảnh</span>
              </div>
            )}
          </div>

          <div className="food-detail-hero__content">
            <div className="food-detail-tags">
              <Chip size="small" label={categoryLabel} />
              {food.isPopular ? <Chip size="small" color="warning" label="Bán chạy" /> : null}
              <Chip
                size="small"
                color={food.isAvailable ? "success" : "error"}
                label={food.isAvailable ? "Còn món" : "Tạm hết món"}
              />
            </div>
            <h1 id="food-detail-title">{food.name}</h1>
            <p className="food-detail-description">
              {food.description || "Nhà hàng đang cập nhật mô tả cho món ăn này."}
            </p>
            <strong className="food-detail-price">{formatCurrency(food.price)}</strong>

            <div className="food-detail-restaurant">
              <div>
                <span>Món của</span>
                <Link href={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
              </div>
              <span><StarOutlinedIcon fontSize="small" />{restaurant.rating}</span>
            </div>

            <div className="food-detail-service-row">
              <span><AccessTimeOutlinedIcon fontSize="small" />{restaurant.deliveryTime}</span>
              <span><LocalShippingOutlinedIcon fontSize="small" />{restaurant.deliveryFee}</span>
            </div>

            {!restaurant.isOpen ? (
              <Alert severity="warning">
                {restaurant.availabilityMessage || "Nhà hàng hiện chưa nhận đơn mới."}
              </Alert>
            ) : null}

            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartOutlinedIcon />}
              disabled={!canOrder}
              onClick={openOptions}
              className="food-detail-order-button"
            >
              {food.isAvailable ? "Chọn tùy chọn và thêm vào giỏ" : "Món đang tạm hết"}
            </Button>
          </div>
        </section>

        {(food.sizes?.length || food.toppingGroups?.length) ? (
          <section className="food-detail-options" aria-labelledby="food-options-title">
            <div className="restaurant-section-heading">
              <h2 id="food-options-title">Tùy chọn của món</h2>
              <span>Chọn khi thêm vào giỏ</span>
            </div>
            <div className="food-detail-option-grid">
              {food.sizes?.length ? (
                <article>
                  <h3>Kích cỡ</h3>
                  <ul>
                    {food.sizes.map((size) => (
                      <li key={size.id} className={!size.isAvailable ? "is-unavailable" : ""}>
                        <span>{size.name}</span><strong>{formatCurrency(size.price)}</strong>
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null}
              {food.toppingGroups?.map((group) => (
                <article key={group.id}>
                  <h3>{group.name}</h3>
                  <small>Chọn {group.minSelect}–{group.maxSelect} mục</small>
                  <ul>
                    {group.toppings.map((topping) => (
                      <li key={topping.id} className={!topping.isAvailable ? "is-unavailable" : ""}>
                        <span>{topping.name}</span>
                        <strong>{topping.price ? `+${formatCurrency(topping.price)}` : "Miễn phí"}</strong>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="restaurant-review-section food-review-section" aria-labelledby="food-reviews-title">
          <div className="restaurant-section-heading">
            <h2 id="food-reviews-title">Bình luận về món ăn</h2>
            <span>
              <StarOutlinedIcon fontSize="small" />
              {reviewData.ratingCount ? reviewData.ratingAverage.toFixed(1) : "Mới"}
              {reviewData.ratingCount ? ` · ${reviewData.ratingCount} đánh giá` : ""}
            </span>
          </div>
          <ReviewComposer
            targetType="food"
            targetId={food.id}
            targetName={food.name}
            restaurantSlug={restaurant.slug}
            isAuthenticated={isAuthenticated}
            eligibleOrders={reviewOrders}
          />
          {reviewData.reviews.length ? (
            <div className="restaurant-review-grid">
              {reviewData.reviews.map((review) => (
                <article className="restaurant-review-card" key={review.id}>
                  <header>
                    <span>{review.initial}</span>
                    <div><strong>{review.customerName}</strong><small>{formatReviewDate(review.createdAt)}</small></div>
                  </header>
                  <div className="restaurant-review-stars" aria-label={`${review.rating} sao`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarOutlinedIcon
                        key={index}
                        className={index < review.rating ? "is-filled" : ""}
                        fontSize="small"
                      />
                    ))}
                  </div>
                  <p>{review.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="restaurant-review-empty">
              Chưa có bình luận công khai cho món này.
            </div>
          )}
        </section>
      </main>

      <FoodOptionsModal
        open={optionsOpen}
        food={food}
        onClose={() => setOptionsOpen(false)}
        onConfirm={handleConfirm}
      />

      <Dialog open={Boolean(pendingSelection)} onClose={() => setPendingSelection(null)}>
        <DialogTitle>Bắt đầu giỏ hàng mới?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Giỏ hàng đang có món từ nhà hàng khác. Xóa giỏ hiện tại để thêm món từ {restaurant.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingSelection(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleReplaceCart}>
            Xóa giỏ và thêm món
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
