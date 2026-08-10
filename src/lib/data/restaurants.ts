import { createClient } from "@/utils/supabase/server";
import type { HomeRestaurant } from "@/components/home/homeData";
import type {
  RestaurantDetail,
  RestaurantMenuCategory,
} from "@/components/restaurant/restaurantDetailData";

/**
 * Lớp truy vấn dữ liệu nhà hàng từ Supabase.
 * Trả về đúng các type UI đang dùng (HomeRestaurant / RestaurantDetail)
 * để các component (HomePage, RestaurantDetailPage) không cần sửa.
 */

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

// ---------------------------------------------------------------------
// Trang chủ: danh sách nhà hàng nổi bật
// ---------------------------------------------------------------------
export async function getFeaturedRestaurants(): Promise<HomeRestaurant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      `slug, name, rating_average, rating_count,
       restaurant_images ( img_url, is_primary )`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(8);

  if (error || !data) {
    console.error("getFeaturedRestaurants error:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return [];
  }

  return data.map((r) => {
    const primaryImage =
      r.restaurant_images.find((img) => img.is_primary)?.img_url ??
      r.restaurant_images[0]?.img_url ??
      "/images/home/restaurant-com-tam.png";

    return {
      slug: r.slug ?? "",
      name: r.name,
      image: primaryImage,
      rating: `${r.rating_average} (${r.rating_count}+)`,
      time: "20 - 30 phút",
    };
  });
}

// ---------------------------------------------------------------------
// Trang chi tiết nhà hàng theo slug
// ---------------------------------------------------------------------
export async function getRestaurantDetailBySlug(
  slug: string
): Promise<RestaurantDetail | undefined> {
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select(
      `slug, name, address, is_active, close_at,
       rating_average, rating_count,
       restaurant_images ( img_url, is_primary ),
       foods (
         id, name, description, base_price, is_available,
         food_images ( img_url, is_primary ),
         food_categories ( categories ( id, name ) ),
         food_tags ( tags ( name ) )
       )`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getRestaurantDetailBySlug error:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return undefined;
  }
  if (!restaurant) return undefined;

  const primaryImage =
    restaurant.restaurant_images.find((img) => img.is_primary)?.img_url ??
    restaurant.restaurant_images[0]?.img_url ??
    "";

  // Gom món ăn theo category, giữ đúng cấu trúc RestaurantMenuCategory[]
  const categoryOrder: string[] = [];
  const categoriesMap = new Map<string, RestaurantMenuCategory>();

  for (const food of restaurant.foods) {
    const category = firstRelation(food.food_categories[0]?.categories);
    const categoryName = category?.name ?? "Món Khác";
    const categoryId = category?.id ?? "khac";

    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        label: categoryName,
        items: [],
      });
      categoryOrder.push(categoryId);
    }

    const primaryFoodImage =
      food.food_images.find((img) => img.is_primary)?.img_url ??
      food.food_images[0]?.img_url ??
      "";

    const isPopular = food.food_tags.some(
      (ft) => firstRelation(ft.tags)?.name === "popular"
    );

    categoriesMap.get(categoryId)!.items.push({
      id: food.id,
      name: food.name,
      description: food.description ?? "",
      price: Number(food.base_price),
      image: primaryFoodImage,
      isAvailable: food.is_available,
      isPopular,
    });
  }

  return {
    slug: restaurant.slug ?? slug,
    name: restaurant.name,
    image: primaryImage,
    rating: String(restaurant.rating_average),
    reviewCount: formatReviewCount(restaurant.rating_count),
    address: restaurant.address,
    deliveryTime: "25-35 phút",
    deliveryFee: "Miễn phí giao hàng",
    isOpen: restaurant.is_active,
    openUntil: restaurant.close_at ?? "",
    menuCategories: categoryOrder.map((id) => categoriesMap.get(id)!),
  };
}
