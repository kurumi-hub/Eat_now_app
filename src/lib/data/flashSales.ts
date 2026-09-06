import "server-only";

import type { FoodFlashSale, HomeFlashSale } from "@/types/flashSale";
import { createPublicClient } from "@/utils/supabase/public";

type HomeFlashSaleRpc = {
  id: string;
  name: string;
  subtitle?: string | null;
  starts_at: string;
  ends_at: string;
  server_time: string;
  voucher_policy?: HomeFlashSale["voucherPolicy"];
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
    voucherPolicy: payload.voucher_policy ?? "shipping_only",
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

async function fetchHomeFlashSale(): Promise<HomeFlashSale | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_get_home_flash_sale", {
    p_limit: 12,
  });

  if (error) throw new Error(error.message);
  if (!data) return null;

  const campaign = mapHomeFlashSale(data as unknown as HomeFlashSaleRpc);
  return campaign.items.length ? campaign : null;
}

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

type FoodFlashSaleRpc = {
  id: string; campaign_id: string; campaign_name: string;
  starts_at: string; ends_at: string; server_time: string;
  original_price: number | string; sale_price: number | string;
  remaining_quantity: number; per_user_limit: number;
  voucher_policy: FoodFlashSale["voucherPolicy"];
  funding_source?: FoodFlashSale["fundingSource"];
};

export async function getFoodFlashSale(
  foodId: string,
  flashSaleItemId?: string
): Promise<FoodFlashSale | null> {
  const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
  if (!uuid.test(foodId) || (flashSaleItemId && !uuid.test(flashSaleItemId))) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("api_get_food_flash_sale", {
      p_food_id: foodId,
      p_flash_sale_item_id: flashSaleItemId || null,
    });
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as unknown as FoodFlashSaleRpc;
    return {
      id: row.id, campaignId: row.campaign_id, campaignName: row.campaign_name,
      startsAt: row.starts_at, endsAt: row.ends_at, serverTime: row.server_time,
      originalPrice: Number(row.original_price), salePrice: Number(row.sale_price),
      remainingQuantity: Number(row.remaining_quantity), perUserLimit: Number(row.per_user_limit),
      voucherPolicy: row.voucher_policy,
      fundingSource: row.funding_source,
    };
  } catch (error) {
    console.error("getFoodFlashSale RPC error:", error);
    return null;
  }
}
