import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import RiceBowlOutlinedIcon from "@mui/icons-material/RiceBowlOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export type RestaurantListCategory = {
  id: string;
  label: string;
  icon: SvgIconComponent;
};

export type RestaurantFilterId = "open" | "freeship" | "promotion" | "nearby";

export type RestaurantListItem = {
  slug: string;
  name: string;
  image: string;
  categoryIds: string[];
  rating: string;
  reviewCount: string;
  cuisine: string;
  deliveryTime: string;
  distance: string;
  distanceKm: number;
  deliveryFee: string;
  status: string;
  isOpen: boolean;
  hasFreeship: boolean;
  hasPromotion: boolean;
  closesAt?: string;
  tag?: string;
  tagTone?: "deal" | "shipping" | "favorite";
  detailAvailable?: boolean;
};

export type RestaurantSortId = "recommended" | "nearest" | "rating" | "fastest";

export type RestaurantListFilterState = {
  categoryId: string;
  filterIds: RestaurantFilterId[];
};

export const restaurantCategories: RestaurantListCategory[] = [
  { id: "pho", label: "Phở", icon: RamenDiningOutlinedIcon },
  { id: "banh-mi", label: "Bánh Mì", icon: BakeryDiningOutlinedIcon },
  { id: "com", label: "Cơm", icon: RiceBowlOutlinedIcon },
  { id: "bun", label: "Bún", icon: SoupKitchenOutlinedIcon },
  { id: "drinks", label: "Đồ uống", icon: LocalCafeOutlinedIcon },
  { id: "snacks", label: "Ăn vặt", icon: FastfoodOutlinedIcon },
  { id: "more", label: "Thêm", icon: MoreHorizOutlinedIcon },
];

export const restaurantSortOptions: Array<{
  id: RestaurantSortId;
  label: string;
}> = [
  { id: "recommended", label: "Đề xuất" },
  { id: "nearest", label: "Gần nhất" },
  { id: "rating", label: "Đánh giá cao nhất" },
  { id: "fastest", label: "Giao nhanh nhất" },
];

export const restaurantQuickFilters: Array<{
  id: RestaurantFilterId;
  label: string;
}> = [
  { id: "open", label: "Đang mở" },
  { id: "freeship", label: "Freeship" },
  { id: "promotion", label: "Khuyến mãi" },
  { id: "nearby", label: "Dưới 3km" },
];

export const restaurantListItems: RestaurantListItem[] = [
  {
    slug: "pho-2000-ninh-kieu",
    name: "Phở 2000 - Bến Thành",
    image: "/images/home/restaurant-pho.png",
    categoryIds: ["pho"],
    rating: "4.8",
    reviewCount: "500+",
    cuisine: "Phở, Điểm tâm",
    deliveryTime: "20-30 phút",
    distance: "1.2 km",
    distanceKm: 1.2,
    deliveryFee: "15.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    closesAt: "22:30",
    tag: "Giảm 20%",
    tagTone: "deal",
    detailAvailable: true,
  },
  {
    slug: "com-tam-sau-hieu",
    name: "Cơm Tấm Sáu Hiếu",
    image: "/images/home/restaurant-com-tam.png",
    categoryIds: ["com"],
    rating: "4.6",
    reviewCount: "300+",
    cuisine: "Cơm, Món Việt",
    deliveryTime: "15-25 phút",
    distance: "0.8 km",
    distanceKm: 0.8,
    deliveryFee: "Miễn phí giao hàng",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: true,
    hasPromotion: false,
    closesAt: "21:00",
    tag: "Free Ship",
    tagTone: "shipping",
    detailAvailable: true,
  },
  {
    slug: "tiem-banh-mi-goc-pho",
    name: "Bánh Mì Huỳnh Hoa",
    image: "/images/home/restaurant-banh-mi.png",
    categoryIds: ["banh-mi"],
    rating: "4.9",
    reviewCount: "999+",
    cuisine: "Bánh Mì, Ăn nhẹ",
    deliveryTime: "30-40 phút",
    distance: "2.5 km",
    distanceKm: 2.5,
    deliveryFee: "20.000đ phí giao",
    status: "Sắp đóng cửa",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: false,
    detailAvailable: true,
  },
  {
    slug: "phuc-long-coffee-tea",
    name: "Phúc Long Coffee & Tea",
    image: "/images/home/food-tra-dao.png",
    categoryIds: ["drinks"],
    rating: "4.7",
    reviewCount: "800+",
    cuisine: "Đồ uống, Trà sữa",
    deliveryTime: "10-20 phút",
    distance: "0.5 km",
    distanceKm: 0.5,
    deliveryFee: "15.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    closesAt: "22:00",
    tag: "Mua 1 Tặng 1",
    tagTone: "favorite",
  },
  {
    slug: "pho-thin-lo-duc",
    name: "Phở Thìn Lò Đúc",
    image: "/images/home/food-pho.png",
    categoryIds: ["pho"],
    rating: "4.9",
    reviewCount: "1.2k+",
    cuisine: "Phở, Đặc sản Hà Nội",
    deliveryTime: "25-35 phút",
    distance: "3.2 km",
    distanceKm: 3.2,
    deliveryFee: "15.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    closesAt: "21:00",
    tag: "Yêu thích",
    tagTone: "favorite",
  },
  {
    slug: "ga-ran-popeyes",
    name: "Gà Rán Popeyes",
    image: "/images/home/food-banh-mi.png",
    categoryIds: ["snacks"],
    rating: "4.5",
    reviewCount: "1.2k+",
    cuisine: "Gà rán, Fastfood",
    deliveryTime: "20-30 phút",
    distance: "2.1 km",
    distanceKm: 2.1,
    deliveryFee: "Miễn phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: true,
    hasPromotion: false,
    tag: "Freeship",
    tagTone: "shipping",
  },
  {
    slug: "the-pizza-company",
    name: "The Pizza Company",
    image: "/images/home/restaurant-com-tam.png",
    categoryIds: ["snacks"],
    rating: "4.6",
    reviewCount: "2k+",
    cuisine: "Pizza, Món Ý",
    deliveryTime: "30-45 phút",
    distance: "3.5 km",
    distanceKm: 3.5,
    deliveryFee: "25.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    tag: "Mua 1 Tặng 1",
    tagTone: "favorite",
  },
  {
    slug: "sushi-hokkaido-sachi",
    name: "Sushi Hokkaido Sachi",
    image: "/images/home/food-goi-cuon.png",
    categoryIds: ["snacks"],
    rating: "4.9",
    reviewCount: "850+",
    cuisine: "Sushi, Món Nhật",
    deliveryTime: "40-55 phút",
    distance: "4.2 km",
    distanceKm: 4.2,
    deliveryFee: "30.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: false,
  },
  {
    slug: "pizza-4ps-xuan-thuy",
    name: "Pizza 4P's - Xuân Thủy",
    image: "/images/home/recipe-com-tam.png",
    categoryIds: ["snacks"],
    rating: "4.8",
    reviewCount: "2.1k+",
    cuisine: "Pizza, Món Ý",
    deliveryTime: "30-45 phút",
    distance: "4.2 km",
    distanceKm: 4.2,
    deliveryFee: "25.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    closesAt: "22:00",
    tag: "Giảm 10%",
    tagTone: "deal",
  },
  {
    slug: "highlands-coffee-pho-co",
    name: "Highlands Coffee",
    image: "/images/home/restaurant-bun.png",
    categoryIds: ["drinks", "banh-mi"],
    rating: "4.5",
    reviewCount: "5k+",
    cuisine: "Cà phê, Bánh mì",
    deliveryTime: "15-20 phút",
    distance: "0.5 km",
    distanceKm: 0.5,
    deliveryFee: "Miễn phí giao hàng",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: true,
    hasPromotion: false,
    closesAt: "23:00",
    tag: "Freeship",
    tagTone: "shipping",
  },
  {
    slug: "bun-dau-mam-tom-chi-pheo",
    name: "Bún Đậu Mắm Tôm Chí Phèo",
    image: "/images/home/food-bun-bo.png",
    categoryIds: ["bun"],
    rating: "4.6",
    reviewCount: "280+",
    cuisine: "Bún đậu, Món Việt",
    deliveryTime: "20-30 phút",
    distance: "1.5 km",
    distanceKm: 1.5,
    deliveryFee: "15.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: false,
  },
  {
    slug: "highlands-coffee-center",
    name: "Highlands Coffee",
    image: "/images/home/food-tra-dao.png",
    categoryIds: ["drinks"],
    rating: "4.7",
    reviewCount: "3k+",
    cuisine: "Cà phê, Đồ uống",
    deliveryTime: "10-20 phút",
    distance: "0.7 km",
    distanceKm: 0.7,
    deliveryFee: "15.000đ phí giao",
    status: "Đang mở",
    isOpen: true,
    hasFreeship: false,
    hasPromotion: true,
    tag: "Mua 1 Tặng 1",
    tagTone: "favorite",
  },
];

function parseDistance(distance: string) {
  return Number(distance.replace(" km", ""));
}

function parseDeliveryStart(deliveryTime: string) {
  return Number(deliveryTime.split("-")[0]);
}

export function sortRestaurantListItems(
  items: RestaurantListItem[],
  sortId: RestaurantSortId
) {
  return [...items].sort((first, second) => {
    if (sortId === "nearest") {
      return (
        (first.distanceKm || parseDistance(first.distance)) -
        (second.distanceKm || parseDistance(second.distance))
      );
    }

    if (sortId === "rating") {
      return Number(second.rating) - Number(first.rating);
    }

    if (sortId === "fastest") {
      return parseDeliveryStart(first.deliveryTime) - parseDeliveryStart(second.deliveryTime);
    }

    return 0;
  });
}

export function filterRestaurantListItems(
  items: RestaurantListItem[],
  filters: RestaurantListFilterState
) {
  return items.filter((item) => {
    const matchesCategory = filters.categoryId
      ? item.categoryIds.includes(filters.categoryId)
      : true;

    const matchesQuickFilters = filters.filterIds.every((filterId) => {
      if (filterId === "open") {
        return item.isOpen;
      }

      if (filterId === "freeship") {
        return item.hasFreeship;
      }

      if (filterId === "promotion") {
        return item.hasPromotion;
      }

      return item.distanceKm <= 3;
    });

    return matchesCategory && matchesQuickFilters;
  });
}
