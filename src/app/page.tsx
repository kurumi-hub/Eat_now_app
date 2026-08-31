import BeforeLoginHomePage from "@/components/home/BeforeLoginHomePage";
import HomePage from "@/components/home/HomePage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  if (!user) {
    return <BeforeLoginHomePage deliveryLocationLabel={deliveryLocationLabel} />;
  }

  const featuredRestaurants = await getFeaturedRestaurants();

  return <HomePage user={user} featuredRestaurants={featuredRestaurants} deliveryLocationLabel={deliveryLocationLabel} />;
}
