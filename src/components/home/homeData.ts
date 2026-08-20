import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import RiceBowlOutlinedIcon from "@mui/icons-material/RiceBowlOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export type HomeCategory = {
  label: string;
  icon: SvgIconComponent;
};

export type HomeRestaurant = {
  slug: string;
  name: string;
  image: string;
  rating: string;
  time: string;
};

export type HomeFood = {
  name: string;
  image: string;
};

export type HomeFlashSaleItem = {
  name: string;
  image: string;
  discountLabel: string;
  price: number;
  originalPrice: number;
  sold: number;
  total: number;
};

export type HomeRecipe = {
  title: string;
  description: string;
  image: string;
};

export const homeHeroImage = "/images/home/hero.png";

export const homeCategories: HomeCategory[] = [
  { label: "Cơm", icon: RiceBowlOutlinedIcon },
  { label: "Phở", icon: RamenDiningOutlinedIcon },
  { label: "Bún", icon: SoupKitchenOutlinedIcon },
  { label: "Bánh mì", icon: BakeryDiningOutlinedIcon },
];

export const flashSaleItems: HomeFlashSaleItem[] = [
  {
    name: "Phở đặc biệt",
    image: "/images/home/food-pho.png",
    discountLabel: "-30%",
    price: 45000,
    originalPrice: 65000,
    sold: 12,
    total: 20,
  },
  {
    name: "Gỏi cuốn tôm thịt",
    image: "/images/home/food-goi-cuon.png",
    discountLabel: "-25%",
    price: 30000,
    originalPrice: 40000,
    sold: 15,
    total: 20,
  },
  {
    name: "Bánh mì thịt nướng",
    image: "/images/home/food-banh-mi.png",
    discountLabel: "-40%",
    price: 15000,
    originalPrice: 25000,
    sold: 18,
    total: 20,
  },
];

export const featuredRestaurants: HomeRestaurant[] = [
  {
    slug: "com-tam-sau-hieu",
    name: "Cơm Tấm Sáu Hiếu",
    image: "/images/home/restaurant-com-tam.png",
    rating: "4.8 (100+)",
    time: "20 - 30 phút",
  },
  {
    slug: "pho-2000-ninh-kieu",
    name: "Phở 2000 - Ninh Kiều",
    image: "/images/home/restaurant-pho.png",
    rating: "4.5 (200+)",
    time: "15 - 25 phút",
  },
  {
    slug: "bun-chu-hung",
    name: "Bún Chú Hùng",
    image: "/images/home/restaurant-bun.png",
    rating: "4.7 (80+)",
    time: "25 - 35 phút",
  },
  {
    slug: "tiem-banh-mi-goc-pho",
    name: "Tiệm Bánh Mì Góc Phố",
    image: "/images/home/restaurant-banh-mi.png",
    rating: "4.9 (150+)",
    time: "10 - 20 phút",
  },
];

export const nearbyFoods: HomeFood[] = [
  { name: "Cơm tấm sườn bì chả", image: "/images/home/food-com-tam.png" },
  { name: "Phở bò đặc biệt", image: "/images/home/food-pho.png" },
  { name: "Bún bò Huế", image: "/images/home/food-bun-bo.png" },
  { name: "Bánh mì thịt nướng", image: "/images/home/food-banh-mi.png" },
  { name: "Gỏi cuốn", image: "/images/home/food-goi-cuon.png" },
  { name: "Trà đào", image: "/images/home/food-tra-dao.png" },
];

export const recommendedRecipes: HomeRecipe[] = [
  {
    title: "Cơm tấm sườn nướng tại nhà",
    description:
      "Bí quyết ướp sườn mềm, thơm nức mũi như ngoài hàng.",
    image: "/images/home/recipe-com-tam.png",
  },
  {
    title: "Bí quyết nấu phở bò",
    description:
      "Cách hầm xương trong veo và dậy mùi thảo mộc đặc trưng.",
    image: "/images/home/recipe-pho.png",
  },
  {
    title: "Gỏi cuốn tôm thịt",
    description:
      "Món ăn thanh đạm, dễ làm với nước chấm tương đậu phộng.",
    image: "/images/home/recipe-goi-cuon.png",
  },
];
