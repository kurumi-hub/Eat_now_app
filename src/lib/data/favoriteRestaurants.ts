import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

export type FavoriteRestaurant = {
  id: string;
  slug: string;
  name: string;
  image: string;
  rating: string;
  deliveryTime: string;
};

type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  rating_average: number | string;
  rating_count: number;
  restaurant_images: Array<{ img_url: string; is_primary: boolean; display_order: number }>;
};

export async function getFavoriteRestaurants(userId: string): Promise<FavoriteRestaurant[]> {
  const admin = createAdminClient();
  const { data: followRows, error: followError } = await admin
    .from("restaurant_follows")
    .select("restaurant_id, created_at")
    .order("created_at", { ascending: false })
    .eq("user_id", userId)
    .limit(8);
  if (followError) {
    console.error("[favorites] Không thể tải danh sách follow", followError);
    return [];
  }
  const restaurantIds = (followRows ?? []).map((row) => String(row.restaurant_id));
  if (!restaurantIds.length) return [];

  const { data: restaurantRows, error: restaurantError } = await admin
    .from("restaurants")
    .select("id, slug, name, rating_average, rating_count, restaurant_images(img_url, is_primary, display_order)")
    .in("id", restaurantIds);
  if (restaurantError) {
    console.error("[favorites] Có follow nhưng không thể tải thông tin nhà hàng", restaurantError);
    return [];
  }
  const byId = new Map(((restaurantRows ?? []) as unknown as RestaurantRow[]).map((row) => [row.id, row]));
  return restaurantIds.flatMap((id) => {
    const restaurant = byId.get(id);
    if (!restaurant?.slug) return [];
    const images = [...(restaurant.restaurant_images ?? [])].sort((a, b) =>
      Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order
    );
    return [{
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      image: images[0]?.img_url ?? "",
      rating: `${restaurant.rating_average} (${restaurant.rating_count}+)`,
      deliveryTime: "20 - 30 phút",
    }];
  });
}

export async function getIsFavoriteRestaurant(userId: string, restaurantId: string) {
  const { data, error } = await createAdminClient()
    .from("restaurant_follows")
    .select("restaurant_id")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) console.error("[favorites] Không thể đọc trạng thái yêu thích", error.message);
  return Boolean(data);
}
