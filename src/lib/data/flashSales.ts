import "server-only";

import { unstable_cache } from "next/cache";

import type { HomeFlashSale } from "@/types/flashSale";
import { createPublicClient } from "@/utils/supabase/public";

type HomeFlashSaleRpc = {
  id: string;
  name: string;
  subtitle?: string | null;
  starts_at: string;
  ends_at: string;
  server_time: string;
  items?: Array<{
    id: string;
    food_id: string;
    food_name: string;
    restaurant_name: string;
    restaurant_slug: string;
    image_url?: string | null;
    image_alt_text?: string | null;
    original_price: number | string;
    sale_price: number | string;
    stock_limit: number;
    sold_quantity: number;
    remaining_quantity: number;
  }>;
};

function mapHomeFlashSale(payload: HomeFlashSaleRpc): HomeFlashSale {
  return {
    id: payload.id,
    name: payload.name,
    subtitle: payload.subtitle?.trim() || "Deal giới hạn trong khung giờ vàng",
    startsAt: payload.starts_at,
    endsAt: payload.ends_at,
    serverTime: payload.server_time,
    items: (payload.items ?? []).map((item) => ({
      id: item.id,
      foodId: item.food_id,
      foodName: item.food_name,
      restaurantName: item.restaurant_name,
      restaurantSlug: item.restaurant_slug,
      imageUrl: item.image_url?.trim() || null,
      imageAlt: item.image_alt_text?.trim() || `Ảnh món ${item.food_name}`,
      originalPrice: Number(item.original_price),
      salePrice: Number(item.sale_price),
      stockLimit: Number(item.stock_limit),
      soldQuantity: Number(item.sold_quantity),
      remainingQuantity: Number(item.remaining_quantity),
    })),
  };
}

const fetchHomeFlashSale = unstable_cache(async (): Promise<HomeFlashSale | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_get_home_flash_sale", {
    p_limit: 12,
  });

  if (error) throw new Error(error.message);
  if (!data) return null;

  const campaign = mapHomeFlashSale(data as unknown as HomeFlashSaleRpc);
  return campaign.items.length ? campaign : null;
}, ["home-flash-sale-v1"], {
  revalidate: 15,
  tags: ["flash-sale", "catalog", "restaurants"],
});

export async function getHomeFlashSale(): Promise<HomeFlashSale | null> {
  try {
    return await fetchHomeFlashSale();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const missingRpc = /api_get_home_flash_sale|schema cache|function/i.test(message);
    if (!missingRpc) console.error("getHomeFlashSale RPC error:", error);
    return null;
  }
}
