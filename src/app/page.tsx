import BeforeLoginHomePage from "@/components/home/BeforeLoginHomePage";
import HomePage from "@/components/home/HomePage";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const user = await getCurrentPublicUser();

  if (!user) {
    return <BeforeLoginHomePage />;
  }

  const featuredRestaurants = await getFeaturedRestaurants();

  return <HomePage user={user} featuredRestaurants={featuredRestaurants} />;
}
