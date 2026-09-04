import "server-only";

import { unstable_cache } from "next/cache";

import type { HomeRestaurant } from "@/components/home/homeData";
import type {
  RestaurantDetail,
  RestaurantMenuCategory,
  RestaurantReview,
  RestaurantVoucher,
} from "@/components/restaurant/restaurantDetailData";
import type {
  RestaurantDirectory,
  RestaurantListCategory,
  RestaurantListItem,
} from "@/components/restaurant/restaurantPageData";
import { createPublicClient } from "@/utils/supabase/public";

type FeaturedRestaurantRpcRow = {
  id: string;
  slug: string;
  name: string;
  rating_average: number | string;
  rating_count: number;
  image_url: string | null;
  image_alt_text?: string | null;
};

type RestaurantDetailRpc = {
  id: string;
  slug: string;
  name: string;
  address: string;
  is_active: boolean;
  order_state?: string;
  accepting_orders?: boolean;
  paused_reason?: string | null;
  paused_until?: string | null;
  open_at: string | null;
  close_at: string | null;
  rating_average: number | string;
  rating_count: number;
  image_url: string | null;
  foods: Array<{
    id: string;
    name: string;
    description: string | null;
    base_price: number | string;
    is_available: boolean;
    image_url: string | null;
    category: { id: string; name: string } | null;
    tags: string[];
    sizes: Array<{
      id: string;
      name: string;
      price: number | string;
      is_available: boolean;
    }>;
    topping_groups: Array<{
      id: string;
      name: string;
      min_select: number;
      max_select: number;
      toppings: Array<{
        id: string;
        name: string;
        price: number | string;
        is_available: boolean;
      }>;
    }>;
  }>;
};

type RestaurantDirectoryRpc = {
  items?: Array<{
    id: string;
    slug: string;
    name: string;
    address: string;
    image_url: string | null;
    image_alt_text?: string | null;
    rating_average: number | string;
    rating_count: number;
    order_state?: string | null;
    close_at?: string | null;
    lat?: number | string | null;
    lon?: number | string | null;
    has_promotion?: boolean | null;
    has_freeship?: boolean | null;
    matched_foods?: string[] | null;
    categories?: Array<{ id: string; name: string }> | null;
  }>;
  categories?: Array<{ id: string; name: string }>;
  total?: number;
  page?: number;
  page_size?: number;
  has_more?: boolean;
};

export type RestaurantDirectoryQuery = {
  search?: string;
  categoryId?: string;
  openOnly?: boolean;
  freeshipOnly?: boolean;
  promotionOnly?: boolean;
  lat?: number | null;
  lon?: number | null;
  maxDistanceKm?: number | null;
  sort?: "recommended" | "nearest" | "rating";
  page?: number;
  pageSize?: number;
};

type RestaurantPageExtrasRpc = {
  description?: string | null;
  vouchers?: Array<{
    id: string;
    code: string;
    name: string;
    discount_scope: "items" | "shipping" | string;
    discount_type: "fixed" | "percent" | string;
    discount_value: number | string;
    max_discount: number | string | null;
    min_order_value: number | string;
    distribution_mode: "auto" | "claim" | string;
    expired_at: string;
  }>;
  reviews?: Array<{
    id: string;
    customer_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }>;
};

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
}

function directoryAvailability(orderState: string) {
  return ORDER_STATE_COPY[orderState]?.label ?? ORDER_STATE_COPY.UNAVAILABLE.label;
}

function toFiniteNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatVoucherSubtitle(voucher: NonNullable<RestaurantPageExtrasRpc["vouchers"]>[number]) {
  const value = Number(voucher.discount_value);
  const benefit = voucher.discount_scope === "shipping"
    ? "Phí giao hàng"
    : voucher.discount_type === "percent"
      ? `Giảm ${value}%${voucher.max_discount ? ` · tối đa ${Number(voucher.max_discount).toLocaleString("vi-VN")}đ` : ""}`
      : `Giảm ${value.toLocaleString("vi-VN")}đ`;
  const minimum = Number(voucher.min_order_value || 0);
  return minimum > 0 ? `${benefit} · đơn từ ${minimum.toLocaleString("vi-VN")}đ` : benefit;
}

function mapExtras(extras: RestaurantPageExtrasRpc | null | undefined) {
  const vouchers: RestaurantVoucher[] = (extras?.vouchers ?? []).map((voucher) => ({
    id: voucher.id,
    code: voucher.code,
    title: voucher.name || voucher.code,
    subtitle: formatVoucherSubtitle(voucher),
    distributionMode: voucher.distribution_mode || "auto",
    expiredAt: voucher.expired_at,
  }));
  const reviews: RestaurantReview[] = (extras?.reviews ?? []).map((review) => ({
    id: review.id,
    customerName: review.customer_name || "Khách hàng EatNow",
    initial: (review.customer_name || "E").trim().charAt(0).toUpperCase(),
    rating: Number(review.rating),
    content: review.comment?.trim() || "Khách hàng đã đánh giá nhà hàng.",
    createdAt: review.created_at,
  }));
  return {
    description: extras?.description?.trim() || "",
    restaurantVouchers: vouchers,
    restaurantReviews: reviews,
  };
}

const ORDER_STATE_COPY: Record<string, { label: string; message: string }> = {
  OPEN: { label: "Đang nhận đơn", message: "Nhà hàng đang nhận đơn mới." },
  PAUSED: { label: "Tạm dừng nhận đơn", message: "Nhà hàng chủ động tạm dừng nhận đơn mới." },
  CLOSED_BY_SCHEDULE: { label: "Ngoài giờ hoạt động", message: "Nhà hàng sẽ nhận đơn lại trong khung giờ đã cấu hình." },
  SETUP: { label: "Đang thiết lập", message: "Nhà hàng chưa hoàn tất thiết lập vận hành." },
  SUSPENDED: { label: "Tạm ngưng", message: "Nhà hàng hiện không thể nhận đơn." },
  UNPUBLISHED: { label: "Chưa xuất bản", message: "Nhà hàng chưa mở bán công khai." },
  CLOSED: { label: "Đã đóng", message: "Nhà hàng hiện không hoạt động." },
  UNAVAILABLE: { label: "Chưa thể nhận đơn", message: "Nhà hàng hiện chưa thể nhận đơn mới." },
};

const fetchFeaturedRestaurants = unstable_cache(async (): Promise<HomeRestaurant[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_featured_restaurants", {
    p_limit: 8,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Không thể tải nhà hàng nổi bật.");
  }

  const rows = data as unknown as FeaturedRestaurantRpcRow[];
  return rows.flatMap((restaurant) => {
    const imageUrl = restaurant.image_url?.trim();
    if (!imageUrl) return [];
    return [{
      slug: restaurant.slug,
      name: restaurant.name,
      image: imageUrl,
      imageAlt: restaurant.image_alt_text?.trim() || `Ảnh nhà hàng ${restaurant.name}`,
      rating: `${restaurant.rating_average} (${restaurant.rating_count}+)`,
      time: "20 - 30 phút",
    }];
  });
}, ["catalog-featured-restaurants-v2-real-media"], {
  revalidate: 60,
  tags: ["catalog", "restaurants"],
});

export async function getFeaturedRestaurants(): Promise<HomeRestaurant[]> {
  try {
    return await fetchFeaturedRestaurants();
  } catch (error) {
    console.error("getFeaturedRestaurants RPC error:", error);
    return [];
  }
}

function mapDirectoryItem(
  restaurant: NonNullable<RestaurantDirectoryRpc["items"]>[number]
): RestaurantListItem {
  const categories = restaurant.categories ?? [];
  const orderState = restaurant.order_state || "UNAVAILABLE";
  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    address: restaurant.address,
    image: restaurant.image_url?.trim() || "",
    imageAlt: restaurant.image_alt_text?.trim() || `Ảnh nhà hàng ${restaurant.name}`,
    rating: Number(restaurant.rating_average || 0),
    reviewCount: Number(restaurant.rating_count || 0),
    categoryIds: categories.map((category) => category.id),
    categoryLabels: categories.map((category) => category.name),
    orderState,
    availabilityLabel: directoryAvailability(orderState),
    closesAt: restaurant.close_at ?? "",
    lat: toFiniteNumber(restaurant.lat),
    lon: toFiniteNumber(restaurant.lon),
    hasPromotion: restaurant.has_promotion === true,
    hasFreeship: restaurant.has_freeship === true,
    matchedFoods: Array.isArray(restaurant.matched_foods)
      ? restaurant.matched_foods.filter((name): name is string => typeof name === "string")
      : [],
  };
}

const fetchRestaurantDirectory = unstable_cache(async (
  query: RestaurantDirectoryQuery
): Promise<RestaurantDirectory> => {
  const supabase = createPublicClient();
  const page = Math.max(1, Math.trunc(query.page ?? 1));
  const pageSize = Math.min(48, Math.max(1, Math.trunc(query.pageSize ?? 12)));
  const { data, error } = await supabase.rpc("api_list_public_restaurants", {
    p_search: query.search?.trim() || null,
    p_category_id: query.categoryId?.trim() || null,
    p_open_only: query.openOnly === true,
    p_freeship_only: query.freeshipOnly === true,
    p_promotion_only: query.promotionOnly === true,
    p_lat: query.lat ?? null,
    p_lon: query.lon ?? null,
    p_max_distance_km: query.maxDistanceKm ?? null,
    p_sort: query.sort ?? "recommended",
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (!error && data) {
    const payload = data as unknown as RestaurantDirectoryRpc;
    const items = (payload.items ?? []).map(mapDirectoryItem);
    const categories: RestaurantListCategory[] = (payload.categories ?? []).map(
      (category) => ({ id: category.id, label: category.name })
    );
    return {
      items,
      categories,
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? page),
      pageSize: Number(payload.page_size ?? pageSize),
      hasMore: payload.has_more === true,
    };
  }

  throw new Error(error?.message ?? "Không thể tải danh sách nhà hàng.");
}, ["public-restaurant-directory-v3-search-relevance"], {
  revalidate: 60,
  tags: ["catalog", "restaurants", "vouchers"],
});

export async function getRestaurantDirectory(
  query: RestaurantDirectoryQuery = {}
): Promise<RestaurantDirectory> {
  try {
    return await fetchRestaurantDirectory(query);
  } catch (error) {
    console.error("getRestaurantDirectory RPC error:", error);
    const page = Math.max(1, Math.trunc(query.page ?? 1));
    const pageSize = Math.min(48, Math.max(1, Math.trunc(query.pageSize ?? 12)));
    const message = error instanceof Error ? error.message : "";
    const missingRpc = /api_list_public_restaurants|schema cache|function/i.test(message);
    return {
      items: [], categories: [], total: 0, page, pageSize, hasMore: false,
      loadError: missingRpc
        ? "RPC tìm kiếm chưa được cập nhật. Hãy chạy lại SQL 52 và SQL 53 trên Supabase."
        : "Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.",
    };
  }
}

const fetchRestaurantDetailBySlug = unstable_cache(async (
  slug: string
): Promise<RestaurantDetail | undefined> => {
  const supabase = createPublicClient();
  const [detailResult, extrasResult] = await Promise.all([
    supabase.rpc("api_restaurant_detail", { p_slug: slug }),
    supabase.rpc("api_restaurant_page_extras", { p_slug: slug }),
  ]);
  const { data, error } = detailResult;

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return undefined;

  const restaurant = data as unknown as RestaurantDetailRpc;
  const extrasMissing =
    extrasResult.error?.code === "PGRST202" ||
    extrasResult.error?.code === "42883" ||
    /api_restaurant_page_extras/i.test(extrasResult.error?.message ?? "");
  if (extrasResult.error && !extrasMissing) {
    console.warn("api_restaurant_page_extras error:", extrasResult.error.message);
  }
  const extras = mapExtras(
    extrasResult.error ? null : extrasResult.data as unknown as RestaurantPageExtrasRpc
  );
  const orderState = restaurant.order_state || (restaurant.is_active ? "OPEN" : "UNAVAILABLE");
  const availability = ORDER_STATE_COPY[orderState] || ORDER_STATE_COPY.UNAVAILABLE;
  const categoryOrder: string[] = [];
  const categoriesMap = new Map<string, RestaurantMenuCategory>();

  for (const food of restaurant.foods ?? []) {
    const categoryId = food.category?.id ?? "khac";
    const categoryName = food.category?.name ?? "Món Khác";
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        label: categoryName,
        items: [],
      });
      categoryOrder.push(categoryId);
    }

    categoriesMap.get(categoryId)!.items.push({
      id: food.id,
      name: food.name,
      description: food.description ?? "",
      price: Number(food.base_price),
      image: food.image_url ?? "",
      isAvailable: food.is_available,
      isPopular: (food.tags ?? []).includes("popular"),
      sizes: (food.sizes ?? []).map((size) => ({
        id: size.id,
        name: size.name,
        price: Number(size.price),
        isAvailable: size.is_available,
      })),
      toppingGroups: (food.topping_groups ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        minSelect: group.min_select,
        maxSelect: group.max_select,
        toppings: (group.toppings ?? []).map((topping) => ({
          id: topping.id,
          name: topping.name,
          price: Number(topping.price),
          isAvailable: topping.is_available,
        })),
      })),
    });
  }

  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    image: restaurant.image_url?.trim() || "",
    rating: String(restaurant.rating_average),
    reviewCount: formatReviewCount(restaurant.rating_count),
    address: restaurant.address,
    deliveryTime: "25-35 phút",
    deliveryFee: "Tính theo khoảng cách",
    isOpen: orderState === "OPEN",
    orderState,
    acceptingOrders: restaurant.accepting_orders === true,
    availabilityLabel: availability.label,
    availabilityMessage: restaurant.paused_reason && orderState === "PAUSED"
      ? `${availability.message} Lý do: ${restaurant.paused_reason}`
      : availability.message,
    openUntil: restaurant.close_at ?? "",
    description: extras.description,
    restaurantVouchers: extras.restaurantVouchers,
    restaurantReviews: extras.restaurantReviews,
    menuCategories: categoryOrder.map((id) => categoriesMap.get(id)!),
  };
}, ["catalog-restaurant-detail-v7-comments"], {
  revalidate: 60,
  tags: ["catalog", "restaurants", "vouchers", "reviews"],
});

export async function getRestaurantDetailBySlug(
  slug: string
): Promise<RestaurantDetail | undefined> {
  try {
    return await fetchRestaurantDetailBySlug(slug);
  } catch (error) {
    console.error("getRestaurantDetailBySlug RPC error:", error);
    return undefined;
  }
}
