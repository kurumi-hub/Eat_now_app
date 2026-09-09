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

type FavoriteRow = { id?: string; slug?: string; name?: string; image_url?: string | null; rating_average?: number | string; rating_count?: number };

export async function getFavoriteRestaurants(supabase: SupabaseClient): Promise<FavoriteRestaurant[]> {
  const { data, error } = await supabase.rpc("api_list_my_favorite_restaurants", { p_limit: 8 });
  if (error) { console.error("[favorites] Không thể tải nhà hàng yêu thích", error); return []; }
  return (Array.isArray(data) ? data : []).flatMap((raw) => {
    const row = raw as FavoriteRow;
    if (!row.id || !row.slug || !row.name) return [];
    return [{ id: row.id, slug: row.slug, name: row.name, image: row.image_url ?? "", rating: `${row.rating_average ?? 0} (${row.rating_count ?? 0}+)`, deliveryTime: "20 - 30 phút" }];
  });
}

export async function getIsFavoriteRestaurant(supabase: SupabaseClient, restaurantId: string) {
  const { data, error } = await supabase.rpc("api_is_my_favorite_restaurant", { p_restaurant_id: restaurantId });
  if (error) console.error("[favorites] Không thể đọc trạng thái yêu thích", error);
  return data === true;
}
