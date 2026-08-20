import HomePage from "@/components/home/HomePage";
import { getHomeCategories } from "@/lib/data/catalog";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getSiteMedia } from "@/lib/data/siteMedia";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const [user, categories, featuredRestaurants, siteMedia] = await Promise.all([
    getCurrentPublicUser(),
    getHomeCategories(),
    getFeaturedRestaurants(),
    getSiteMedia(),
  ]);

  return (
    <HomePage
      user={user}
      categories={categories}
      featuredRestaurants={featuredRestaurants}
      heroImage={siteMedia.home_hero}
    />
  );
}
