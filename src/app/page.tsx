import HomePage from "@/components/home/HomePage";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";

export default async function Home() {
  const [user, featuredRestaurants] = await Promise.all([
    getCurrentPublicUser(),
    getFeaturedRestaurants(),
  ]);

  const addresses =
    user && hasRole(user, "CUSTOMER") ? await getCurrentUserAddresses() : [];
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  return (
    <HomePage
      user={user}
      defaultDeliveryAddress={defaultAddress?.line1 ?? null}
      featuredRestaurants={featuredRestaurants}
    />
  );
}
