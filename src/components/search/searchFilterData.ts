export type SearchResultType = "food" | "restaurant";

export type PriceFilterId = "under-50" | "50-100" | "over-100";

export type AreaFilterId = "ninh-kieu" | "cai-rang" | "binh-thuy";

export type SortOptionId = "rating" | "nearest" | "price-low" | "price-high";

export type SearchResultItem = {
  id: string;
  type: SearchResultType;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: number;
  restaurantName: string;
  restaurantSlug?: string;
  district: AreaFilterId;
  districtLabel: string;
  deliveryMinutes: number;
  isOpen: boolean;
};

export type SearchFilterState = {
  query: string;
  type: SearchResultType;
  openOnly: boolean;
  priceIds: PriceFilterId[];
  areaIds: AreaFilterId[];
  sort: SortOptionId;
};

export const priceFilters: Array<{
  id: PriceFilterId;
  label: string;
  shortLabel: string;
  min: number;
  max?: number;
}> = [
  {
    id: "under-50",
    label: "Dưới 50.000đ",
    shortLabel: "Dưới 50k",
    min: 0,
    max: 49999,
  },
  {
    id: "50-100",
    label: "50.000đ - 100.000đ",
    shortLabel: "50k - 100k",
    min: 50000,
    max: 100000,
  },
  {
    id: "over-100",
    label: "Trên 100.000đ",
    shortLabel: "Trên 100k",
    min: 100001,
  },
];

export const areaFilters: Array<{
  id: AreaFilterId;
  label: string;
}> = [
  { id: "ninh-kieu", label: "Ninh Kiều" },
  { id: "cai-rang", label: "Cái Răng" },
  { id: "binh-thuy", label: "Bình Thủy" },
];

export const sortOptions: Array<{
  id: SortOptionId;
  label: string;
}> = [
  { id: "rating", label: "Đánh giá cao nhất" },
  { id: "nearest", label: "Gần nhất" },
  { id: "price-low", label: "Giá thấp đến cao" },
  { id: "price-high", label: "Giá cao đến thấp" },
];

export const searchResultItems: SearchResultItem[] = [
  {
    id: "bun-bo-dac-biet",
    type: "food",
    name: "Bún Bò Đặc Biệt",
    description:
      "Bún bò nước trong thanh ngọt, thịt bò mềm, chả cua dai ngon, kèm rau sống tươi xanh.",
    image: "/images/home/food-bun-bo.png",
    rating: 4.8,
    price: 65000,
    restaurantName: "Bún Chú Hùng - Ninh Kiều",
    restaurantSlug: "bun-chu-hung",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 25,
    isOpen: true,
  },
  {
    id: "pho-tai-nam",
    type: "food",
    name: "Phở Tái Nạm",
    description:
      "Nước dùng hầm xương 24h, thịt nạm mềm, gân giòn, hương vị chuẩn truyền thống.",
    image: "/images/home/food-pho.png",
    rating: 4.5,
    price: 55000,
    restaurantName: "Phở 2000 - Ninh Kiều",
    restaurantSlug: "pho-2000-ninh-kieu",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 18,
    isOpen: true,
  },
  {
    id: "bun-gio-heo",
    type: "food",
    name: "Bún Giò Heo",
    description:
      "Giò heo hầm rục mềm mịn, nước lèo đậm đà hương sả ruốc.",
    image: "/images/home/restaurant-bun.png",
    rating: 4.9,
    price: 70000,
    restaurantName: "Bún Chú Hùng - Ninh Kiều",
    restaurantSlug: "bun-chu-hung",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 30,
    isOpen: true,
  },
  {
    id: "com-tam-suon-bi-cha",
    type: "food",
    name: "Cơm tấm sườn bì chả",
    description:
      "Sườn nướng than hoa, bì thính thủ công, chả trứng hấp mềm mịn.",
    image: "/images/home/food-com-tam.png",
    rating: 4.8,
    price: 65000,
    restaurantName: "Cơm Tấm Sáu Hiếu",
    restaurantSlug: "com-tam-sau-hieu",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 28,
    isOpen: true,
  },
  {
    id: "banh-mi-thit-nuong",
    type: "food",
    name: "Bánh mì thịt nướng",
    description:
      "Bánh mì giòn, thịt nướng thơm, rau dưa và nước sốt đậm đà.",
    image: "/images/home/food-banh-mi.png",
    rating: 4.7,
    price: 32000,
    restaurantName: "Tiệm Bánh Mì Góc Phố",
    restaurantSlug: "tiem-banh-mi-goc-pho",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 15,
    isOpen: true,
  },
  {
    id: "lau-mam-cai-rang",
    type: "food",
    name: "Lẩu mắm Cái Răng",
    description:
      "Nồi lẩu mắm miền Tây đậm vị, rau đồng tươi và cá linh theo mùa.",
    image: "/images/home/restaurant-com-tam.png",
    rating: 4.4,
    price: 129000,
    restaurantName: "Quán Lẩu Miền Tây",
    district: "cai-rang",
    districtLabel: "Cái Răng",
    deliveryMinutes: 42,
    isOpen: false,
  },
  {
    id: "bun-chu-hung-restaurant",
    type: "restaurant",
    name: "Bún Chú Hùng",
    description:
      "Quán bún bò, bún giò heo và món nước miền Trung được yêu thích tại Ninh Kiều.",
    image: "/images/home/restaurant-bun.png",
    rating: 4.7,
    price: 65000,
    restaurantName: "Bún Chú Hùng",
    restaurantSlug: "bun-chu-hung",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 25,
    isOpen: true,
  },
  {
    id: "pho-2000-restaurant",
    type: "restaurant",
    name: "Phở 2000 - Ninh Kiều",
    description:
      "Phở bò nước dùng trong, phục vụ nhanh cho bữa sáng và bữa tối.",
    image: "/images/home/restaurant-pho.png",
    rating: 4.5,
    price: 55000,
    restaurantName: "Phở 2000 - Ninh Kiều",
    restaurantSlug: "pho-2000-ninh-kieu",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 18,
    isOpen: true,
  },
  {
    id: "com-tam-sau-hieu-restaurant",
    type: "restaurant",
    name: "Cơm Tấm Sáu Hiếu",
    description:
      "Cơm tấm sườn nướng, chả trứng và món thêm chuẩn vị miền Tây.",
    image: "/images/home/restaurant-com-tam.png",
    rating: 4.8,
    price: 65000,
    restaurantName: "Cơm Tấm Sáu Hiếu",
    restaurantSlug: "com-tam-sau-hieu",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 28,
    isOpen: true,
  },
  {
    id: "banh-mi-goc-pho-restaurant",
    type: "restaurant",
    name: "Tiệm Bánh Mì Góc Phố",
    description:
      "Bánh mì thịt nướng, pate nhà làm và trà đào giao nhanh.",
    image: "/images/home/restaurant-banh-mi.png",
    rating: 4.9,
    price: 32000,
    restaurantName: "Tiệm Bánh Mì Góc Phố",
    restaurantSlug: "tiem-banh-mi-goc-pho",
    district: "ninh-kieu",
    districtLabel: "Ninh Kiều",
    deliveryMinutes: 15,
    isOpen: true,
  },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesPriceFilter(price: number, filterId: PriceFilterId) {
  const filter = priceFilters.find((item) => item.id === filterId);

  if (!filter) {
    return false;
  }

  return price >= filter.min && (filter.max === undefined || price <= filter.max);
}

export function formatSearchCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function filterSearchResults(
  items: SearchResultItem[],
  filters: SearchFilterState
) {
  const normalizedQuery = normalizeText(filters.query);

  return items.filter((item) => {
    const content = normalizeText(
      [
        item.name,
        item.description,
        item.restaurantName,
        item.districtLabel,
      ].join(" ")
    );
    const matchesQuery = normalizedQuery ? content.includes(normalizedQuery) : true;
    const matchesType = item.type === filters.type;
    const matchesOpen = filters.openOnly ? item.isOpen : true;
    const matchesPrice =
      filters.priceIds.length === 0 ||
      filters.priceIds.some((filterId) => matchesPriceFilter(item.price, filterId));
    const matchesArea =
      filters.areaIds.length === 0 || filters.areaIds.includes(item.district);

    return matchesQuery && matchesType && matchesOpen && matchesPrice && matchesArea;
  });
}

export function sortSearchResults(
  items: SearchResultItem[],
  sortId: SortOptionId
) {
  return [...items].sort((first, second) => {
    if (sortId === "nearest") {
      return first.deliveryMinutes - second.deliveryMinutes;
    }

    if (sortId === "price-low") {
      return first.price - second.price;
    }

    if (sortId === "price-high") {
      return second.price - first.price;
    }

    return second.rating - first.rating;
  });
}

export function getFilterLabel(id: PriceFilterId | AreaFilterId) {
  const priceFilter = priceFilters.find((filter) => filter.id === id);

  if (priceFilter) {
    return priceFilter.shortLabel;
  }

  return areaFilters.find((filter) => filter.id === id)?.label || id;
}
