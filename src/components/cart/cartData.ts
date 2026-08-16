export type CartRestaurant = {
  id: string;
  slug: string;
  name: string;
};

export type CartItem = {
  id: string;
  foodId: string;
  name: string;
  plainName: string;
  price: number;
  quantity: number;
  image: string;
};

export const cartRestaurant: CartRestaurant = {
  id: "restaurant-com-tam-sau-hieu",
  slug: "com-tam-sau-hieu",
  name: "Cơm Tấm Sáu Hiếu",
};

export const mockCartItems: CartItem[] = [
  {
    id: "cart-item-com-tam-suon-bi-cha",
    foodId: "com-tam-suon-bi-cha",
    name: "Cơm tấm sườn bì chả",
    plainName: "Com tam suon bi cha",
    price: 65000,
    quantity: 1,
    image: "/images/home/food-com-tam.png",
  },
  {
    id: "cart-item-tra-dao",
    foodId: "tra-dao",
    name: "Trà đào",
    plainName: "Tra dao",
    price: 10000,
    quantity: 2,
    image: "/images/home/food-tra-dao.png",
  },
];

export const mockRestaurantNote = "Thêm mỡ hành";
export const mockDeliveryFee = 15000;
