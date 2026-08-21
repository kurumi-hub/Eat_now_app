import { createClient } from "@/utils/supabase/server";
import type { HomeRestaurant } from "@/components/home/homeData";
import {
  getRestaurantMenuCustomizationForItem,
  getRestaurantMenuSaleForItem,
} from "@/components/restaurant/restaurantDetailData";
import type {
  RestaurantDetail,
  RestaurantInfoItem,
  RestaurantMenuCategory,
  RestaurantReview,
  RestaurantVoucher,
} from "@/components/restaurant/restaurantDetailData";

/**
 * Lớp truy vấn dữ liệu nhà hàng từ Supabase.
 * Trả về đúng các type UI đang dùng (HomeRestaurant / RestaurantDetail)
 * để các component (HomePage, RestaurantDetailPage) không cần sửa.
 */

function formatReviewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+ đánh giá`;
  }
  return `${count}+ đánh giá`;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
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

// ---------------------------------------------------------------------
// Trang chủ: danh sách nhà hàng nổi bật
// ---------------------------------------------------------------------
export async function getFeaturedRestaurants(): Promise<HomeRestaurant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      `slug, name, rating_average, rating_count,
       restaurant_images ( img_url, is_primary )`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(8);

  if (error || !data) {
    console.error("getFeaturedRestaurants error:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return [];
  }

  return data.map((r) => {
    const primaryImage =
      r.restaurant_images.find((img) => img.is_primary)?.img_url ??
      r.restaurant_images[0]?.img_url ??
      "/images/home/restaurant-com-tam.png";

    return {
      slug: r.slug ?? "",
      name: r.name,
      image: primaryImage,
      rating: `${r.rating_average} (${r.rating_count}+)`,
      time: "20 - 30 phút",
    };
  });
}

// ---------------------------------------------------------------------
// Trang chi tiết nhà hàng theo slug
// ---------------------------------------------------------------------
export async function getRestaurantDetailBySlug(
  slug: string
): Promise<RestaurantDetail | undefined> {
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select(
      `slug, name, address, is_active, close_at,
       rating_average, rating_count,
       restaurant_images ( img_url, is_primary ),
       foods (
         id, name, description, base_price, is_available,
         food_images ( img_url, is_primary ),
         food_categories ( categories ( id, name ) ),
         food_tags ( tags ( name ) )
       )`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getRestaurantDetailBySlug error:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return undefined;
  }
  if (!restaurant) return undefined;

  const primaryImage =
    restaurant.restaurant_images.find((img) => img.is_primary)?.img_url ??
    restaurant.restaurant_images[0]?.img_url ??
    "";

  // Gom món ăn theo category, giữ đúng cấu trúc RestaurantMenuCategory[]
  const categoryOrder: string[] = [];
  const categoriesMap = new Map<string, RestaurantMenuCategory>();

  for (const food of restaurant.foods) {
    const category = firstRelation(food.food_categories[0]?.categories);
    const categoryName = category?.name ?? "Món Khác";
    const categoryId = category?.id ?? "khac";

    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        label: categoryName,
        items: [],
      });
      categoryOrder.push(categoryId);
    }

    const primaryFoodImage =
      food.food_images.find((img) => img.is_primary)?.img_url ??
      food.food_images[0]?.img_url ??
      "";

    const isPopular = food.food_tags.some(
      (ft) => firstRelation(ft.tags)?.name === "popular"
    );

    categoriesMap.get(categoryId)!.items.push({
      id: food.id,
      name: food.name,
      description: food.description ?? "",
      price: Number(food.base_price),
      image: primaryFoodImage,
      isAvailable: food.is_available,
      isPopular,
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

  return {
    slug: restaurant.slug ?? slug,
    name: restaurant.name,
    image: primaryImage,
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
    menuCategories: categoryOrder.map((id) => categoriesMap.get(id)!),
  };
}
