import HomePage from "@/components/home/HomePage";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getSiteMedia } from "@/lib/data/siteMedia";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const [user, featuredRestaurants, siteMedia] = await Promise.all([
    getCurrentPublicUser(),
    getFeaturedRestaurants(),
    getSiteMedia(),
  ]);

  return (
    <HomePage
      user={user}
      featuredRestaurants={featuredRestaurants}
      heroImage={siteMedia.home_hero}
    />
  );
}
