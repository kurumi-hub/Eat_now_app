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
import * as restaurantStyles from "./tailwindClasses";

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
    <div className={restaurantStyles.restaurantListPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={restaurantStyles.restaurantListMainClassName}>
        <section
          className={restaurantStyles.restaurantListIntroClassName}
          aria-labelledby="restaurants-title"
        >
          <nav
            className={restaurantStyles.restaurantListBreadcrumbClassName}
            aria-label="Đường dẫn"
          >
            <Link href="/">Trang chủ</Link>
            <ChevronRightOutlinedIcon fontSize="small" />
            <span>Nhà hàng</span>
          </nav>

          <h1
            id="restaurants-title"
            className={restaurantStyles.restaurantListTitleClassName}
          >
            Khám phá Nhà hàng
          </h1>
          <p className={restaurantStyles.restaurantListIntroTextClassName}>
            Tìm thấy{" "}
            <strong className={restaurantStyles.restaurantListCountClassName}>
              {filteredRestaurants.length.toLocaleString("vi-VN")}
            </strong>{" "}
            nhà hàng gần bạn
          </p>

          <div className={restaurantStyles.restaurantCategorySectionClassName}>
            <h2 className={restaurantStyles.restaurantCategoryTitleClassName}>
              Danh mục phổ biến
            </h2>
            <div className={restaurantStyles.restaurantCategoryRailClassName}>
              {restaurantCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={restaurantStyles.restaurantListCategoryButtonClassName(
                      isActive
                    )}
                    data-active={isActive}
                    aria-pressed={isActive}
                    onClick={() => toggleCategoryFilter(category.id)}
                  >
                    <span
                      className={restaurantStyles.restaurantCategoryIconClassName}
                    >
                      <Icon />
                    </span>
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className={restaurantStyles.restaurantListFilterPanelClassName}
          aria-label="Bộ lọc nhà hàng"
        >
          <div className={restaurantStyles.restaurantListFilterChipsClassName}>
            <button
              type="button"
              className={restaurantStyles.restaurantFilterChipClassName(
                hasActiveFilters,
                true
              )}
              data-active={hasActiveFilters}
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
            <span
              className={restaurantStyles.restaurantFilterDividerClassName}
            />
            {restaurantQuickFilters.map((filter) => {
              const Icon =
                filter.id === "promotion" ? LocalOfferOutlinedIcon : null;
              const isActive = activeFilterIds.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={restaurantStyles.restaurantFilterChipClassName(
                    isActive
                  )}
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => toggleRestaurantFilter(filter.id)}
                >
                  {Icon ? <Icon fontSize="small" /> : null}
                  {filter.label}
                </button>
              );
            })}
          </div>

          <label className={restaurantStyles.restaurantSortControlClassName}>
            <span>Sắp xếp:</span>
            <select
              className={restaurantStyles.restaurantSortSelectClassName}
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

        <section
          className={restaurantStyles.restaurantResultsSectionClassName}
          aria-labelledby="restaurant-results-title"
        >
          <div className={restaurantStyles.restaurantResultsHeadingClassName}>
            <h2
              id="restaurant-results-title"
              className={restaurantStyles.restaurantResultsTitleClassName}
            >
              Nhà hàng phù hợp với bạn
            </h2>
            <span className={restaurantStyles.restaurantResultsCountClassName}>
              {filteredRestaurants.length.toLocaleString("vi-VN")} kết quả
            </span>
          </div>

          {filteredRestaurants.length > 0 ? (
            <>
              <div className={restaurantStyles.restaurantListGridClassName}>
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

              <div className={restaurantStyles.restaurantListMoreRowClassName}>
                <button
                  type="button"
                  className={restaurantStyles.restaurantListMoreButtonClassName}
                  onClick={() =>
                    showPlaceholder("EatNow sẽ tải thêm nhà hàng ở bước tiếp theo.")
                  }
                >
                  Xem thêm nhà hàng
                </button>
              </div>
            </>
          ) : (
            <div className={restaurantStyles.restaurantListEmptyClassName}>
              <TuneOutlinedIcon
                className={restaurantStyles.restaurantListEmptyIconClassName}
              />
              <h3 className={restaurantStyles.restaurantListEmptyTitleClassName}>
                Không tìm thấy nhà hàng phù hợp
              </h3>
              <p className={restaurantStyles.restaurantListEmptyTextClassName}>
                Thử bỏ bớt bộ lọc hoặc chọn danh mục khác.
              </p>
              <button
                type="button"
                className={restaurantStyles.restaurantListEmptyButtonClassName}
                onClick={clearRestaurantFilters}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>
      </main>

      <CustomerFooter onPlaceholder={showPlaceholder} />

      <nav
        className={restaurantStyles.restaurantListBottomNavClassName}
        aria-label="Điều hướng nhanh"
      >
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() => router.push("/")}
        >
          <HomeOutlinedIcon />
          <span>Trang chủ</span>
        </button>
        <button
          className={restaurantStyles.restaurantBottomNavButtonClassName(true)}
          type="button"
        >
          <ExploreOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() => router.push("/orders")}
        >
          <ReceiptLongOutlinedIcon />
          <span>Đơn hàng</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() =>
            showPlaceholder("Công thức sẽ được hoàn thiện ở bước tiếp theo.")
          }
        >
          <MenuBookOutlinedIcon />
          <span>Công thức</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
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
    <article className={restaurantStyles.restaurantListCardClassName}>
      {restaurant.detailAvailable ? (
        <Link
          className={restaurantStyles.restaurantListCardHitareaClassName}
          href={`/restaurants/${restaurant.slug}`}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={restaurantStyles.restaurantListCardHitareaClassName}
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
      <div className={restaurantStyles.restaurantListCardMediaClassName}>
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className={restaurantStyles.restaurantListCardImageClassName}
          loading={imagePriority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1180px) 33vw, 25vw"
        />
        {restaurant.tag ? (
          <span
            className={restaurantStyles.restaurantListTagClassName(
              restaurant.tagTone
            )}
          >
            {restaurant.tag}
          </span>
        ) : null}
        <span
          className={restaurantStyles.restaurantListFavoriteClassName}
          aria-hidden="true"
        >
          <FavoriteBorderOutlinedIcon fontSize="small" />
        </span>
      </div>

      <div className={restaurantStyles.restaurantListCardBodyClassName}>
        <h3 className={restaurantStyles.restaurantListCardTitleClassName}>
          {restaurant.name}
        </h3>
        <div className={restaurantStyles.restaurantListCardRatingClassName}>
          <StarOutlinedIcon
            className={restaurantStyles.restaurantRatingIconClassName}
            fontSize="inherit"
          />
          <strong>{restaurant.rating}</strong>
          <span>({restaurant.reviewCount})</span>
          <span aria-hidden="true">·</span>
          <span className={restaurantStyles.restaurantListCuisineClassName}>
            {restaurant.cuisine}
          </span>
        </div>

        <div className={restaurantStyles.restaurantListCardMetaClassName}>
          <span className={restaurantStyles.restaurantListMetaItemClassName}>
            <ScheduleOutlinedIcon fontSize="inherit" />
            {restaurant.deliveryTime}
          </span>
          <span className={restaurantStyles.restaurantListMetaItemClassName}>
            <LocationOnOutlinedIcon fontSize="inherit" />
            {restaurant.distance}
          </span>
        </div>

        <strong className={restaurantStyles.restaurantListFeeClassName}>
          {restaurant.deliveryFee}
        </strong>
        <p className={restaurantStyles.restaurantListStatusClassName}>
          <span
            className={restaurantStyles.restaurantListStatusDotClassName}
            aria-hidden="true"
          />
          {restaurant.status}
          {restaurant.closesAt ? ` · Đóng cửa ${restaurant.closesAt}` : ""}
        </p>
      </div>
    </>
  );
}
