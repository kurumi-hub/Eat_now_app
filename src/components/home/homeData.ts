export type HomeCategory = {
  id: string;
  label: string;
  imageUrl?: string | null;
  altText: string;
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

