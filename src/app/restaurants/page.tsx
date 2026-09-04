import RestaurantsPage from "@/components/restaurant/RestaurantsPage";
import type {
  RestaurantFilterId,
  RestaurantSortId,
  ViewerLocation,
} from "@/components/restaurant/restaurantPageData";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { getRestaurantDirectory } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";

type RestaurantsRouteProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    open?: string | string[];
    freeship?: string | string[];
    promotion?: string | string[];
    nearby?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    lat?: string | string[];
    lon?: string | string[];
  }>;
};

const first = (value?: string | string[]) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

function coordinate(value: string, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export default async function RestaurantsRoute({ searchParams }: RestaurantsRouteProps) {
  const [params, user] = await Promise.all([
    searchParams,
    getCurrentPublicUser(),
  ]);
  const addresses = user && hasRole(user, "CUSTOMER")
    ? await getCurrentUserAddresses()
    : [];
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const savedLocation: ViewerLocation | null =
    typeof defaultAddress?.lat === "number" && typeof defaultAddress?.lon === "number"
      ? { lat: defaultAddress.lat, lon: defaultAddress.lon }
      : null;
  const urlLat = coordinate(first(params.lat), -90, 90);
  const urlLon = coordinate(first(params.lon), -180, 180);
  const initialLocation = urlLat !== null && urlLon !== null
    ? { lat: urlLat, lon: urlLon }
    : savedLocation;
  const initialSearch = first(params.q);
  const initialCategoryId = first(params.category);
  const initialFilterIds: RestaurantFilterId[] = [
    ...(first(params.open) === "1" ? ["open" as const] : []),
    ...(first(params.freeship) === "1" ? ["freeship" as const] : []),
    ...(first(params.promotion) === "1" ? ["promotion" as const] : []),
    ...(first(params.nearby) === "1" ? ["nearby" as const] : []),
  ];
  const requestedSort = first(params.sort);
  const initialSort: RestaurantSortId =
    requestedSort === "nearest" || requestedSort === "rating"
      ? requestedSort
      : "recommended";
  const requestedPage = Number.parseInt(first(params.page), 10);
  const initialPage = Number.isFinite(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const data = await getRestaurantDirectory({
    search: initialSearch,
    categoryId: initialCategoryId,
    openOnly: initialFilterIds.includes("open"),
    freeshipOnly: initialFilterIds.includes("freeship"),
    promotionOnly: initialFilterIds.includes("promotion"),
    lat: initialLocation?.lat,
    lon: initialLocation?.lon,
    maxDistanceKm: initialFilterIds.includes("nearby") ? 3 : null,
    sort: initialSort,
    page: initialPage,
    pageSize: 12,
  });

  return (
    <RestaurantsPage
      data={data}
      initialLocation={initialLocation}
      initialCategoryId={initialCategoryId}
      initialSearch={initialSearch}
      initialFilterIds={initialFilterIds}
      initialSort={initialSort}
      initialPage={initialPage}
    />
  );
}
