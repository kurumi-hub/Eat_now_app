export type FoodSize = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
};

export type ToppingGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  toppings: Topping[];
};

export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  sizes?: FoodSize[];
  toppingGroups?: ToppingGroup[];
};

export type RestaurantMenuCategory = {
  id: string;
  label: string;
  items: RestaurantMenuItem[];
};

export type RestaurantVoucher = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
};

export type RestaurantReview = {
  id: string;
  customerName: string;
  initial: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type RestaurantDetail = {
  id: string;
  slug: string;
  name: string;
  image: string;
  rating: string;
  reviewCount: string;
  address: string;
  deliveryTime: string;
  deliveryFee: string;
  isOpen: boolean;
  orderState?: string;
  acceptingOrders?: boolean;
  availabilityLabel?: string;
  availabilityMessage?: string;
  openUntil: string;
  description?: string;
  restaurantVouchers?: RestaurantVoucher[];
  restaurantReviews?: RestaurantReview[];
  menuCategories: RestaurantMenuCategory[];
};

export const restaurantDetails: RestaurantDetail[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "com-tam-sau-hieu",
    name: "Cơm Tấm Sáu Hiếu",
    image: "/images/home/restaurant-com-tam.png",
    rating: "4.8",
    reviewCount: "1.2k+ đánh giá",
    address: "123 Đường 30/4, Ninh Kiều, Cần Thơ",
    deliveryTime: "25-35 phút",
    deliveryFee: "Miễn phí giao hàng",
    isOpen: true,
    openUntil: "21:30",
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        items: [
          {
            id: "com-tam-suon-bi-cha",
            name: "Cơm tấm sườn bì chả",
            description:
              "Sườn nướng than hoa, bì thính thủ công, chả trứng hấp mềm mịn. Kèm đồ chua và nước mắm chua ngọt đặc trưng.",
            price: 65000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
            isPopular: true,
          },
          {
            id: "com-tam-suon-op-la",
            name: "Cơm tấm sườn ốp la",
            description:
              "Sườn heo nướng mềm mọng, trứng ốp la lòng đào béo ngậy. Chuẩn vị truyền thống miền Tây.",
            price: 55000,
            image: "/images/home/restaurant-com-tam.png",
            isAvailable: true,
            isPopular: true,
          },
        ],
      },
      {
        id: "traditional",
        label: "Cơm Tấm Tradi",
        items: [
          {
            id: "com-tam-dui-ga",
            name: "Cơm tấm đùi gà nướng",
            description:
              "Đùi gà ướp mật ong, nướng da giòn nhẹ, ăn cùng cơm tấm, mỡ hành và đồ chua.",
            price: 59000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
          },
          {
            id: "com-tam-cha-trung",
            name: "Cơm tấm chả trứng",
            description:
              "Chả trứng hấp thơm béo, cơm tấm nóng, dưa leo, cà chua và nước mắm nhà làm.",
            price: 45000,
            image: "/images/home/recipe-com-tam.png",
            isAvailable: true,
          },
        ],
      },
      {
        id: "extras",
        label: "Món Thêm",
        items: [
          {
            id: "them-suon",
            name: "Thêm sườn nướng",
            description:
              "Một miếng sườn nướng than hoa phủ mỡ hành, hợp để gọi thêm khi đói.",
            price: 32000,
            image: "/images/home/food-banh-mi.png",
            isAvailable: true,
          },
          {
            id: "cha-trung-them",
            name: "Chả trứng thêm",
            description: "Miếng chả trứng mềm thơm, cắt dày vừa ăn.",
            price: 18000,
            image: "/images/home/recipe-com-tam.png",
            isAvailable: false,
          },
        ],
      },
      {
        id: "drinks",
        label: "Đồ Uống",
        items: [
          {
            id: "tra-dao-cam-sa",
            name: "Trà đào cam sả",
            description:
              "Trà đào mát, hương sả nhẹ, phù hợp ăn cùng món nướng.",
            price: 28000,
            image: "/images/home/food-tra-dao.png",
            isAvailable: true,
          },
        ],
      },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "pho-2000-ninh-kieu",
    name: "Phở 2000 - Ninh Kiều",
    image: "/images/home/restaurant-pho.png",
    rating: "4.5",
    reviewCount: "200+ đánh giá",
    address: "45 Hai Bà Trưng, Ninh Kiều, Cần Thơ",
    deliveryTime: "15-25 phút",
    deliveryFee: "12.000 đ",
    isOpen: true,
    openUntil: "22:00",
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        items: [
          {
            id: "pho-bo-dac-biet",
            name: "Phở bò đặc biệt",
            description: "Nước dùng trong, bò tái nạm gầu, rau thơm và chanh ớt.",
            price: 69000,
            image: "/images/home/food-pho.png",
            isAvailable: true,
            isPopular: true,
          },
        ],
      },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "bun-chu-hung",
    name: "Bún Chú Hùng",
    image: "/images/home/restaurant-bun.png",
    rating: "4.7",
    reviewCount: "80+ đánh giá",
    address: "18 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
    deliveryTime: "25-35 phút",
    deliveryFee: "10.000 đ",
    isOpen: true,
    openUntil: "20:30",
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        items: [
          {
            id: "bun-bo-hue",
            name: "Bún bò Huế",
            description: "Nước dùng đậm vị, chả cua, bò mềm và rau sống tươi.",
            price: 62000,
            image: "/images/home/food-bun-bo.png",
            isAvailable: true,
            isPopular: true,
          },
        ],
      },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "tiem-banh-mi-goc-pho",
    name: "Tiệm Bánh Mì Góc Phố",
    image: "/images/home/restaurant-banh-mi.png",
    rating: "4.9",
    reviewCount: "150+ đánh giá",
    address: "72 Mậu Thân, Ninh Kiều, Cần Thơ",
    deliveryTime: "10-20 phút",
    deliveryFee: "8.000 đ",
    isOpen: true,
    openUntil: "19:30",
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        items: [
          {
            id: "banh-mi-thit-nuong",
            name: "Bánh mì thịt nướng",
            description:
              "Bánh mì giòn, thịt nướng thơm, rau dưa và nước sốt đậm đà.",
            price: 32000,
            image: "/images/home/food-banh-mi.png",
            isAvailable: true,
            isPopular: true,
          },
        ],
      },
    ],
  },
];

export function getRestaurantDetailBySlug(slug: string) {
  return restaurantDetails.find((restaurant) => restaurant.slug === slug);
}
