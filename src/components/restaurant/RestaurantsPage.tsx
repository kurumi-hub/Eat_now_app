"use client";

import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import RiceBowlOutlinedIcon from "@mui/icons-material/RiceBowlOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

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
  initialLocation: ViewerLocation | null;
  initialCategoryId?: string;
  initialSearch?: string;
  initialFilterIds?: RestaurantFilterId[];
  initialSort?: RestaurantSortId;
  initialPage?: number;
};

const FILTER_PARAMS: Record<RestaurantFilterId, string> = {
  open: "open",
  freeship: "freeship",
  promotion: "promotion",
  nearby: "nearby",
};

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
  initialLocation,
  initialCategoryId = "",
  initialSearch = "",
  initialFilterIds = [],
  initialSort = "recommended",
  initialPage = 1,
}: RestaurantsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [location, setLocation] = useState<ViewerLocation | null>(initialLocation);
  const [notice, setNotice] = useState("");
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasActiveFilters = Boolean(
    initialCategoryId ||
    initialFilterIds.length ||
    initialSearch ||
    initialSort !== "recommended"
  );

  const updateQuery = useCallback((
    updates: Record<string, string | null>,
    resetPage = true
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (resetPage && !("page" in updates)) next.delete("page");
    const query = next.toString();
    startNavigation(() => router.replace(`/restaurants${query ? `?${query}` : ""}`, { scroll: false }));
  }, [router, searchParams]);

  useEffect(() => setLocation(initialLocation), [initialLocation?.lat, initialLocation?.lon]);
  useEffect(() => {
    if (data.total > 0 && initialPage > totalPages) {
      updateQuery({ page: String(totalPages) }, false);
    }
  }, [data.total, initialPage, totalPages, updateQuery]);

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
    const active = initialFilterIds.includes(filterId);
    let nextLocation = location;
    if (filterId === "nearby" && !active) {
      nextLocation = await ensureLocation();
      if (!nextLocation) return;
    }
    updateQuery({
      [FILTER_PARAMS[filterId]]: active ? null : "1",
      ...(filterId === "nearby" && nextLocation ? {
        lat: active && initialSort !== "nearest" ? null : String(nextLocation.lat),
        lon: active && initialSort !== "nearest" ? null : String(nextLocation.lon),
      } : {}),
    });
  };

  const changeSort = async (nextSort: RestaurantSortId) => {
    let nextLocation = location;
    if (nextSort === "nearest") {
      nextLocation = await ensureLocation();
      if (!nextLocation) return;
    }
    updateQuery({
      sort: nextSort === "recommended" ? null : nextSort,
      ...(nextSort === "nearest" && nextLocation ? {
        lat: String(nextLocation.lat),
        lon: String(nextLocation.lon),
      } : !initialFilterIds.includes("nearby") ? { lat: null, lon: null } : {}),
    });
  };

  const clearFilters = () => {
    updateQuery({
      q: null,
      category: null,
      open: null,
      freeship: null,
      promotion: null,
      nearby: null,
      sort: null,
      page: null,
      lat: null,
      lon: null,
    }, false);
  };

  return (
    <div className="restaurant-list-page">
      <main className="restaurant-list-main">
        <section className="restaurant-list-intro" aria-labelledby="restaurants-title">
          <nav className="restaurant-list-breadcrumb" aria-label="Đường dẫn">
            <Link href="/?home=1">Trang chủ</Link>
            <ChevronRightOutlinedIcon fontSize="small" />
            <span>Nhà hàng</span>
          </nav>

          <div className="restaurant-list-title-row">
            <div>
              <h1 id="restaurants-title">Khám phá nhà hàng</h1>
              <p>
                Tìm thấy <strong>{data.total.toLocaleString("vi-VN")}</strong>{" "}
                nhà hàng phù hợp
              </p>
            </div>
          </div>

          {initialSearch ? (
            <div className="restaurant-search-summary" role="status">
              <span>Kết quả cho <strong>“{initialSearch}”</strong></span>
              <button type="button" disabled={isNavigating} onClick={() => updateQuery({ q: null })}>
                Xóa tìm kiếm
              </button>
            </div>
          ) : null}

          {data.categories.length ? (
            <div className="restaurant-category-section">
              <h2>Danh mục phổ biến</h2>
              <div className="restaurant-category-rail">
                {data.categories.map((category) => {
                  const Icon = iconForCategory(category);
                  const active = category.id === initialCategoryId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={active ? "is-active" : ""}
                      aria-pressed={active}
                      disabled={isNavigating}
                      onClick={() => updateQuery({ category: active ? null : category.id })}
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
              disabled={isNavigating}
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
                disabled={isNavigating}
                className={`restaurant-filter-chip${initialFilterIds.includes(filter.id) ? " is-active" : ""}`}
                aria-pressed={initialFilterIds.includes(filter.id)}
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
              value={initialSort}
              disabled={isNavigating}
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
            <span>{data.total.toLocaleString("vi-VN")} kết quả</span>
          </div>

          {data.loadError ? (
            <div className="restaurant-list-load-error" role="alert">
              <strong>Không thể áp dụng bộ lọc</strong>
              <span>{data.loadError}</span>
            </div>
          ) : data.items.length ? (
            <>
              <div className={`restaurant-list-grid${isNavigating ? " is-loading" : ""}`} aria-busy={isNavigating}>
                {data.items.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    location={location}
                    priority={index < 4}
                  />
                ))}
              </div>
              {totalPages > 1 ? (
                <nav className="restaurant-list-pagination" aria-label="Phân trang nhà hàng">
                  <button
                    type="button"
                    disabled={isNavigating || initialPage <= 1}
                    onClick={() => updateQuery({ page: String(initialPage - 1) }, false)}
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang <strong>{initialPage}</strong> / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={isNavigating || initialPage >= totalPages}
                    onClick={() => updateQuery({ page: String(initialPage + 1) }, false)}
                  >
                    Trang sau
                  </button>
                </nav>
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
          {restaurant.matchedFoods.length ? (
            <p className="restaurant-list-card__match">
              Khớp món: <strong>{restaurant.matchedFoods.join(", ")}</strong>
            </p>
          ) : null}
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
