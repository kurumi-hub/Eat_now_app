"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
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
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cartStore";
import type { RestaurantDetail, RestaurantMenuItem } from "./restaurantDetailData";

const FoodOptionsModal = dynamic(
  () => import("@/components/cart/FoodOptionsModal"),
  { ssr: false }
);

type RestaurantDetailPageProps = { restaurant: RestaurantDetail };
type SnackbarState = { open: boolean; message: string };
type CartSelection = {
  size?: { id: string; name: string; price: number };
  toppings: { id: string; name: string; price: number }[];
  note?: string;
  quantity: number;
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

export default function RestaurantDetailPage({ restaurant }: RestaurantDetailPageProps) {
  const [activeCategory, setActiveCategory] = useState(
    restaurant.menuCategories[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "" });
  const [selectedFood, setSelectedFood] = useState<RestaurantMenuItem | null>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [pendingConflictSelection, setPendingConflictSelection] = useState<{
    food: RestaurantMenuItem;
    selection: CartSelection;
  } | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore((state) => state.hasConflictingRestaurant);
  const clearCart = useCartStore((state) => state.clearCart);

  const visibleCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    if (!query) return restaurant.menuCategories;
    return restaurant.menuCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          item.name.toLocaleLowerCase("vi").includes(query) ||
          item.description.toLocaleLowerCase("vi").includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [restaurant.menuCategories, searchTerm]);

  const showNotice = (message: string) => setSnackbar({ open: true, message });

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddItem = (item: RestaurantMenuItem) => {
    if (!restaurant.isOpen) {
      showNotice(restaurant.availabilityMessage || "Nhà hàng hiện chưa nhận đơn.");
      return;
    }
    if (!item.isAvailable) {
      showNotice("Món này hiện chưa sẵn sàng để đặt.");
      return;
    }
    setSelectedFood(item);
    setOptionsModalOpen(true);
  };

  const addToCart = (food: RestaurantMenuItem, selection: CartSelection) => {
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
    setOptionsModalOpen(false);
    showNotice(`Đã thêm ${food.name} vào giỏ hàng.`);
  };

  const handleOptionsConfirm = (selection: CartSelection) => {
    if (!selectedFood) return;
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

  const closeSnackbar = () => setSnackbar((current) => ({ ...current, open: false }));

  return (
    <div className="restaurant-detail-page">
      <main className="restaurant-detail-main">
        <nav className="restaurant-detail-breadcrumb" aria-label="Đường dẫn">
          <Link href="/">Trang chủ</Link><span>/</span>
          <Link href="/restaurants">Nhà hàng</Link><span>/</span>
          <strong>{restaurant.name}</strong>
        </nav>

        <section className="restaurant-hero" aria-labelledby="restaurant-title">
          <div className="restaurant-hero__media">
            {restaurant.image ? (
              <Image
                src={restaurant.image}
                alt={`Ảnh nhà hàng ${restaurant.name}`}
                fill
                priority
                unoptimized
                sizes="(max-width: 760px) 100vw, 300px"
              />
            ) : (
              <div className="restaurant-image-placeholder">
                <RestaurantMenuOutlinedIcon />
                <span>Nhà hàng chưa cập nhật ảnh bìa</span>
              </div>
            )}
          </div>

          <div className="restaurant-hero__body">
            <div className="restaurant-hero__status-row">
              <Chip
                size="small"
                label={restaurant.availabilityLabel || (restaurant.isOpen ? "Đang nhận đơn" : "Chưa nhận đơn")}
                color={restaurant.isOpen ? "success" : "error"}
                className="restaurant-status-chip"
              />
              <span>
                {restaurant.isOpen && restaurant.openUntil
                  ? `Mở đến ${restaurant.openUntil.slice(0, 5)}`
                  : restaurant.availabilityMessage}
              </span>
            </div>
            <h1 id="restaurant-title">{restaurant.name}</h1>
            <div className="restaurant-rating-line">
              <StarOutlinedIcon fontSize="small" />
              <strong>{restaurant.rating}</strong>
              <span>({restaurant.reviewCount})</span>
            </div>
            <p className="restaurant-hero__address">
              <LocationOnOutlinedIcon fontSize="small" />{restaurant.address}
            </p>
            {restaurant.description ? (
              <p className="restaurant-hero__description">{restaurant.description}</p>
            ) : null}
            <div className="restaurant-service-row">
              <span><AccessTimeOutlinedIcon fontSize="small" />{restaurant.deliveryTime}</span>
              <span><LocalShippingOutlinedIcon fontSize="small" />{restaurant.deliveryFee}</span>
            </div>
          </div>
        </section>

        {!restaurant.isOpen ? (
          <Alert severity="warning" className="restaurant-availability-alert">
            {restaurant.availabilityMessage || "Nhà hàng hiện chưa thể nhận đơn mới."}
          </Alert>
        ) : null}

        {restaurant.restaurantVouchers?.length ? (
          <section className="restaurant-voucher-section" aria-labelledby="restaurant-vouchers-title">
            <div className="restaurant-section-heading">
              <h2 id="restaurant-vouchers-title">Ưu đãi của quán</h2>
              <Link href="/vouchers">Xem tất cả</Link>
            </div>
            <div className="restaurant-voucher-strip">
              {restaurant.restaurantVouchers.map((voucher) => (
                <article className="restaurant-voucher-card" key={voucher.id}>
                  <LocalOfferOutlinedIcon />
                  <div><strong>{voucher.title}</strong><span>{voucher.subtitle}</span><small>{voucher.code}</small></div>
                  <Link href="/vouchers">Xem mã</Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="restaurant-menu-tools" aria-label="Tìm và lọc món">
          <label className="restaurant-menu-search">
            <SearchOutlinedIcon fontSize="small" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm món trong nhà hàng"
            />
          </label>
          <nav className="restaurant-category-pills" aria-label="Danh mục món ăn">
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
        </section>

        <div className="restaurant-menu-column">
          {visibleCategories.map((category) => (
            <section key={category.id} id={category.id} className="restaurant-menu-section">
              <h2>{category.label}</h2>
              <div className="restaurant-menu-grid">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className={`restaurant-menu-card${!item.isAvailable ? " is-unavailable" : ""}`}
                  >
                    <div className="restaurant-menu-card__content">
                      <div className="restaurant-menu-card__title-row">
                        <h3>{item.name}</h3>
                        {item.isPopular ? <span className="restaurant-menu-card__badge">Bán chạy</span> : null}
                      </div>
                      <p>{item.description}</p>
                      <div className="restaurant-menu-card__footer">
                        <strong>{formatCurrency(item.price)}</strong>
                        {!item.isAvailable ? (
                          <span className="restaurant-menu-card__unavailable">Tạm hết món</span>
                        ) : (
                          <IconButton
                            aria-label={`Thêm ${item.name}`}
                            className="restaurant-add-button"
                            onClick={() => handleAddItem(item)}
                            disabled={!restaurant.isOpen}
                          >
                            <AddOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                    </div>
                    <div className="restaurant-menu-card__media">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill unoptimized sizes="120px" />
                      ) : (
                        <div className="restaurant-image-placeholder restaurant-image-placeholder--food">
                          <RestaurantMenuOutlinedIcon /><span>Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!visibleCategories.length ? (
            <div className="restaurant-menu-empty">
              <SearchOutlinedIcon />
              <h2>Không tìm thấy món phù hợp</h2>
              <p>Thử tìm bằng tên món hoặc mô tả khác.</p>
              <button type="button" onClick={() => setSearchTerm("")}>Xóa tìm kiếm</button>
            </div>
          ) : null}
        </div>

        {restaurant.restaurantReviews?.length ? (
          <section className="restaurant-review-section" aria-labelledby="restaurant-reviews-title">
            <div className="restaurant-section-heading">
              <h2 id="restaurant-reviews-title">Đánh giá từ khách hàng</h2>
              <span><StarOutlinedIcon fontSize="small" />{restaurant.rating}</span>
            </div>
            <div className="restaurant-review-grid">
              {restaurant.restaurantReviews.map((review) => (
                <article className="restaurant-review-card" key={review.id}>
                  <header><span>{review.initial}</span><div><strong>{review.customerName}</strong><small>{formatReviewDate(review.createdAt)}</small></div></header>
                  <div className="restaurant-review-stars" aria-label={`${review.rating} sao`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarOutlinedIcon key={index} className={index < review.rating ? "is-filled" : ""} fontSize="small" />
                    ))}
                  </div>
                  <p>{review.content}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="restaurant-info-section" aria-labelledby="restaurant-info-title">
          <h2 id="restaurant-info-title">Thông tin nhà hàng</h2>
          <div className="restaurant-info-grid">
            <article><LocationOnOutlinedIcon /><div><strong>Địa chỉ</strong><span>{restaurant.address}</span></div></article>
            <article><AccessTimeOutlinedIcon /><div><strong>Giờ hoạt động</strong><span>{restaurant.openUntil ? `Phục vụ đến ${restaurant.openUntil.slice(0, 5)}` : "Theo lịch của nhà hàng"}</span></div></article>
            <article><LocalShippingOutlinedIcon /><div><strong>Giao hàng</strong><span>{restaurant.deliveryTime} · {restaurant.deliveryFee}</span></div></article>
          </div>
        </section>
      </main>

      <nav className="restaurant-bottom-nav" aria-label="Điều hướng nhanh">
        <Link href="/"><HomeOutlinedIcon /><span>Trang chủ</span></Link>
        <Link className="is-active" href="/restaurants"><RestaurantMenuOutlinedIcon /><span>Khám phá</span></Link>
        <Link href="/orders"><ReceiptLongOutlinedIcon /><span>Đơn hàng</span></Link>
      </nav>

      <FoodOptionsModal
        open={optionsModalOpen}
        food={selectedFood}
        onClose={() => setOptionsModalOpen(false)}
        onConfirm={handleOptionsConfirm}
      />

      <Dialog open={Boolean(pendingConflictSelection)} onClose={() => setPendingConflictSelection(null)}>
        <DialogTitle>Bắt đầu giỏ hàng mới?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Giỏ hàng đang có món từ nhà hàng khác. Xóa giỏ hiện tại để thêm món từ {restaurant.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingConflictSelection(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReplaceCart}>Xóa giỏ và thêm món</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
