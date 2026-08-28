"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SubmitCatalogReviewInput = {
  targetType: "restaurant" | "food";
  targetId: string;
  restaurantSlug: string;
  orderId: string;
  rating: number;
  comment: string;
};

export type SubmitCatalogReviewResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitCatalogReviewAction(
  input: SubmitCatalogReviewInput
): Promise<SubmitCatalogReviewResult> {
  await requireCurrentUser();
  const comment = input.comment.trim();
  if (!UUID.test(input.targetId) || !UUID.test(input.orderId) || !SLUG.test(input.restaurantSlug)) {
    return { ok: false, message: "Thông tin đánh giá không hợp lệ." };
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, message: "Vui lòng chọn từ 1 đến 5 sao." };
  }
  if (comment.length < 3 || comment.length > 1000) {
    return { ok: false, message: "Bình luận cần từ 3 đến 1.000 ký tự." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_order_id: input.orderId,
    p_restaurant_rating: input.targetType === "restaurant" ? input.rating : null,
    p_restaurant_comment: input.targetType === "restaurant" ? comment : null,
    p_shipper_rating: null,
    p_shipper_comment: null,
    p_food_reviews: input.targetType === "food"
      ? [{ food_id: input.targetId, rating: input.rating, comment }]
      : [],
  });
  if (error) {
    if (["22023", "23514", "42501", "P0002"].includes(error.code ?? "")) {
      return { ok: false, message: error.message };
    }
    console.error("submitCatalogReviewAction error:", error.message);
    return { ok: false, message: "Không thể lưu bình luận lúc này." };
  }

  updateTag("reviews");
  updateTag("restaurants");
  revalidatePath(`/restaurants/${input.restaurantSlug}`);
  if (input.targetType === "food") {
    revalidatePath(`/restaurants/${input.restaurantSlug}/foods/${input.targetId}`);
  }
  return { ok: true, message: "Đã lưu bình luận của bạn." };
}
