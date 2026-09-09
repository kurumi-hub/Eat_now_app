import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type FavoriteRestaurant = {
  id: string;
  slug: string;
  name: string;
  image: string;
  rating: string;
  deliveryTime: string;
};

type FavoriteRow = {
  restaurant_id: string;
  restaurants: {
    id: string;
    slug: string;
    name: string;
    rating_average: number | string;
    rating_count: number;
    restaurant_images: Array<{ img_url: string; is_primary: boolean; display_order: number }>;
  } | Array<{
    id: string;
    slug: string;
    name: string;
    rating_average: number | string;
    rating_count: number;
    restaurant_images: Array<{ img_url: string; is_primary: boolean; display_order: number }>;
  }>;
};

export async function getFavoriteRestaurants(supabase: SupabaseClient): Promise<FavoriteRestaurant[]> {
  const { data, error } = await supabase
    .from("restaurant_follows")
    .select("restaurant_id, created_at, restaurants!inner(id, slug, name, rating_average, rating_count, restaurant_images(img_url, is_primary, display_order))")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) {
    console.error("[favorites] Không thể tải nhà hàng yêu thích", error.message);
    return [];
  }
  return ((data ?? []) as unknown as FavoriteRow[]).flatMap((row) => {
    const restaurant = Array.isArray(row.restaurants) ? row.restaurants[0] : row.restaurants;
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

export async function getIsFavoriteRestaurant(supabase: SupabaseClient, restaurantId: string) {
  const { data, error } = await supabase
    .from("restaurant_follows")
    .select("restaurant_id")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) console.error("[favorites] Không thể đọc trạng thái yêu thích", error.message);
  return Boolean(data);
}
