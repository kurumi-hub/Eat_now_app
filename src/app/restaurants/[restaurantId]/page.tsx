import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type RestaurantDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantDetailRoute({
  params,
}: RestaurantDetailRouteProps) {
  const { restaurantId } = await params;
  const [restaurant, user] = await Promise.all([
    getRestaurantDetailBySlug(restaurantId),
    getCurrentPublicUser(),
  ]);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailPage restaurant={restaurant} user={user} />;
}
