import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/restaurant/FoodDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getFoodReviewData, getReviewEligibleOrders } from "@/lib/data/reviews";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type FoodDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
    foodId: string;
  }>;
};

export default async function FoodDetailRoute({ params }: FoodDetailRouteProps) {
  const [{ restaurantId, foodId }, user] = await Promise.all([
    params,
    getCurrentPublicUser(),
  ]);
  const restaurant = await getRestaurantDetailBySlug(restaurantId);

  if (!restaurant) notFound();

  const category = restaurant.menuCategories.find((item) =>
    item.items.some((food) => food.id === foodId)
  );
  const food = category?.items.find((item) => item.id === foodId);

  if (!food || !category) notFound();

  const [reviewData, reviewOrders] = await Promise.all([
    getFoodReviewData(restaurant.slug, food.id),
    user ? getReviewEligibleOrders(restaurant.id, food.id) : Promise.resolve([]),
  ]);

  return (
    <FoodDetailPage
      restaurant={restaurant}
      food={food}
      categoryLabel={category.label}
      reviewData={reviewData}
      reviewOrders={reviewOrders}
      isAuthenticated={Boolean(user)}
    />
  );
}
