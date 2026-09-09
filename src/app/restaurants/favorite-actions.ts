"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createAdminClient } from "@/utils/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function databaseErrorDetail(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  const parts = [
    error.message?.trim(),
    error.code ? `mã ${error.code}` : "",
    error.details?.trim(),
    error.hint?.trim() ? `Gợi ý: ${error.hint.trim()}` : "",
  ].filter(Boolean);
  return parts.join(" · ") || "Database không cung cấp chi tiết lỗi.";
}

export async function toggleFavoriteRestaurantAction(restaurantId: string, shouldFavorite: boolean) {
  const user = await requireCurrentUser();
  if (!UUID.test(restaurantId)) return { ok: false, message: "Nhà hàng không hợp lệ." };
  const supabase = createAdminClient();
  const result = shouldFavorite
    ? await supabase.from("restaurant_follows").upsert(
        { user_id: user.id, restaurant_id: restaurantId },
        { onConflict: "user_id,restaurant_id", ignoreDuplicates: true }
      )
    : await supabase.from("restaurant_follows").delete()
        .eq("user_id", user.id).eq("restaurant_id", restaurantId);
  if (result.error) {
    const detail = databaseErrorDetail(result.error);
    console.error("toggleFavoriteRestaurantAction error:", {
      message: result.error.message,
      code: result.error.code,
      details: result.error.details,
      hint: result.error.hint,
      userId: user.id,
      restaurantId,
      shouldFavorite,
    });
    return {
      ok: false,
      message: `Không thể cập nhật nhà hàng yêu thích: ${detail}`,
    };
  }
  revalidatePath("/");
  revalidatePath("/restaurants");
  return { ok: true, message: shouldFavorite ? "Đã thêm vào nhà hàng yêu thích." : "Đã bỏ khỏi nhà hàng yêu thích." };
}
