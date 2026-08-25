"use server";

import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function loadCartFoodImagesAction(foodIds: string[]) {
  const ids = [...new Set(foodIds.filter((id) => UUID.test(id)))].slice(0, 50);
  if (!ids.length) return { ok: true as const, images: {} as Record<string, string> };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_get_cart_food_images", {
    p_food_ids: ids,
  });
  if (error) {
    console.error("[cart] Không thể tải ảnh món thật", error.message);
    return { ok: false as const, images: {} as Record<string, string> };
  }

  const images: Record<string, string> = {};
  if (Array.isArray(data)) {
    for (const raw of data) {
      if (!raw || typeof raw !== "object") continue;
      const row = raw as Record<string, unknown>;
      if (typeof row.food_id === "string" && typeof row.image_url === "string" && row.image_url.trim()) {
        images[row.food_id] = row.image_url.trim();
      }
    }
  }
  return { ok: true as const, images };
}
