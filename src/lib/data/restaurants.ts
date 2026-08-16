import type { HomeRestaurant } from "@/components/home/homeData";
import type {
  RestaurantDetail,
  RestaurantMenuCategory,
} from "@/components/restaurant/restaurantDetailData";
import { createClient } from "@/utils/supabase/server";

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
  }>;
};

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
}

export async function getFeaturedRestaurants(): Promise<HomeRestaurant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_featured_restaurants", {
    p_limit: 8,
  });

  if (error || !data) {
    console.error("getFeaturedRestaurants RPC error:", error?.message);
    return [];
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
}

export async function getRestaurantDetailBySlug(
  slug: string
): Promise<RestaurantDetail | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_restaurant_detail", {
    p_slug: slug,
  });

  if (error) {
    console.error("getRestaurantDetailBySlug RPC error:", error.message);
    return undefined;
  }
  if (!data) return undefined;

  const restaurant = data as unknown as RestaurantDetailRpc;
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
    isOpen: restaurant.is_active,
    openUntil: restaurant.close_at ?? "",
    menuCategories: categoryOrder.map((id) => categoriesMap.get(id)!),
  };
}
