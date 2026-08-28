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
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { claimVoucherAction } from "@/app/vouchers/actions";
import { useCartStore } from "@/store/cartStore";
import ReviewComposer from "./ReviewComposer";
import type { ReviewEligibleOrder } from "./reviewData";
import type { RestaurantDetail, RestaurantMenuItem } from "./restaurantDetailData";

const FoodOptionsModal = dynamic(
  () => import("@/components/cart/FoodOptionsModal"),
  { ssr: false }
);

type RestaurantDetailPageProps = {
  restaurant: RestaurantDetail;
  isAuthenticated: boolean;
  reviewOrders: ReviewEligibleOrder[];
};
type SnackbarState = { open: boolean; message: string; error: boolean };
type CartSelection = {
  size?: { id: string; name: string; price: number };
  toppings: { id: string; name: string; price: number }[];
  note?: string;
  quantity: number;
};

const FOOD_PAGE_SIZE = 10;

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

export default function RestaurantDetailPage({
  restaurant,
  isAuthenticated,
  reviewOrders,
}: RestaurantDetailPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [foodPage, setFoodPage] = useState(1);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [claimingVoucherId, setClaimingVoucherId] = useState("");
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());
  const [isClaimPending, startVoucherClaim] = useTransition();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    error: false,
  });
  const [selectedFood, setSelectedFood] = useState<RestaurantMenuItem | null>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [pendingConflictSelection, setPendingConflictSelection] = useState<{
    food: RestaurantMenuItem;
    selection: CartSelection;
  } | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore((state) => state.hasConflictingRestaurant);
  const clearCart = useCartStore((state) => state.clearCart);

  const allMenuItems = useMemo(() => restaurant.menuCategories.flatMap((category) =>
    category.items.map((item) => ({
      item,
      categoryId: category.id,
      categoryLabel: category.label,
    }))
  ), [restaurant.menuCategories]);

  const filteredMenuItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    return allMenuItems.filter(({ item, categoryId }) => {
      const inCategory = activeCategory === "all" || categoryId === activeCategory;
      const matchesSearch = !query ||
        item.name.toLocaleLowerCase("vi").includes(query) ||
        item.description.toLocaleLowerCase("vi").includes(query);
      return inCategory && matchesSearch;
    });
  }, [activeCategory, allMenuItems, searchTerm]);

  const foodPageCount = Math.max(1, Math.ceil(filteredMenuItems.length / FOOD_PAGE_SIZE));
  const currentFoodPage = Math.min(foodPage, foodPageCount);
  const paginatedMenuItems = filteredMenuItems.slice(
    (currentFoodPage - 1) * FOOD_PAGE_SIZE,
    currentFoodPage * FOOD_PAGE_SIZE
  );
  const activeCategoryLabel = activeCategory === "all"
    ? "Tất cả món ăn"
    : restaurant.menuCategories.find((category) => category.id === activeCategory)?.label || "Món ăn";

  const showNotice = (message: string, error = false) => {
    setSnackbar({ open: true, message, error });
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setFoodPage(1);
    document.getElementById("restaurant-menu-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFoodPage(1);
  };

  const handleFoodPageChange = (page: number) => {
    setFoodPage(Math.min(Math.max(page, 1), foodPageCount));
    document.getElementById("restaurant-menu-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleClaimVoucher = (voucherId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/restaurants/${restaurant.slug}`)}`);
      return;
    }
    if (savedVoucherIds.has(voucherId)) return;
    setClaimingVoucherId(voucherId);
    startVoucherClaim(async () => {
      const result = await claimVoucherAction(voucherId);
      setClaimingVoucherId("");
      showNotice(result.message, !result.ok);
      if (result.ok) {
        setSavedVoucherIds((current) => new Set(current).add(voucherId));
        router.refresh();
      }
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
              <button type="button" onClick={() => setVoucherDialogOpen(true)}>
                Xem tất cả
              </button>
            </div>
            <div className="restaurant-voucher-strip">
              {restaurant.restaurantVouchers.slice(0, 3).map((voucher) => (
                <article className="restaurant-voucher-card" key={voucher.id}>
                  <LocalOfferOutlinedIcon />
                  <div><strong>{voucher.title}</strong><span>{voucher.subtitle}</span><small>{voucher.code}</small></div>
                  <button type="button" onClick={() => setVoucherDialogOpen(true)}>Xem mã</button>
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
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm món trong nhà hàng"
            />
          </label>
          <nav className="restaurant-category-pills" aria-label="Danh mục món ăn">
            <button
              type="button"
              className={activeCategory === "all" ? "is-active" : ""}
              onClick={() => handleCategoryClick("all")}
            >
              Tất cả
            </button>
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

        <div className="restaurant-menu-column" id="restaurant-menu-list">
          {paginatedMenuItems.length ? (
            <section className="restaurant-menu-section">
              <div className="restaurant-menu-section__heading">
                <h2>{activeCategoryLabel}</h2>
                <span>{filteredMenuItems.length} món</span>
              </div>
              <div className="restaurant-menu-grid">
                {paginatedMenuItems.map(({ item, categoryLabel }) => (
                  <article
                    key={item.id}
                    className={`restaurant-menu-card${!item.isAvailable ? " is-unavailable" : ""}`}
                  >
                    <Link
                      className="restaurant-menu-card__main"
                      href={`/restaurants/${restaurant.slug}/foods/${item.id}`}
                      aria-label={`Xem chi tiết ${item.name}`}
                    >
                      <div className="restaurant-menu-card__media">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill unoptimized sizes="120px" />
                        ) : (
                          <div className="restaurant-image-placeholder restaurant-image-placeholder--food">
                            <RestaurantMenuOutlinedIcon /><span>Chưa có ảnh</span>
                          </div>
                        )}
                      </div>
                      <div className="restaurant-menu-card__content">
                        <span className="restaurant-menu-card__category">{categoryLabel}</span>
                        <div className="restaurant-menu-card__title-row">
                          <h3>{item.name}</h3>
                          {item.isPopular ? <span className="restaurant-menu-card__badge">Bán chạy</span> : null}
                        </div>
                        <p>{item.description}</p>
                        <div className="restaurant-menu-card__footer">
                          <strong>{formatCurrency(item.price)}</strong>
                          {!item.isAvailable ? (
                            <span className="restaurant-menu-card__unavailable">Tạm hết món</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                    {item.isAvailable ? (
                      <IconButton
                        type="button"
                        aria-label={`Thêm ${item.name}`}
                        className="restaurant-add-button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleAddItem(item);
                        }}
                        disabled={!restaurant.isOpen}
                      >
                        <AddOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </article>
                ))}
              </div>
              {foodPageCount > 1 ? (
                <nav className="restaurant-menu-pagination" aria-label="Phân trang món ăn">
                  <button
                    type="button"
                    disabled={currentFoodPage === 1}
                    onClick={() => handleFoodPageChange(currentFoodPage - 1)}
                  >
                    Trước
                  </button>
                  {Array.from({ length: foodPageCount }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === currentFoodPage ? "is-active" : ""}
                      aria-current={page === currentFoodPage ? "page" : undefined}
                      onClick={() => handleFoodPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentFoodPage === foodPageCount}
                    onClick={() => handleFoodPageChange(currentFoodPage + 1)}
                  >
                    Sau
                  </button>
                </nav>
              ) : null}
            </section>
          ) : (
            <div className="restaurant-menu-empty">
              <SearchOutlinedIcon />
              <h2>Không tìm thấy món phù hợp</h2>
              <p>Thử tìm bằng tên món hoặc mô tả khác.</p>
              <button type="button" onClick={() => handleSearchChange("")}>Xóa tìm kiếm</button>
            </div>
          )}
        </div>

        <section className="restaurant-review-section" aria-labelledby="restaurant-reviews-title">
          <div className="restaurant-section-heading">
            <h2 id="restaurant-reviews-title">Bình luận về nhà hàng</h2>
            <span><StarOutlinedIcon fontSize="small" />{restaurant.rating}</span>
          </div>
          <ReviewComposer
            targetType="restaurant"
            targetId={restaurant.id}
            targetName={restaurant.name}
            restaurantSlug={restaurant.slug}
            isAuthenticated={isAuthenticated}
            eligibleOrders={reviewOrders}
          />
          {restaurant.restaurantReviews?.length ? (
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
          ) : (
            <div className="restaurant-review-empty">
              Chưa có bình luận công khai. Hãy là khách hàng đầu tiên chia sẻ trải nghiệm.
            </div>
          )}
        </section>

      </main>

      <nav className="restaurant-bottom-nav" aria-label="Điều hướng nhanh">
        <Link href="/"><HomeOutlinedIcon /><span>Trang chủ</span></Link>
        <Link className="is-active" href="/restaurants"><RestaurantMenuOutlinedIcon /><span>Khám phá</span></Link>
        <Link href="/orders"><ReceiptLongOutlinedIcon /><span>Đơn hàng</span></Link>
      </nav>

      <Dialog
        open={voucherDialogOpen}
        onClose={() => setVoucherDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ưu đãi của {restaurant.name}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText className="restaurant-voucher-dialog__intro">
            Lưu voucher cần nhận vào kho để dùng khi thanh toán. Voucher tự động
            sẽ được hệ thống kiểm tra trực tiếp trên đơn hàng.
          </DialogContentText>
          <div className="restaurant-voucher-dialog__list">
            {restaurant.restaurantVouchers?.map((voucher) => {
              const isSaved = savedVoucherIds.has(voucher.id);
              const isClaiming = isClaimPending && claimingVoucherId === voucher.id;
              const canClaim = voucher.distributionMode === "claim";
              return (
                <article className="restaurant-voucher-dialog__card" key={voucher.id}>
                  <div className="restaurant-voucher-dialog__icon"><LocalOfferOutlinedIcon /></div>
                  <div className="restaurant-voucher-dialog__body">
                    <span>{canClaim ? "Voucher cần lưu" : "Tự động áp dụng"}</span>
                    <strong>{voucher.title}</strong>
                    <p>{voucher.subtitle}</p>
                    <small>
                      Mã {voucher.code} · HSD {new Date(voucher.expiredAt).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  {canClaim ? (
                    <button
                      type="button"
                      disabled={isSaved || isClaiming}
                      onClick={() => handleClaimVoucher(voucher.id)}
                    >
                      {isSaved
                        ? "Đã lưu"
                        : isClaiming
                          ? "Đang lưu..."
                          : isAuthenticated
                            ? "Lưu vào kho"
                            : "Đăng nhập để lưu"}
                    </button>
                  ) : (
                    <span className="restaurant-voucher-dialog__automatic">Sẵn sàng dùng</span>
                  )}
                </article>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoucherDialogOpen(false)}>Đóng</Button>
          <Button component={Link} href="/vouchers" variant="outlined">
            Mở kho voucher
          </Button>
        </DialogActions>
      </Dialog>

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
        <Alert severity={snackbar.error ? "error" : "info"} variant="filled" onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
