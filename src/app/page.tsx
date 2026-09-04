import HomePage from "@/components/home/HomePage";
import { getHomeCategories } from "@/lib/data/catalog";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getSiteMedia } from "@/lib/data/siteMedia";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentPublicUser();
  if (user && hasRole(user, "SHIPPER")) redirect("/shipper");

  const [categories, featuredRestaurants, siteMedia] = await Promise.all([
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
