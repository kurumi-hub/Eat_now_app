import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getReviewEligibleOrders } from "@/lib/data/reviews";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type RestaurantDetailRouteProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantDetailRoute({
  params,
}: RestaurantDetailRouteProps) {
  const [{ restaurantId }, user] = await Promise.all([
    params,
    getCurrentPublicUser(),
  ]);
  const restaurant = await getRestaurantDetailBySlug(restaurantId);

  if (!restaurant) {
    notFound();
  }

  const reviewOrders = user
    ? await getReviewEligibleOrders(restaurant.id)
    : [];

  return (
    <RestaurantDetailPage
      restaurant={restaurant}
      isAuthenticated={Boolean(user)}
      reviewOrders={reviewOrders}
    />
  );
}
