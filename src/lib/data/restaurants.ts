import "server-only";

import { unstable_cache } from "next/cache";

import type { HomeRestaurant } from "@/components/home/homeData";
import type {
  RestaurantDetail,
  RestaurantMenuCategory,
} from "@/components/restaurant/restaurantDetailData";
import { createPublicClient } from "@/utils/supabase/public";

type FeaturedRestaurantRpcRow = {
  id: string;
  slug: string;
  name: string;
  rating_average: number | string;
  rating_count: number;
  image_url: string | null;
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

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
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
  return rows.map((restaurant) => ({
    slug: restaurant.slug,
    name: restaurant.name,
    image:
      restaurant.image_url ?? "/images/home/restaurant-com-tam.png",
    rating: `${restaurant.rating_average} (${restaurant.rating_count}+)`,
    time: "20 - 30 phút",
  }));
}, ["catalog-featured-restaurants-v1"], {
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

const fetchRestaurantDetailBySlug = unstable_cache(async (
  slug: string
): Promise<RestaurantDetail | undefined> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_restaurant_detail", {
    p_slug: slug,
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return undefined;

  const restaurant = data as unknown as RestaurantDetailRpc;
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
    image: restaurant.image_url ?? "",
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
    menuCategories: categoryOrder.map((id) => categoriesMap.get(id)!),
  };
}, ["catalog-restaurant-detail-v3"], {
  revalidate: 60,
  tags: ["catalog", "restaurants"],
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
