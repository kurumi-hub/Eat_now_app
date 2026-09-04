export type RestaurantFilterId = "open" | "freeship" | "promotion" | "nearby";

export type RestaurantSortId = "recommended" | "nearest" | "rating";

export type RestaurantListCategory = {
  id: string;
  label: string;
};

export type RestaurantListItem = {
  id: string;
  slug: string;
  name: string;
  address: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
  categoryIds: string[];
  categoryLabels: string[];
  orderState: string;
  availabilityLabel: string;
  closesAt: string;
  lat: number | null;
  lon: number | null;
  hasPromotion: boolean;
  hasFreeship: boolean;
  matchedFoods: string[];
};

export type RestaurantDirectory = {
  items: RestaurantListItem[];
  categories: RestaurantListCategory[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loadError?: string;
};

export type ViewerLocation = {
  lat: number;
  lon: number;
};

export const restaurantQuickFilters: Array<{
  id: RestaurantFilterId;
  label: string;
}> = [
  { id: "open", label: "Đang mở" },
  { id: "freeship", label: "Freeship" },
  { id: "promotion", label: "Khuyến mãi" },
  { id: "nearby", label: "Dưới 3 km" },
];

export const restaurantSortOptions: Array<{
  id: RestaurantSortId;
  label: string;
}> = [
  { id: "recommended", label: "Đề xuất" },
  { id: "nearest", label: "Gần nhất" },
  { id: "rating", label: "Đánh giá cao nhất" },
];

export function distanceKm(
  from: ViewerLocation | null,
  restaurant: Pick<RestaurantListItem, "lat" | "lon">
) {
  if (!from || restaurant.lat === null || restaurant.lon === null) return null;
  const radians = (value: number) => (value * Math.PI) / 180;
  const latDelta = radians(restaurant.lat - from.lat);
  const lonDelta = radians(restaurant.lon - from.lon);
  const startLat = radians(from.lat);
  const endLat = radians(restaurant.lat);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function estimatedDeliveryMinutes(distance: number | null) {
  if (distance === null) return "20-30 phút";
  const start = Math.max(15, Math.round(14 + distance * 3));
  return `${start}-${start + 10} phút`;
}

export function estimatedShippingFee(distance: number | null) {
  if (distance === null) return "Tính khi chọn địa chỉ";
  const fee = Math.min(15000 + Math.max(distance - 2, 0) * 5000, 60000);
  return `${Math.ceil(fee / 1000) * 1000}`;
}
