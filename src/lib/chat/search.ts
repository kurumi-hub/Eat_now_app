import "server-only";

import type { ChatFoodResult } from "@/lib/chat/types";
import { createClient } from "@/utils/supabase/server";

export type ChatFoodSearchArgs = {
  query: string | null;
  tags: string[];
  minPrice: number | null;
  maxPrice: number | null;
  openOnly: boolean;
  promotionOnly: boolean;
  maxDistanceKm: number | null;
  sort: "recommended" | "nearest" | "rating" | "price";
  limit: number;
};

type ChatLocation = { lat: number; lon: number } | null;

type SearchRow = {
  food_id?: unknown;
  food_name?: unknown;
  description?: unknown;
  image_url?: unknown;
  image_alt_text?: unknown;
  price?: unknown;
  normal_price?: unknown;
  has_sizes?: unknown;
  food_rating?: unknown;
  restaurant_name?: unknown;
  restaurant_rating?: unknown;
  order_state?: unknown;
  distance_km?: unknown;
  categories?: unknown;
  tags?: unknown;
  flash_sale_item_id?: unknown;
  flash_sale_ends_at?: unknown;
  flash_sale_remaining?: unknown;
  url?: unknown;
};

function finiteNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function names(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("name" in item)) return [];
    return typeof item.name === "string" ? [item.name] : [];
  });
}

function mapResult(row: SearchRow): ChatFoodResult | null {
  if (typeof row.food_id !== "string" || typeof row.food_name !== "string" ||
      typeof row.restaurant_name !== "string" || typeof row.url !== "string" ||
      !row.url.startsWith("/restaurants/")) return null;

  return {
    foodId: row.food_id,
    foodName: row.food_name,
    description: typeof row.description === "string" ? row.description : "",
    imageUrl: typeof row.image_url === "string" ? row.image_url : "",
    imageAlt: typeof row.image_alt_text === "string" ? row.image_alt_text : `Ảnh món ${row.food_name}`,
    price: finiteNumber(row.price),
    normalPrice: finiteNumber(row.normal_price),
    hasSizes: row.has_sizes === true,
    foodRating: finiteNumber(row.food_rating),
    restaurantName: row.restaurant_name,
    restaurantRating: finiteNumber(row.restaurant_rating),
    orderState: typeof row.order_state === "string" ? row.order_state : "UNAVAILABLE",
    distanceKm: nullableNumber(row.distance_km),
    categories: names(row.categories),
    tags: names(row.tags),
    flashSaleItemId: typeof row.flash_sale_item_id === "string" ? row.flash_sale_item_id : null,
    flashSaleEndsAt: typeof row.flash_sale_ends_at === "string" ? row.flash_sale_ends_at : null,
    flashSaleRemaining: nullableNumber(row.flash_sale_remaining),
    url: row.url,
  };
}

function shortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function boundedNumber(value: unknown, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : null;
}

export function normalizeFoodSearchArgs(value: unknown): ChatFoodSearchArgs {
  const args = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const sort = args.sort === "nearest" || args.sort === "rating" || args.sort === "price"
    ? args.sort
    : "recommended";
  const rawTags = Array.isArray(args.tags) ? args.tags : [];
  const tags = [...new Set(rawTags.flatMap((tag) => {
    const normalized = shortText(tag, 40);
    return normalized ? [normalized] : [];
  }))].slice(0, 4);
  const minPrice = boundedNumber(args.minPrice, 0, 10_000_000);
  const maxPrice = boundedNumber(args.maxPrice, 0, 10_000_000);

  return {
    query: shortText(args.query, 120) || null,
    tags,
    minPrice,
    maxPrice: minPrice !== null && maxPrice !== null && maxPrice < minPrice ? minPrice : maxPrice,
    openOnly: args.openOnly !== false,
    promotionOnly: args.promotionOnly === true,
    maxDistanceKm: boundedNumber(args.maxDistanceKm, 0.5, 30),
    sort,
    limit: Math.trunc(boundedNumber(args.limit, 1, 5) ?? 5),
  };
}

export async function searchChatFoods(args: ChatFoodSearchArgs, location: ChatLocation) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_chat_search_foods", {
    p_query: args.query,
    p_tags: args.tags.length ? args.tags : null,
    p_min_price: args.minPrice,
    p_max_price: args.maxPrice,
    p_open_only: args.openOnly,
    p_promotion_only: args.promotionOnly,
    p_lat: location?.lat ?? null,
    p_lon: location?.lon ?? null,
    p_max_distance_km: location ? args.maxDistanceKm : null,
    p_sort: location || args.sort !== "nearest" ? args.sort : "recommended",
    p_limit: args.limit,
  });

  if (error) throw new Error(`FOOD_SEARCH_FAILED:${error.code ?? "unknown"}`);
  const payload = data && typeof data === "object" ? data as { items?: unknown } : {};
  const items = Array.isArray(payload.items)
    ? payload.items.flatMap((row) => {
        const item = row && typeof row === "object" ? mapResult(row as SearchRow) : null;
        return item ? [item] : [];
      })
    : [];

  return { items, locationAvailable: location !== null };
}
