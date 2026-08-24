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
  imageAlt: string;
  rating: string;
  time: string;
};

export type HomeFood = {
  name: string;
  image: string;
};

export const nearbyFoods: HomeFood[] = [
  { name: "Cơm tấm sườn bì chả", image: "/images/home/food-com-tam.png" },
  { name: "Phở bò đặc biệt", image: "/images/home/food-pho.png" },
  { name: "Bún bò Huế", image: "/images/home/food-bun-bo.png" },
  { name: "Bánh mì thịt nướng", image: "/images/home/food-banh-mi.png" },
  { name: "Gỏi cuốn", image: "/images/home/food-goi-cuon.png" },
  { name: "Trà đào", image: "/images/home/food-tra-dao.png" },
];

