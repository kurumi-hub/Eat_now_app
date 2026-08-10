import HomePage from "@/components/home/HomePage";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const [user, featuredRestaurants] = await Promise.all([
    getCurrentPublicUser(),
    getFeaturedRestaurants(),
  ]);

  return <HomePage user={user} featuredRestaurants={featuredRestaurants} />;
}
