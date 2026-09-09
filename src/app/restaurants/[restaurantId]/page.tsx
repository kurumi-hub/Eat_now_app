import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getReviewEligibleOrders } from "@/lib/data/reviews";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { getIsFavoriteRestaurant } from "@/lib/data/favoriteRestaurants";

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
  const isFavorite = user
    ? await getIsFavoriteRestaurant(user.id, restaurant.id)
    : false;

  return (
    <RestaurantDetailPage
      restaurant={restaurant}
      isAuthenticated={Boolean(user)}
      initialIsFavorite={isFavorite}
      reviewOrders={reviewOrders}
    />
  );
}
