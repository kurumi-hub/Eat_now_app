"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Alert, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import {
  filterRestaurantListItems,
  restaurantCategories,
  restaurantListItems,
  restaurantQuickFilters,
  restaurantSortOptions,
  sortRestaurantListItems,
  type RestaurantFilterId,
  type RestaurantListItem,
  type RestaurantSortId,
} from "./restaurantPageData";

type RestaurantsPageProps = {
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

export default function RestaurantsPage({
  user,
  deliveryLocationLabel,
}: RestaurantsPageProps) {
  const router = useRouter();
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [activeFilterIds, setActiveFilterIds] = useState<RestaurantFilterId[]>([]);
  const [sort, setSort] = useState<RestaurantSortId>("recommended");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });
  const filteredRestaurants = useMemo(
    () =>
      sortRestaurantListItems(
        filterRestaurantListItems(restaurantListItems, {
          categoryId: activeCategoryId,
          filterIds: activeFilterIds,
        }),
        sort
      ),
    [activeCategoryId, activeFilterIds, sort]
  );
  const hasActiveFilters = Boolean(activeCategoryId || activeFilterIds.length);

  const showPlaceholder = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setActiveCategoryId((currentCategoryId) =>
      currentCategoryId === categoryId ? "" : categoryId
    );
  };

  const toggleRestaurantFilter = (filterId: RestaurantFilterId) => {
    setActiveFilterIds((currentFilterIds) =>
      currentFilterIds.includes(filterId)
        ? currentFilterIds.filter((id) => id !== filterId)
        : [...currentFilterIds, filterId]
    );
  };

  const clearRestaurantFilters = () => {
    setActiveCategoryId("");
    setActiveFilterIds([]);
  };

  return (
    <div className="restaurant-list-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className="restaurant-list-main">
        <section className="restaurant-list-intro" aria-labelledby="restaurants-title">
          <nav className="restaurant-list-breadcrumb" aria-label="Đường dẫn">
            <Link href="/">Trang chủ</Link>
            <ChevronRightOutlinedIcon fontSize="small" />
            <span>Nhà hàng</span>
          </nav>

          <h1 id="restaurants-title">Khám phá Nhà hàng</h1>
          <p>
            Tìm thấy{" "}
            <strong>{filteredRestaurants.length.toLocaleString("vi-VN")}</strong>{" "}
            nhà hàng gần bạn
          </p>

          <div className="restaurant-category-section">
            <h2>Danh mục phổ biến</h2>
            <div className="restaurant-category-rail">
              {restaurantCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={activeCategoryId === category.id ? "is-active" : ""}
                    aria-pressed={activeCategoryId === category.id}
                    onClick={() => toggleCategoryFilter(category.id)}
                  >
                    <span className="restaurant-category-rail__icon">
                      <Icon />
                    </span>
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="restaurant-list-filter-panel" aria-label="Bộ lọc nhà hàng">
          <div className="restaurant-list-filter-panel__chips">
            <button
              type="button"
              className={`restaurant-filter-chip restaurant-filter-chip--control${
                hasActiveFilters ? " is-active" : ""
              }`}
              onClick={clearRestaurantFilters}
              aria-label={
                hasActiveFilters
                  ? "Xóa tất cả bộ lọc nhà hàng"
                  : "Bộ lọc nhà hàng"
              }
            >
              <TuneOutlinedIcon fontSize="small" />
              Bộ lọc
            </button>
            <span className="restaurant-filter-divider" />
            {restaurantQuickFilters.map((filter) => {
              const Icon =
                filter.id === "promotion" ? LocalOfferOutlinedIcon : null;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`restaurant-filter-chip${
                    activeFilterIds.includes(filter.id) ? " is-active" : ""
                  }`}
                  aria-pressed={activeFilterIds.includes(filter.id)}
                  onClick={() => toggleRestaurantFilter(filter.id)}
                >
                  {Icon ? <Icon fontSize="small" /> : null}
                  {filter.label}
                </button>
              );
            })}
          </div>

          <label className="restaurant-sort-control">
            <span>Sắp xếp:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as RestaurantSortId)}
              aria-label="Sắp xếp nhà hàng"
            >
              {restaurantSortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="restaurant-results-section" aria-labelledby="restaurant-results-title">
          <div className="restaurant-results-heading">
            <h2 id="restaurant-results-title">Nhà hàng phù hợp với bạn</h2>
            <span>{filteredRestaurants.length.toLocaleString("vi-VN")} kết quả</span>
          </div>

          {filteredRestaurants.length > 0 ? (
            <>
              <div className="restaurant-list-grid">
                {filteredRestaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.slug}
                    restaurant={restaurant}
                    imagePriority={index === 0}
                    onUnavailableClick={() =>
                      showPlaceholder(
                        "Trang chi tiết cho nhà hàng này sẽ được bổ sung sau."
                      )
                    }
                  />
                ))}
              </div>

              <div className="restaurant-list-more-row">
                <button
                  type="button"
                  onClick={() =>
                    showPlaceholder("EatNow sẽ tải thêm nhà hàng ở bước tiếp theo.")
                  }
                >
                  Xem thêm nhà hàng
                </button>
              </div>
            </>
          ) : (
            <div className="restaurant-list-empty-state">
              <TuneOutlinedIcon />
              <h3>Không tìm thấy nhà hàng phù hợp</h3>
              <p>Thử bỏ bớt bộ lọc hoặc chọn danh mục khác.</p>
              <button type="button" onClick={clearRestaurantFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>
      </main>

      <CustomerFooter onPlaceholder={showPlaceholder} />

      <nav className="restaurant-list-bottom-nav" aria-label="Điều hướng nhanh">
        <button type="button" onClick={() => router.push("/")}>
          <HomeOutlinedIcon />
          <span>Trang chủ</span>
        </button>
        <button className="is-active" type="button">
          <ExploreOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button type="button" onClick={() => router.push("/orders")}>
          <ReceiptLongOutlinedIcon />
          <span>Đơn hàng</span>
        </button>
        <button
          type="button"
          onClick={() =>
            showPlaceholder("Công thức sẽ được hoàn thiện ở bước tiếp theo.")
          }
        >
          <MenuBookOutlinedIcon />
          <span>Công thức</span>
        </button>
        <button
          type="button"
          onClick={() => router.push(user ? "/account/profile" : "/login")}
        >
          <AccountCircleOutlinedIcon />
          <span>Tài khoản</span>
        </button>
      </nav>

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

type RestaurantCardProps = {
  restaurant: RestaurantListItem;
  imagePriority?: boolean;
  onUnavailableClick: () => void;
};

function RestaurantCard({
  restaurant,
  imagePriority = false,
  onUnavailableClick,
}: RestaurantCardProps) {
  const content = (
    <RestaurantCardContent
      restaurant={restaurant}
      imagePriority={imagePriority}
    />
  );

  return (
    <article className="restaurant-list-card">
      {restaurant.detailAvailable ? (
        <Link
          className="restaurant-list-card__hitarea"
          href={`/restaurants/${restaurant.slug}`}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className="restaurant-list-card__hitarea"
          onClick={onUnavailableClick}
        >
          {content}
        </button>
      )}
    </article>
  );
}

function RestaurantCardContent({
  restaurant,
  imagePriority,
}: {
  restaurant: RestaurantListItem;
  imagePriority: boolean;
}) {
  return (
    <>
      <div className="restaurant-list-card__media">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          loading={imagePriority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1180px) 33vw, 25vw"
        />
        {restaurant.tag ? (
          <span className={`restaurant-list-tag is-${restaurant.tagTone || "deal"}`}>
            {restaurant.tag}
          </span>
        ) : null}
        <span className="restaurant-list-favorite" aria-hidden="true">
          <FavoriteBorderOutlinedIcon fontSize="small" />
        </span>
      </div>

      <div className="restaurant-list-card__body">
        <h3>{restaurant.name}</h3>
        <div className="restaurant-list-card__rating">
          <StarOutlinedIcon fontSize="inherit" />
          <strong>{restaurant.rating}</strong>
          <span>({restaurant.reviewCount})</span>
          <span aria-hidden="true">·</span>
          <span>{restaurant.cuisine}</span>
        </div>

        <div className="restaurant-list-card__meta">
          <span>
            <ScheduleOutlinedIcon fontSize="inherit" />
            {restaurant.deliveryTime}
          </span>
          <span>
            <LocationOnOutlinedIcon fontSize="inherit" />
            {restaurant.distance}
          </span>
        </div>

        <strong className="restaurant-list-card__fee">
          {restaurant.deliveryFee}
        </strong>
        <p className="restaurant-list-card__status">
          <span aria-hidden="true" />
          {restaurant.status}
          {restaurant.closesAt ? ` · Đóng cửa ${restaurant.closesAt}` : ""}
        </p>
      </div>
    </>
  );
}
