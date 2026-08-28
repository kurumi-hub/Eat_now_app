"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import RiceBowlOutlinedIcon from "@mui/icons-material/RiceBowlOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { PublicUser } from "@/types/auth";
import {
  distanceKm,
  estimatedDeliveryMinutes,
  estimatedShippingFee,
  restaurantQuickFilters,
  restaurantSortOptions,
  type RestaurantDirectory,
  type RestaurantFilterId,
  type RestaurantListCategory,
  type RestaurantListItem,
  type RestaurantSortId,
  type ViewerLocation,
} from "./restaurantPageData";

type RestaurantsPageProps = {
  data: RestaurantDirectory;
  user: PublicUser | null;
  initialLocation: ViewerLocation | null;
  initialCategoryId?: string;
  initialSearch?: string;
};

const PAGE_SIZE = 12;

function iconForCategory(category: RestaurantListCategory): SvgIconComponent {
  const label = category.label.toLocaleLowerCase("vi");
  if (label.includes("phở") || label.includes("mì")) return RamenDiningOutlinedIcon;
  if (label.includes("bánh")) return BakeryDiningOutlinedIcon;
  if (label.includes("cơm")) return RiceBowlOutlinedIcon;
  if (label.includes("bún") || label.includes("canh")) return SoupKitchenOutlinedIcon;
  if (label.includes("uống") || label.includes("trà") || label.includes("cà phê")) {
    return LocalCafeOutlinedIcon;
  }
  if (label.includes("ăn vặt") || label.includes("nhanh")) return FastfoodOutlinedIcon;
  return RestaurantMenuOutlinedIcon;
}

function formatReviewCount(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return count > 0 ? `${count}+` : "Mới";
}

function requestBrowserLocation() {
  return new Promise<ViewerLocation>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
      () => reject(new Error("Không thể lấy vị trí. Hãy cấp quyền định vị cho trình duyệt.")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export default function RestaurantsPage({
  data,
  user,
  initialLocation,
  initialCategoryId = "",
  initialSearch = "",
}: RestaurantsPageProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [activeFilterIds, setActiveFilterIds] = useState<RestaurantFilterId[]>([]);
  const [sort, setSort] = useState<RestaurantSortId>("recommended");
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState<ViewerLocation | null>(initialLocation);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [notice, setNotice] = useState("");

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    const items = data.items.filter((restaurant) => {
      const distance = distanceKm(location, restaurant);
      const matchesSearch = !normalizedSearch ||
        restaurant.name.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        restaurant.address.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        restaurant.categoryLabels.some((label) =>
          label.toLocaleLowerCase("vi").includes(normalizedSearch)
        );
      const matchesCategory = !activeCategoryId ||
        restaurant.categoryIds.includes(activeCategoryId);
      const matchesFilters = activeFilterIds.every((filterId) => {
        if (filterId === "open") return restaurant.orderState === "OPEN";
        if (filterId === "freeship") return restaurant.hasFreeship;
        if (filterId === "promotion") return restaurant.hasPromotion;
        return distance !== null && distance <= 3;
      });
      return matchesSearch && matchesCategory && matchesFilters;
    });

    return [...items].sort((left, right) => {
      if (sort === "rating") {
        return right.rating - left.rating || right.reviewCount - left.reviewCount;
      }
      if (sort === "nearest") {
        return (distanceKm(location, left) ?? Number.POSITIVE_INFINITY) -
          (distanceKm(location, right) ?? Number.POSITIVE_INFINITY);
      }
      return right.rating - left.rating || right.reviewCount - left.reviewCount;
    });
  }, [activeCategoryId, activeFilterIds, data.items, location, search, sort]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [activeCategoryId, activeFilterIds, search, sort]);

  const ensureLocation = async () => {
    if (location) return location;
    try {
      const nextLocation = await requestBrowserLocation();
      setLocation(nextLocation);
      return nextLocation;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể lấy vị trí hiện tại.");
      return null;
    }
  };

  const toggleQuickFilter = async (filterId: RestaurantFilterId) => {
    if (filterId === "nearby" && !activeFilterIds.includes(filterId)) {
      const nextLocation = await ensureLocation();
      if (!nextLocation) return;
    }
    setActiveFilterIds((current) =>
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId]
    );
  };

  const changeSort = async (nextSort: RestaurantSortId) => {
    if (nextSort === "nearest" && !(await ensureLocation())) return;
    setSort(nextSort);
  };

  const clearFilters = () => {
    setActiveCategoryId("");
    setActiveFilterIds([]);
    setSearch("");
  };

  const visibleRestaurants = filteredRestaurants.slice(0, visibleCount);
  const hasActiveFilters = Boolean(
    activeCategoryId || activeFilterIds.length || search.trim()
  );

  return (
    <div className="restaurant-list-page">
      <main className="restaurant-list-main">
        <section className="restaurant-list-intro" aria-labelledby="restaurants-title">
          <nav className="restaurant-list-breadcrumb" aria-label="Đường dẫn">
            <Link href="/">Trang chủ</Link>
            <ChevronRightOutlinedIcon fontSize="small" />
            <span>Nhà hàng</span>
          </nav>

          <div className="restaurant-list-title-row">
            <div>
              <h1 id="restaurants-title">Khám phá nhà hàng</h1>
              <p>
                Tìm thấy <strong>{filteredRestaurants.length.toLocaleString("vi-VN")}</strong>{" "}
                nhà hàng phù hợp
              </p>
            </div>
            <label className="restaurant-list-search">
              <SearchOutlinedIcon fontSize="small" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm nhà hàng hoặc món ăn"
              />
            </label>
          </div>

          {data.categories.length ? (
            <div className="restaurant-category-section">
              <h2>Danh mục phổ biến</h2>
              <div className="restaurant-category-rail">
                {data.categories.map((category) => {
                  const Icon = iconForCategory(category);
                  const active = category.id === activeCategoryId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={active ? "is-active" : ""}
                      aria-pressed={active}
                      onClick={() => setActiveCategoryId(active ? "" : category.id)}
                    >
                      <span className="restaurant-category-rail__icon"><Icon /></span>
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="restaurant-list-filter-panel" aria-label="Bộ lọc nhà hàng">
          <div className="restaurant-list-filter-panel__chips">
            <button
              type="button"
              className={`restaurant-filter-chip restaurant-filter-chip--control${hasActiveFilters ? " is-active" : ""}`}
              onClick={clearFilters}
            >
              <TuneOutlinedIcon fontSize="small" />
              {hasActiveFilters ? "Xóa lọc" : "Bộ lọc"}
            </button>
            <span className="restaurant-filter-divider" />
            {restaurantQuickFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`restaurant-filter-chip${activeFilterIds.includes(filter.id) ? " is-active" : ""}`}
                aria-pressed={activeFilterIds.includes(filter.id)}
                onClick={() => void toggleQuickFilter(filter.id)}
              >
                {filter.id === "promotion" ? <LocalOfferOutlinedIcon fontSize="small" /> : null}
                {filter.label}
              </button>
            ))}
          </div>

          <label className="restaurant-sort-control">
            <span>Sắp xếp:</span>
            <select
              value={sort}
              onChange={(event) => void changeSort(event.target.value as RestaurantSortId)}
            >
              {restaurantSortOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="restaurant-results-section" aria-labelledby="restaurant-results-title">
          <div className="restaurant-results-heading">
            <h2 id="restaurant-results-title">Nhà hàng phù hợp với bạn</h2>
            <span>{filteredRestaurants.length.toLocaleString("vi-VN")} kết quả</span>
          </div>

          {visibleRestaurants.length ? (
            <>
              <div className="restaurant-list-grid">
                {visibleRestaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    location={location}
                    priority={index < 4}
                  />
                ))}
              </div>
              {visibleCount < filteredRestaurants.length ? (
                <div className="restaurant-list-more-row">
                  <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Xem thêm nhà hàng
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="restaurant-list-empty-state">
              <TuneOutlinedIcon />
              <h3>Không tìm thấy nhà hàng phù hợp</h3>
              <p>Thử bỏ bớt bộ lọc hoặc chọn danh mục khác.</p>
              <button type="button" onClick={clearFilters}>Xóa bộ lọc</button>
            </div>
          )}
        </section>
      </main>

      <nav className="restaurant-list-bottom-nav" aria-label="Điều hướng nhanh">
        <Link href="/"><HomeOutlinedIcon /><span>Trang chủ</span></Link>
        <Link className="is-active" href="/restaurants"><ExploreOutlinedIcon /><span>Khám phá</span></Link>
        <Link href="/orders"><ReceiptLongOutlinedIcon /><span>Đơn hàng</span></Link>
        <Link href={user ? "/account/profile" : "/login?next=/account/profile"}>
          <AccountCircleOutlinedIcon /><span>Tài khoản</span>
        </Link>
      </nav>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3200}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={() => setNotice("")}>{notice}</Alert>
      </Snackbar>
    </div>
  );
}

function RestaurantCard({
  restaurant,
  location,
  priority,
}: {
  restaurant: RestaurantListItem;
  location: ViewerLocation | null;
  priority: boolean;
}) {
  const distance = distanceKm(location, restaurant);
  const shippingFee = estimatedShippingFee(distance);
  const statusClass = restaurant.orderState === "OPEN" ? "is-open" : "is-closed";
  return (
    <article className="restaurant-list-card">
      <Link className="restaurant-list-card__hitarea" href={`/restaurants/${restaurant.slug}`}>
        <div className="restaurant-list-card__media">
          {restaurant.image ? (
            <Image
              src={restaurant.image}
              alt={restaurant.imageAlt}
              fill
              priority={priority}
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1180px) 33vw, 25vw"
            />
          ) : (
            <span className="restaurant-list-card__placeholder">
              <RestaurantMenuOutlinedIcon />
              <small>Chưa có ảnh</small>
            </span>
          )}
          {restaurant.hasFreeship || restaurant.hasPromotion ? (
            <span className={`restaurant-list-tag ${restaurant.hasFreeship ? "is-shipping" : "is-deal"}`}>
              {restaurant.hasFreeship ? "Freeship" : "Có ưu đãi"}
            </span>
          ) : null}
        </div>

        <div className="restaurant-list-card__body">
          <h3>{restaurant.name}</h3>
          <div className="restaurant-list-card__rating">
            <StarOutlinedIcon fontSize="inherit" />
            <strong>{restaurant.rating.toFixed(1)}</strong>
            <span>({formatReviewCount(restaurant.reviewCount)})</span>
            {restaurant.categoryLabels.length ? <><span>·</span><span>{restaurant.categoryLabels.slice(0, 2).join(", ")}</span></> : null}
          </div>
          <div className="restaurant-list-card__meta">
            <span><ScheduleOutlinedIcon fontSize="inherit" />{estimatedDeliveryMinutes(distance)}</span>
            <span><LocationOnOutlinedIcon fontSize="inherit" />{distance === null ? "Chọn vị trí" : `${distance.toFixed(1)} km`}</span>
          </div>
          <strong className="restaurant-list-card__fee">
            {restaurant.hasFreeship ? "Có ưu đãi phí giao" : shippingFee === "Tính khi chọn địa chỉ" ? shippingFee : `${Number(shippingFee).toLocaleString("vi-VN")}đ phí giao`}
          </strong>
          <p className={`restaurant-list-card__status ${statusClass}`}>
            <span aria-hidden="true" />
            {restaurant.availabilityLabel}
            {restaurant.orderState === "OPEN" && restaurant.closesAt ? ` · Đóng cửa ${restaurant.closesAt.slice(0, 5)}` : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
