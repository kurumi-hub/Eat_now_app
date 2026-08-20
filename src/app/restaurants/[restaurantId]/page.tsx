import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";

type RestaurantDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantDetailRoute({
  params,
}: RestaurantDetailRouteProps) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantDetailBySlug(restaurantId);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailPage restaurant={restaurant} />;
}
