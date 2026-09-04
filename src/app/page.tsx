import HomePage from "@/components/home/HomePage";
import { getHomeCategories } from "@/lib/data/catalog";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getSiteMedia } from "@/lib/data/siteMedia";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";
import { redirect } from "next/navigation";

type HomeProps = {
  searchParams: Promise<{ home?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [user, params] = await Promise.all([getCurrentPublicUser(), searchParams]);
  const explicitHome = Array.isArray(params.home) ? params.home[0] : params.home;
  if (user && hasRole(user, "SHIPPER") && explicitHome !== "1") redirect("/shipper");

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
