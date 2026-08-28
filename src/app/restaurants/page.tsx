import RestaurantsPage from "@/components/restaurant/RestaurantsPage";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { getRestaurantDirectory } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";

type RestaurantsRouteProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function RestaurantsRoute({ searchParams }: RestaurantsRouteProps) {
  const [params, user, data] = await Promise.all([
    searchParams,
    getCurrentPublicUser(),
    getRestaurantDirectory(),
  ]);
  const addresses = user && hasRole(user, "CUSTOMER")
    ? await getCurrentUserAddresses()
    : [];
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const initialLocation =
    typeof defaultAddress?.lat === "number" && typeof defaultAddress?.lon === "number"
      ? { lat: defaultAddress.lat, lon: defaultAddress.lon }
      : null;

  return (
    <RestaurantsPage
      data={data}
      user={user}
      initialLocation={initialLocation}
      initialCategoryId={params.category?.trim() ?? ""}
      initialSearch={params.q?.trim() ?? ""}
    />
  );
}
