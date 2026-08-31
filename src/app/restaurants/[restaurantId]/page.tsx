import { notFound } from "next/navigation";

import RestaurantDetailPage from "@/components/restaurant/RestaurantDetailPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
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
  const restaurant = await getRestaurantDetailBySlug(restaurantId);
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  if (!restaurant) {
    notFound();
  }

  return (
    <RestaurantDetailPage
      restaurant={restaurant}
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    />
  );
}
