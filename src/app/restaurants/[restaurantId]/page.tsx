import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getRestaurantDetailBySlug } from "@/components/restaurant/restaurantDetailData";
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
  const restaurant = getRestaurantDetailBySlug(restaurantId);
  const user = await getCurrentPublicUser();

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailPage restaurant={restaurant} user={user} />;
}
