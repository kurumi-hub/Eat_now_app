import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/restaurant/FoodDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getFoodReviewData, getReviewEligibleOrders } from "@/lib/data/reviews";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { getFoodFlashSale } from "@/lib/data/flashSales";

type FoodDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
    foodId: string;
  }>;
  searchParams: Promise<{ sale?: string | string[] }>;
};

export default async function FoodDetailRoute({ params, searchParams }: FoodDetailRouteProps) {
  const [{ restaurantId, foodId }, user, query] = await Promise.all([
    params,
    getCurrentPublicUser(),
    searchParams,
  ]);
  const restaurant = await getRestaurantDetailBySlug(restaurantId);

  if (!restaurant) notFound();

  const category = restaurant.menuCategories.find((item) =>
    item.items.some((food) => food.id === foodId)
  );
  const food = category?.items.find((item) => item.id === foodId);

  if (!food || !category) notFound();

  const requestedSale = Array.isArray(query.sale) ? query.sale[0] : query.sale;
  const [reviewData, reviewOrders, flashSale] = await Promise.all([
    getFoodReviewData(restaurant.slug, food.id),
    user ? getReviewEligibleOrders(restaurant.id, food.id) : Promise.resolve([]),
    getFoodFlashSale(food.id, requestedSale),
  ]);

  return (
    <FoodDetailPage
      restaurant={restaurant}
      food={food}
      categoryLabel={category.label}
      reviewData={reviewData}
      reviewOrders={reviewOrders}
      isAuthenticated={Boolean(user)}
      flashSale={flashSale}
    />
  );
}
