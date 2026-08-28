import "server-only";

import type {
  CatalogReview,
  FoodReviewData,
  ReviewEligibleOrder,
} from "@/components/restaurant/reviewData";
import { createPublicClient } from "@/utils/supabase/public";
import { createClient } from "@/utils/supabase/server";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function isMissingRpc(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST202" || error?.code === "42883";
}

export async function getReviewEligibleOrders(
  restaurantId: string,
  foodId?: string
): Promise<ReviewEligibleOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_review_eligibility", {
    p_restaurant_id: restaurantId,
    p_food_id: foodId ?? null,
  });
  if (error) {
    if (!isMissingRpc(error)) console.error("getReviewEligibleOrders error:", error.message);
    return [];
  }
  const source = record(data);
  return Array.isArray(source.orders) ? source.orders.flatMap((raw) => {
    const order = record(raw);
    const orderId = text(order.order_id);
    if (!orderId) return [];
    const existingRating = number(order.existing_rating);
    return [{
      orderId,
      code: text(order.code),
      completedAt: text(order.completed_at),
      existingRating: existingRating || undefined,
      existingComment: text(order.existing_comment) || undefined,
    }];
  }) : [];
}

export async function getFoodReviewData(
  restaurantSlug: string,
  foodId: string
): Promise<FoodReviewData> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_food_page_reviews", {
    p_restaurant_slug: restaurantSlug,
    p_food_id: foodId,
    p_limit: 10,
    p_offset: 0,
  });
  if (error) {
    if (!isMissingRpc(error)) console.error("getFoodReviewData error:", error.message);
    return { ratingAverage: 0, ratingCount: 0, reviews: [] };
  }
  const source = record(data);
  const reviews: CatalogReview[] = Array.isArray(source.reviews)
    ? source.reviews.flatMap((raw) => {
        const review = record(raw);
        const id = text(review.id);
        if (!id) return [];
        const customerName = text(review.customer_name) || "Khách hàng EatNow";
        return [{
          id,
          customerName,
          initial: customerName.trim().charAt(0).toUpperCase() || "E",
          rating: number(review.rating),
          content: text(review.comment) || "Khách hàng đã đánh giá món ăn.",
          createdAt: text(review.created_at),
        }];
      })
    : [];
  return {
    ratingAverage: number(source.rating_average),
    ratingCount: number(source.rating_count),
    reviews,
  };
}
