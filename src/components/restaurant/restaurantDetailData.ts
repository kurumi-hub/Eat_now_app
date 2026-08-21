export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  sale?: RestaurantMenuSale;
  customization?: RestaurantMenuCustomization;
  placeholderIcon?: "local_drink" | "local_bar" | "water_drop" | "coffee";
};

export type RestaurantMenuSale = {
  discountLabel: string;
  discountPercent: number;
  originalPrice: number;
  sold: number;
  total: number;
};

export type RestaurantMenuOption = {
  id: string;
  label: string;
  priceDelta: number;
};

export type RestaurantMenuCustomization = {
  defaultSizeId: string;
  sizeOptions: RestaurantMenuOption[];
  toppingOptions: RestaurantMenuOption[];
  preferenceOptions: RestaurantMenuOption[];
  notePlaceholder: string;
};

export type RestaurantMenuCategory = {
  id: string;
  label: string;
  layout?: "horizontal" | "compact";
  items: RestaurantMenuItem[];
};

export type RestaurantVoucher = {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
};

export type RestaurantReview = {
  id: string;
  customerName: string;
  initial: string;
  rating: number;
  timeAgo: string;
  content: string;
  tone: "primary" | "secondary" | "tertiary";
};

export type RestaurantInfoItem = {
  id: string;
  icon: "location_on" | "schedule" | "two_wheeler";
  title: string;
  description: string;
};

export type RestaurantDetail = {
  slug: string;
  name: string;
  image: string;
  rating: string;
  reviewCount: string;
  address: string;
  deliveryTime: string;
  deliveryFee: string;
  minimumOrder: string;
  isOpen: boolean;
  openUntil: string;
  restaurantVouchers: RestaurantVoucher[];
  restaurantReviews: RestaurantReview[];
  restaurantInfoItems: RestaurantInfoItem[];
  menuCategories: RestaurantMenuCategory[];
};

const defaultReviews: RestaurantReview[] = [
  {
    id: "tuan-anh",
    customerName: "Tuấn Anh",
    initial: "T",
    rating: 5,
    timeAgo: "2 ngày trước",
    content:
      "Sườn nướng rất vừa miệng, không bị khô. Nước mắm chua ngọt pha chuẩn vị Cần Thơ. Sẽ ủng hộ quán dài dài!",
    tone: "primary",
  },
  {
    id: "mai-lan",
    customerName: "Mai Lan",
    initial: "M",
    rating: 4.5,
    timeAgo: "1 tuần trước",
    content:
      "Giao hàng nhanh, cơm vẫn còn nóng hổi. Phần đặc biệt ăn no căng bụng luôn, chả trứng siêu ngon.",
    tone: "secondary",
  },
  {
    id: "hoang-nam",
    customerName: "Hoàng Nam",
    initial: "H",
    rating: 5,
    timeAgo: "2 tuần trước",
    content:
      "Quán ruột từ hồi sinh viên tới giờ. Chất lượng vẫn ổn định, giá cả hợp lý so với mặt bằng chung.",
    tone: "tertiary",
  },
];

const defaultInfoItems: RestaurantInfoItem[] = [
  {
    id: "address",
    icon: "location_on",
    title: "Địa chỉ",
    description:
      "123 Đường 30/4, Phường Hưng Lợi, Quận Ninh Kiều, TP. Cần Thơ",
  },
  {
    id: "hours",
    icon: "schedule",
    title: "Giờ hoạt động",
    description: "Thứ 2 - Chủ Nhật: 06:00 - 22:00",
  },
  {
    id: "shipping",
    icon: "two_wheeler",
    title: "Giao hàng",
    description:
      "Phí giao hàng: 15,000đ (Dưới 3km), Freeship cho đơn từ 50,000đ",
  },
];

const defaultVouchers: RestaurantVoucher[] = [
  {
    id: "save-20k",
    title: "GIẢM 20K",
    subtitle: "Đơn từ 99K",
    actionLabel: "Lưu mã",
  },
  {
    id: "freeship",
    title: "FREESHIP",
    subtitle: "Đơn từ 50K",
    actionLabel: "Lưu mã",
  },
  {
    id: "save-15-percent",
    title: "GIẢM 15%",
    subtitle: "Tối đa 30K",
    actionLabel: "Lưu mã",
  },
];

export type RestaurantFlashSaleCampaign = {
  foodId: string;
  discountPercent: number;
  sold: number;
  total: number;
};

export const restaurantFlashSaleCampaigns: RestaurantFlashSaleCampaign[] = [
  {
    foodId: "pho-bo-dac-biet",
    discountPercent: 30,
    sold: 12,
    total: 20,
  },
  {
    foodId: "com-tam-dac-biet",
    discountPercent: 25,
    sold: 15,
    total: 20,
  },
  {
    foodId: "banh-mi-thit-nuong",
    discountPercent: 40,
    sold: 18,
    total: 20,
  },
];

function getOriginalFlashPrice(price: number, discountPercent: number) {
  const originalPrice = price / (1 - discountPercent / 100);

  return Math.ceil(originalPrice / 1000) * 1000;
}

export function getRestaurantMenuSaleForItem({
  foodId,
  name = "",
  categoryName = "",
  price,
  campaigns = restaurantFlashSaleCampaigns,
}: {
  foodId: string;
  name?: string | null;
  categoryName?: string | null;
  price: number;
  campaigns?: RestaurantFlashSaleCampaign[];
}): RestaurantMenuSale | undefined {
  const searchable = normalizeMenuText(`${foodId} ${name ?? ""} ${categoryName ?? ""}`);
  const campaign = campaigns.find((item) => {
    const campaignKey = normalizeMenuText(item.foodId);

    return item.foodId === foodId || searchable.includes(campaignKey);
  });

  if (!campaign) return undefined;

  return {
    discountLabel: `-${campaign.discountPercent}%`,
    discountPercent: campaign.discountPercent,
    originalPrice: getOriginalFlashPrice(price, campaign.discountPercent),
    sold: campaign.sold,
    total: campaign.total,
  };
}

const ricePreferenceOptions: RestaurantMenuOption[] = [
  { id: "it-com", label: "Ít cơm", priceDelta: 0 },
  { id: "khong-hanh", label: "Không hành", priceDelta: 0 },
  { id: "them-do-chua", label: "Thêm đồ chua", priceDelta: 0 },
  { id: "nuoc-mam-rieng", label: "Nước mắm riêng", priceDelta: 0 },
];

const riceCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "m",
  sizeOptions: [
    { id: "s", label: "S", priceDelta: 0 },
    { id: "m", label: "M", priceDelta: 10000 },
    { id: "l", label: "L", priceDelta: 20000 },
  ],
  toppingOptions: [
    { id: "trung-op-la", label: "Trứng ốp la", priceDelta: 10000 },
    { id: "bi", label: "Bì", priceDelta: 12000 },
    { id: "cha-trung", label: "Chả trứng", priceDelta: 15000 },
    { id: "lap-xuong", label: "Lạp xưởng", priceDelta: 20000 },
  ],
  preferenceOptions: ricePreferenceOptions,
  notePlaceholder: "Ít cơm, không hành, thêm nước mắm...",
};

const noodleCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "regular",
  sizeOptions: [
    { id: "regular", label: "Thường", priceDelta: 0 },
    { id: "large", label: "Lớn", priceDelta: 15000 },
    { id: "special", label: "Đặc biệt", priceDelta: 25000 },
  ],
  toppingOptions: [
    { id: "them-bo", label: "Thêm bò", priceDelta: 20000 },
    { id: "them-cha", label: "Thêm chả", priceDelta: 12000 },
    { id: "them-rau", label: "Thêm rau", priceDelta: 5000 },
  ],
  preferenceOptions: ricePreferenceOptions,
  notePlaceholder: "Ít hành, thêm sa tế, để riêng rau...",
};

const banhMiCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "regular",
  sizeOptions: [
    { id: "regular", label: "Ổ thường", priceDelta: 0 },
    { id: "double", label: "Gấp đôi nhân", priceDelta: 12000 },
    { id: "combo", label: "Combo no", priceDelta: 25000 },
  ],
  toppingOptions: [
    { id: "them-thit", label: "Thêm thịt", priceDelta: 10000 },
    { id: "them-pate", label: "Thêm pate", priceDelta: 7000 },
    { id: "them-trung", label: "Thêm trứng", priceDelta: 8000 },
  ],
  preferenceOptions: ricePreferenceOptions,
  notePlaceholder: "Ít cay, không ngò, để riêng sốt...",
};

const simpleCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "standard",
  sizeOptions: [{ id: "standard", label: "Phần tiêu chuẩn", priceDelta: 0 }],
  toppingOptions: [],
  preferenceOptions: [],
  notePlaceholder: "Ghi chú thêm cho quán...",
};

const drinkCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "m",
  sizeOptions: [
    { id: "s", label: "S", priceDelta: 0 },
    { id: "m", label: "M", priceDelta: 5000 },
    { id: "l", label: "L", priceDelta: 10000 },
  ],
  toppingOptions: [
    { id: "it-da", label: "Ít đá", priceDelta: 0 },
    { id: "them-dao", label: "Thêm đào", priceDelta: 7000 },
  ],
  preferenceOptions: [
    { id: "it-da", label: "Ít đá", priceDelta: 0 },
    { id: "it-ngot", label: "Ít ngọt", priceDelta: 0 },
    { id: "khong-da", label: "Không đá", priceDelta: 0 },
  ],
  notePlaceholder: "Ít đá, ít ngọt...",
};

function normalizeMenuText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("vi-VN");
}

export function getRestaurantMenuCustomizationForItem({
  id,
  name,
  categoryName = "",
}: {
  id: string;
  name: string;
  categoryName?: string | null;
}) {
  const searchable = normalizeMenuText(`${id} ${name} ${categoryName ?? ""}`);

  if (
    searchable.includes("tra") ||
    searchable.includes("coca") ||
    searchable.includes("nuoc") ||
    searchable.includes("coffee") ||
    searchable.includes("ca phe")
  ) {
    return drinkCustomization;
  }

  if (searchable.includes("pho") || searchable.includes("bun")) {
    return noodleCustomization;
  }

  if (searchable.includes("banh mi")) {
    return banhMiCustomization;
  }

  if (searchable.includes("com tam")) {
    return riceCustomization;
  }

  return simpleCustomization;
}

export const restaurantDetails: RestaurantDetail[] = [
  {
    slug: "com-tam-sau-hieu",
    name: "Cơm Tấm Sáu Hiếu",
    image: "/images/home/restaurant-com-tam.png",
    rating: "4.8",
    reviewCount: "1.2k+ đánh giá",
    address: "123 Đường 30/4, Ninh Kiều, Cần Thơ",
    deliveryTime: "25-35 phút",
    deliveryFee: "Freeship",
    minimumOrder: "Tối thiểu 30k",
    isOpen: true,
    openUntil: "22:00",
    restaurantVouchers: defaultVouchers,
    restaurantReviews: defaultReviews,
    restaurantInfoItems: defaultInfoItems,
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        layout: "horizontal",
        items: [
          {
            id: "com-tam-dac-biet",
            name: "Cơm tấm đặc biệt",
            description:
              "Sườn, bì, chả, trứng ốp la, lạp xưởng tôm - Đầy đủ hương vị.",
            price: 79000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
            isPopular: true,
            sale: getRestaurantMenuSaleForItem({
              foodId: "com-tam-dac-biet",
              price: 79000,
            }),
            customization: riceCustomization,
          },
          {
            id: "com-tam-suon-bi-cha",
            name: "Cơm tấm sườn bì chả",
            description:
              "Sườn nướng mật ong, bì heo dai ngon, chả trứng béo ngậy kèm đồ chua.",
            price: 65000,
            image: "/images/home/restaurant-com-tam.png",
            isAvailable: true,
            isPopular: true,
            customization: riceCustomization,
          },
        ],
      },
      {
        id: "rice-plates",
        label: "Cơm Tấm",
        layout: "horizontal",
        items: [
          {
            id: "com-tam-suon-op-la",
            name: "Cơm tấm sườn ốp la",
            description:
              "Sườn cốt lết nướng than hoa, trứng ốp la lòng đào mỡ hành.",
            price: 55000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
            customization: riceCustomization,
          },
          {
            id: "com-tam-suon-nuong",
            name: "Cơm tấm sườn nướng",
            description:
              "Cơm tấm dẻo thơm, sườn nướng đậm đà vị truyền thống.",
            price: 49000,
            image: "/images/home/recipe-com-tam.png",
            isAvailable: true,
            customization: riceCustomization,
          },
        ],
      },
      {
        id: "extras",
        label: "Món Thêm",
        layout: "compact",
        items: [
          {
            id: "trung-op-la",
            name: "Trứng ốp la",
            description: "Trứng ốp la lòng đào ăn kèm cơm tấm.",
            price: 8000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
            customization: simpleCustomization,
          },
          {
            id: "bi",
            name: "Bì",
            description: "Bì heo trộn thính thơm, thái sợi vừa ăn.",
            price: 12000,
            image: "/images/home/restaurant-com-tam.png",
            isAvailable: true,
            customization: simpleCustomization,
          },
          {
            id: "cha-trung",
            name: "Chả trứng",
            description: "Chả trứng hấp mềm thơm, cắt miếng dày.",
            price: 15000,
            image: "/images/home/recipe-com-tam.png",
            isAvailable: true,
            customization: simpleCustomization,
          },
          {
            id: "lap-xuong",
            name: "Lạp xưởng",
            description: "Lạp xưởng tôm nướng thơm, vị ngọt nhẹ.",
            price: 15000,
            image: "/images/home/food-com-tam.png",
            isAvailable: true,
            customization: simpleCustomization,
          },
        ],
      },
      {
        id: "drinks",
        label: "Đồ Uống",
        layout: "compact",
        items: [
          {
            id: "tra-dao",
            name: "Trà đào",
            description: "Ly trà đào mát lạnh dùng kèm món nướng.",
            price: 12000,
            image: "/images/home/food-tra-dao.png",
            isAvailable: true,
            customization: drinkCustomization,
            placeholderIcon: "local_drink",
          },
          {
            id: "coca-cola",
            name: "Coca-Cola",
            description: "Lon Coca-Cola ướp lạnh.",
            price: 15000,
            image: "/images/home/food-tra-dao.png",
            isAvailable: true,
            customization: drinkCustomization,
            placeholderIcon: "local_bar",
          },
          {
            id: "nuoc-suoi",
            name: "Nước suối",
            description: "Chai nước suối tinh khiết.",
            price: 10000,
            image: "/images/home/food-tra-dao.png",
            isAvailable: true,
            customization: drinkCustomization,
            placeholderIcon: "water_drop",
          },
          {
            id: "ca-phe-sua-da",
            name: "Cà phê sữa đá",
            description: "Cà phê sữa đá đậm vị Việt.",
            price: 20000,
            image: "/images/home/food-tra-dao.png",
            isAvailable: true,
            customization: drinkCustomization,
            placeholderIcon: "coffee",
          },
        ],
      },
    ],
  },
  {
    slug: "pho-2000-ninh-kieu",
    name: "Phở 2000 - Ninh Kiều",
    image: "/images/home/restaurant-pho.png",
    rating: "4.5",
    reviewCount: "200+ đánh giá",
    address: "45 Hai Bà Trưng, Ninh Kiều, Cần Thơ",
    deliveryTime: "15-25 phút",
    deliveryFee: "12.000đ",
    minimumOrder: "Tối thiểu 40k",
    isOpen: true,
    openUntil: "22:00",
    restaurantVouchers: defaultVouchers,
    restaurantReviews: defaultReviews,
    restaurantInfoItems: defaultInfoItems,
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        layout: "horizontal",
        items: [
          {
            id: "pho-bo-dac-biet",
            name: "Phở bò đặc biệt",
            description:
              "Nước dùng trong, bò tái nạm gầu, rau thơm và chanh ớt.",
            price: 69000,
            image: "/images/home/food-pho.png",
            isAvailable: true,
            isPopular: true,
            sale: getRestaurantMenuSaleForItem({
              foodId: "pho-bo-dac-biet",
              price: 69000,
            }),
            customization: noodleCustomization,
          },
        ],
      },
    ],
  },
  {
    slug: "bun-chu-hung",
    name: "Bún Chú Hùng",
    image: "/images/home/restaurant-bun.png",
    rating: "4.7",
    reviewCount: "80+ đánh giá",
    address: "18 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
    deliveryTime: "25-35 phút",
    deliveryFee: "10.000đ",
    minimumOrder: "Tối thiểu 35k",
    isOpen: true,
    openUntil: "20:30",
    restaurantVouchers: defaultVouchers,
    restaurantReviews: defaultReviews,
    restaurantInfoItems: defaultInfoItems,
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        layout: "horizontal",
        items: [
          {
            id: "bun-bo-hue",
            name: "Bún bò Huế",
            description:
              "Nước dùng đậm vị, chả cua, bò mềm và rau sống tươi.",
            price: 62000,
            image: "/images/home/food-bun-bo.png",
            isAvailable: true,
            isPopular: true,
            customization: noodleCustomization,
          },
        ],
      },
    ],
  },
  {
    slug: "tiem-banh-mi-goc-pho",
    name: "Tiệm Bánh Mì Góc Phố",
    image: "/images/home/restaurant-banh-mi.png",
    rating: "4.9",
    reviewCount: "150+ đánh giá",
    address: "72 Mậu Thân, Ninh Kiều, Cần Thơ",
    deliveryTime: "10-20 phút",
    deliveryFee: "8.000đ",
    minimumOrder: "Tối thiểu 25k",
    isOpen: true,
    openUntil: "19:30",
    restaurantVouchers: defaultVouchers,
    restaurantReviews: defaultReviews,
    restaurantInfoItems: defaultInfoItems,
    menuCategories: [
      {
        id: "best-sellers",
        label: "Món Bán Chạy",
        layout: "horizontal",
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
            sale: getRestaurantMenuSaleForItem({
              foodId: "banh-mi-thit-nuong",
              price: 32000,
            }),
            customization: banhMiCustomization,
          },
        ],
      },
    ],
  },
];

export function getRestaurantDetailBySlug(slug: string) {
  return restaurantDetails.find((restaurant) => restaurant.slug === slug);
}
