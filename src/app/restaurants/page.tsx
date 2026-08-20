import RestaurantsPage from "@/components/restaurant/RestaurantsPage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function RestaurantsRoute() {
  const user = await getCurrentPublicUser();

  return <RestaurantsPage user={user} />;
}
