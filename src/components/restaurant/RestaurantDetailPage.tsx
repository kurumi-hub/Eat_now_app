"use client";

import {
  Clock,
  Home as HomeIcon,
  MapPin,
  Plus,
  Receipt,
  Star,
  Truck,
  UtensilsCrossed,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { PublicUser } from "@/types/auth";
import CustomerHeader from "@/components/home/CustomerHeader";
import FoodOptionsModal from "@/components/cart/FoodOptionsModal";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import Dialog, { DialogActions, DialogContent } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/Primitives";
import SnackbarToast from "@/components/ui/Snackbar";
import type {
  RestaurantDetail,
  RestaurantMenuItem,
} from "./restaurantDetailData";

type RestaurantDetailPageProps = {
  restaurant: RestaurantDetail;
  user: PublicUser | null;
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
  user,
}: RestaurantDetailPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(
    restaurant.menuCategories[0]?.id || ""
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore(
    (state) => state.hasConflictingRestaurant
  );
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedFood, setSelectedFood] = useState<RestaurantMenuItem | null>(
    null
  );
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);

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

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
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
      showPlaceholder("Nhà hàng hiện đang đóng cửa.");
      return;
    }

    if (!item.isAvailable) {
      showPlaceholder("Món này hiện chưa sẵn sàng để đặt.");
      return;
    }

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
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="restaurant-detail-main">
        <section className="restaurant-hero" aria-labelledby="restaurant-title">
          <div className="restaurant-hero__media">
            <Image
              src={restaurant.image}
              alt={`Món nổi bật tại ${restaurant.name}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 390px"
            />
          </div>

          <div className="restaurant-hero__body">
            <div>
              <div className="restaurant-hero__status-row">
                <span
                  className={[
                    "restaurant-status-chip",
                    restaurant.isOpen
                      ? "bg-[var(--brand-success)]/10 text-[var(--brand-success)]"
                      : "bg-[var(--brand-error)]/10 text-[var(--brand-error)]",
                  ].join(" ")}
                >
                  {restaurant.isOpen ? "Đang mở cửa" : "Đang đóng cửa"}
                </span>
                <span>Mở đến {restaurant.openUntil}</span>
              </div>
              <h1 id="restaurant-title">{restaurant.name}</h1>
              <div className="restaurant-meta-row">
                <span>
                  <Star className="inline h-3.5 w-3.5" />
                  <strong>{restaurant.rating}</strong>
                  <span>{restaurant.reviewCount}</span>
                </span>
                <span>
                  <MapPin className="inline h-3.5 w-3.5" />
                  {restaurant.address}
                </span>
              </div>
            </div>

            <div className="restaurant-service-row">
              <span>
                <Clock className="inline h-4 w-4" />
                {restaurant.deliveryTime}
              </span>
              <span>
                <Truck className="inline h-4 w-4" />
                {restaurant.deliveryFee}
              </span>
            </div>
          </div>
        </section>

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
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                        />
                        <IconButton
                          aria-label={`Thêm ${item.name}`}
                          className="restaurant-add-button"
                          onClick={() => handleAddItem(item)}
                          disabled={!restaurant.isOpen || !item.isAvailable}
                        >
                          <Plus className="h-4 w-4" />
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

      <footer className="home-footer">
        <div className="home-footer__inner">
          <Link className="home-footer__brand" href="/">
            EatNow
          </Link>
          <div className="home-footer__links">
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Trang giới thiệu sẽ được bổ sung sau.")
              }
            >
              Về chúng tôi
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Điều khoản sẽ được bổ sung sau.")
              }
            >
              Điều khoản
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Chính sách bảo mật sẽ được bổ sung sau.")
              }
            >
              Chính sách bảo mật
            </button>
            <button
              type="button"
              onClick={() => showPlaceholder("Liên hệ sẽ được bổ sung sau.")}
            >
              Liên hệ
            </button>
          </div>
          <p>© 2026 EatNow Food Delivery. Bản quyền thuộc về EatNow.</p>
        </div>
      </footer>

      <nav className="restaurant-bottom-nav" aria-label="Điều hướng nhanh">
        <button type="button" onClick={() => router.push("/")}>
          <HomeIcon />
          <span>Trang chủ</span>
        </button>
        <button className="is-active" type="button">
          <UtensilsCrossed />
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
          <Receipt />
          <span>Đơn hàng</span>
        </button>
        <button
          type="button"
          onClick={() =>
            showPlaceholder(
              "Trang công thức sẽ được triển khai ở sprint tiếp theo."
            )
          }
        >
          <BookOpen />
          <span>Công thức</span>
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
        title="Bắt đầu giỏ hàng mới?"
      >
        <DialogContent>
          <p className="text-sm text-[var(--brand-text-soft)]">
            Giỏ hàng của bạn đang có món từ một nhà hàng khác. Bạn chỉ có thể
            đặt món từ một nhà hàng trong mỗi đơn. Xoá giỏ hàng hiện tại để
            thêm món từ {restaurant.name}?
          </p>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleCancelReplaceCart}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            className="!bg-[var(--brand-error)] hover:!bg-[var(--brand-error)]/90"
            onClick={handleConfirmReplaceCart}
          >
            Xoá giỏ & thêm món mới
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarToast
        open={snackbar.open}
        message={snackbar.message}
        severity="info"
        autoHideDuration={2600}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
