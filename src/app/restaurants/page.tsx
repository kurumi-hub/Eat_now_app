import RestaurantsPage from "@/components/restaurant/RestaurantsPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function RestaurantsRoute() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <RestaurantsPage
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    />
  );
}
