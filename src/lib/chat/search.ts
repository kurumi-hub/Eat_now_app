import "server-only";

import { splitAlternativeFoodQueries } from "@/lib/chat/query";
import type { ChatCatalogResult, ChatFoodResult, ChatRestaurantResult } from "@/lib/chat/types";
import { getRestaurantDirectory } from "@/lib/data/restaurants";
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
  resultTypes: Array<"food" | "restaurant">;
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
  restaurant_id?: unknown;
  restaurant_slug?: unknown;
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
      typeof row.restaurant_id !== "string" || typeof row.restaurant_slug !== "string" ||
      typeof row.restaurant_name !== "string" || typeof row.url !== "string" ||
      !row.url.startsWith("/restaurants/")) return null;

  return {
    kind: "food",
    foodId: row.food_id,
    foodName: row.food_name,
    description: typeof row.description === "string" ? row.description : "",
    imageUrl: typeof row.image_url === "string" ? row.image_url : "",
    imageAlt: typeof row.image_alt_text === "string" ? row.image_alt_text : `Ảnh món ${row.food_name}`,
    price: finiteNumber(row.price),
    normalPrice: finiteNumber(row.normal_price),
    hasSizes: row.has_sizes === true,
    foodRating: finiteNumber(row.food_rating),
    restaurantId: row.restaurant_id,
    restaurantSlug: row.restaurant_slug,
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
  const requestedTypes = Array.isArray(args.resultTypes) ? args.resultTypes : [];
  const resultTypes = [...new Set(requestedTypes.flatMap((type) =>
    type === "food" || type === "restaurant" ? [type] : []
  ))] as Array<"food" | "restaurant">;

  return {
    query: shortText(args.query, 120) || null,
    tags,
    minPrice,
    maxPrice: minPrice !== null && maxPrice !== null && maxPrice < minPrice ? minPrice : maxPrice,
    openOnly: args.openOnly === true,
    promotionOnly: args.promotionOnly === true,
    maxDistanceKm: boundedNumber(args.maxDistanceKm, 0.5, 30),
    sort,
    resultTypes: resultTypes.length ? resultTypes : ["food", "restaurant"],
    limit: 10,
  };
}

async function searchSingleQuery(
  args: ChatFoodSearchArgs,
  location: ChatLocation,
  query: string | null
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_chat_search_foods", {
    p_query: query,
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

  return items;
}

function resultKey(item: ChatCatalogResult) {
  return item.kind === "food" ? `food:${item.foodId}` : `restaurant:${item.restaurantId}`;
}

function interleaveUnique(groups: ChatCatalogResult[][], limit: number) {
  const items: ChatCatalogResult[] = [];
  const seen = new Set<string>();
  const longest = Math.max(0, ...groups.map((group) => group.length));

  for (let index = 0; index < longest && items.length < limit; index += 1) {
    for (const group of groups) {
      const item = group[index];
      const key = item ? resultKey(item) : "";
      if (!item || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
      if (items.length >= limit) break;
    }
  }

  return items;
}

async function searchRestaurants(args: ChatFoodSearchArgs, location: ChatLocation) {
  const directory = await getRestaurantDirectory({
    search: args.query ?? "",
    openOnly: args.openOnly,
    promotionOnly: args.promotionOnly,
    lat: location?.lat ?? null,
    lon: location?.lon ?? null,
    maxDistanceKm: location ? args.maxDistanceKm : null,
    sort: args.sort === "nearest" || args.sort === "rating" ? args.sort : "recommended",
    page: 1,
    pageSize: 10,
  });

  return directory.items.map((item): ChatRestaurantResult => ({
    kind: "restaurant",
    restaurantId: item.id,
    restaurantSlug: item.slug,
    restaurantName: item.name,
    address: item.address,
    imageUrl: item.image,
    imageAlt: item.imageAlt,
    rating: item.rating,
    reviewCount: item.reviewCount,
    orderState: item.orderState,
    distanceKm: item.distanceKm,
    hasPromotion: item.hasPromotion,
    hasFreeship: item.hasFreeship,
    matchedFoods: item.matchedFoods,
    url: `/restaurants/${item.slug}`,
  }));
}

export async function searchChatFoods(args: ChatFoodSearchArgs, location: ChatLocation) {
  const alternatives = splitAlternativeFoodQueries(args.query);
  const searchedQueries = alternatives.length ? alternatives : [args.query];
  const foodGroups = args.resultTypes.includes("food")
    ? await Promise.all(searchedQueries.map((query) => searchSingleQuery(args, location, query)))
    : [];
  const restaurantItems = args.resultTypes.includes("restaurant")
    ? await searchRestaurants(args, location)
    : [];
  const items = interleaveUnique([
    ...foodGroups,
    ...(restaurantItems.length ? [restaurantItems] : []),
  ], args.limit);

  return {
    items,
    locationAvailable: location !== null,
    locationRequested: args.maxDistanceKm !== null || args.sort === "nearest",
    searchedQueries: alternatives,
  };
}
