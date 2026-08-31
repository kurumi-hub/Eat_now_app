import "server-only";

import { unstable_cache } from "next/cache";

import type { HomeRestaurant } from "@/components/home/homeData";
import {
  getRestaurantMenuCustomizationForItem,
  getRestaurantMenuSaleForItem,
  type RestaurantDetail,
  type RestaurantInfoItem,
  type RestaurantMenuCategory,
  type RestaurantReview,
  type RestaurantVoucher,
} from "@/components/restaurant/restaurantDetailData";
import { createPublicClient } from "@/utils/supabase/public";

type FeaturedRestaurantRpcRow = {
  id: string;
  slug: string;
  name: string;
  rating_average: number | string;
  rating_count: number;
  image_url: string | null;
};

type RestaurantDetailRpc = {
  id: string;
  slug: string;
  name: string;
  address: string;
  is_active: boolean;
  open_at: string | null;
  close_at: string | null;
  rating_average: number | string;
  rating_count: number;
  image_url: string | null;
  foods: Array<{
    id: string;
    name: string;
    description: string | null;
    base_price: number | string;
    is_available: boolean;
    image_url: string | null;
    category: { id: string; name: string } | null;
    tags: string[];
  }>;
};

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
}

function normalizeRuntimeMenuCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi-VN");
}

function getRuntimeMenuCategoryPriority(category: RestaurantMenuCategory) {
  const normalizedCategoryName = normalizeRuntimeMenuCategory(
    `${category.id} ${category.label}`
  );

  if (
    normalizedCategoryName.includes("ban chay") ||
    normalizedCategoryName.includes("best") ||
    normalizedCategoryName.includes("popular")
  ) {
    return 0;
  }

  if (
    normalizedCategoryName.includes("do uong") ||
    normalizedCategoryName.includes("drink")
  ) {
    return 2;
  }

  if (
    normalizedCategoryName.includes("mon them") ||
    normalizedCategoryName.includes("topping") ||
    normalizedCategoryName.includes("extra")
  ) {
    return 3;
  }

  return 1;
}

function sortRuntimeMenuCategories(categories: RestaurantMenuCategory[]) {
  return categories
    .map((category, index) => ({ category, index }))
    .sort((left, right) => {
      const priorityDelta =
        getRuntimeMenuCategoryPriority(left.category) -
        getRuntimeMenuCategoryPriority(right.category);

      return priorityDelta || left.index - right.index;
    })
    .map(({ category }) => category);
}

const runtimeRestaurantVouchers: RestaurantVoucher[] = [
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
    id: "save-10-percent",
    title: "GIẢM 10%",
    subtitle: "Tối đa 30K",
    actionLabel: "Lưu mã",
  },
];

const runtimeRestaurantReviews: RestaurantReview[] = [
  {
    id: "runtime-tuan-anh",
    customerName: "Tuấn Anh",
    initial: "T",
    rating: 5,
    timeAgo: "2 ngày trước",
    content:
      "Món lên nhanh, đóng gói gọn và vẫn còn nóng. Phần ăn đầy đặn, hợp để đặt bữa trưa văn phòng.",
    tone: "primary",
  },
  {
    id: "runtime-mai-lan",
    customerName: "Mai Lan",
    initial: "M",
    rating: 4.5,
    timeAgo: "1 tuần trước",
    content:
      "Quán chuẩn bị kỹ, món chính vừa miệng. Sẽ đặt lại khi cần một bữa ăn nhanh mà vẫn chỉn chu.",
    tone: "secondary",
  },
  {
    id: "runtime-hoang-nam",
    customerName: "Hoàng Nam",
    initial: "H",
    rating: 5,
    timeAgo: "2 tuần trước",
    content:
      "Giá hợp lý so với chất lượng, tài xế giao đúng giờ. Điểm cộng là món phụ cũng rất ổn.",
    tone: "tertiary",
  },
];

function buildRestaurantInfoItems(
  address: string,
  closeAt: string | null
): RestaurantInfoItem[] {
  return [
    {
      id: "address",
      icon: "location_on",
      title: "Địa chỉ",
      description: address,
    },
    {
      id: "hours",
      icon: "schedule",
      title: "Giờ hoạt động",
      description: closeAt ? `Hôm nay đến ${closeAt}` : "Đang cập nhật giờ mở cửa",
    },
    {
      id: "shipping",
      icon: "two_wheeler",
      title: "Giao hàng",
      description: "Freeship cho đơn đủ điều kiện, thời gian dự kiến 25-35 phút.",
    },
  ];
}

const fetchFeaturedRestaurants = unstable_cache(async (): Promise<HomeRestaurant[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_featured_restaurants", {
    p_limit: 8,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Không thể tải nhà hàng nổi bật.");
  }

  const rows = data as unknown as FeaturedRestaurantRpcRow[];
  return rows.map((restaurant) => ({
    slug: restaurant.slug,
    name: restaurant.name,
    image:
      restaurant.image_url ?? "/images/home/restaurant-com-tam.png",
    rating: `${restaurant.rating_average} (${restaurant.rating_count}+)`,
    time: "20 - 30 phút",
  }));
}, ["catalog-featured-restaurants-v1"], {
  revalidate: 60,
  tags: ["catalog", "restaurants"],
});

export async function getFeaturedRestaurants(): Promise<HomeRestaurant[]> {
  try {
    return await fetchFeaturedRestaurants();
  } catch (error) {
    console.error("getFeaturedRestaurants RPC error:", error);
    return [];
  }
}

const fetchRestaurantDetailBySlug = unstable_cache(async (
  slug: string
): Promise<RestaurantDetail | undefined> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_restaurant_detail", {
    p_slug: slug,
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return undefined;

  const restaurant = data as unknown as RestaurantDetailRpc;
  const categoryOrder: string[] = [];
  const categoriesMap = new Map<string, RestaurantMenuCategory>();

  for (const food of restaurant.foods ?? []) {
    const categoryId = food.category?.id ?? "khac";
    const categoryName = food.category?.name ?? "Món Khác";
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        label: categoryName,
        items: [],
      });
      categoryOrder.push(categoryId);
    }

    categoriesMap.get(categoryId)!.items.push({
      id: food.id,
      name: food.name,
      description: food.description ?? "",
      price: Number(food.base_price),
      image: food.image_url ?? "",
      isAvailable: food.is_available,
      isPopular: (food.tags ?? []).includes("popular"),
      sale: getRestaurantMenuSaleForItem({
        foodId: food.id,
        name: food.name,
        categoryName,
        price: Number(food.base_price),
      }),
      customization: getRestaurantMenuCustomizationForItem({
        id: food.id,
        name: food.name,
        categoryName,
      }),
    });
  }

  const menuCategories = categoryOrder.map((id) => categoriesMap.get(id)!);

  return {
    slug: restaurant.slug,
    name: restaurant.name,
    image: restaurant.image_url ?? "",
    rating: String(restaurant.rating_average),
    reviewCount: formatReviewCount(restaurant.rating_count),
    address: restaurant.address,
    deliveryTime: "25-35 phút",
    deliveryFee: "Freeship",
    minimumOrder: "Tối thiểu 30k",
    isOpen: restaurant.is_active,
    openUntil: restaurant.close_at ?? "",
    restaurantVouchers: runtimeRestaurantVouchers,
    restaurantReviews: runtimeRestaurantReviews,
    restaurantInfoItems: buildRestaurantInfoItems(
      restaurant.address,
      restaurant.close_at
    ),
    menuCategories: sortRuntimeMenuCategories(menuCategories),
  };
}, ["catalog-restaurant-detail-v1"], {
  revalidate: 60,
  tags: ["catalog", "restaurants"],
});

export async function getRestaurantDetailBySlug(
  slug: string
): Promise<RestaurantDetail | undefined> {
  try {
    return await fetchRestaurantDetailBySlug(slug);
  } catch (error) {
    console.error("getRestaurantDetailBySlug RPC error:", error);
    return undefined;
  }
}
