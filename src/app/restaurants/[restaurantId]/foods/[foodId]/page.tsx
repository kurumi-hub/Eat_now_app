import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/restaurant/FoodDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";

type FoodDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
    foodId: string;
  }>;
};

export default async function FoodDetailRoute({ params }: FoodDetailRouteProps) {
  const { restaurantId, foodId } = await params;
  const restaurant = await getRestaurantDetailBySlug(restaurantId);

  if (!restaurant) notFound();

  const category = restaurant.menuCategories.find((item) =>
    item.items.some((food) => food.id === foodId)
  );
  const food = category?.items.find((item) => item.id === foodId);

  if (!food || !category) notFound();

  return (
    <FoodDetailPage
      restaurant={restaurant}
      food={food}
      categoryLabel={category.label}
    />
  );
}
