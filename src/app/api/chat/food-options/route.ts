import { NextResponse } from "next/server";

import { getFoodFlashSale } from "@/lib/data/flashSales";
import { getRestaurantDetailBySlug } from "@/lib/data/restaurants";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(request: Request) {
  const user = await getCurrentPublicUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để thêm món." }, { status: 401 });
  }

  const url = new URL(request.url);
  const foodId = url.searchParams.get("foodId")?.trim() ?? "";
  const restaurantSlug = url.searchParams.get("restaurant")?.trim() ?? "";
  const flashSaleItemId = url.searchParams.get("sale")?.trim() || undefined;

  if (!UUID.test(foodId) || !SLUG.test(restaurantSlug) ||
      (flashSaleItemId && !UUID.test(flashSaleItemId))) {
    return NextResponse.json({ error: "Món ăn không hợp lệ." }, { status: 400 });
  }

  const restaurant = await getRestaurantDetailBySlug(restaurantSlug);
  if (!restaurant) {
    return NextResponse.json({ error: "Không tìm thấy nhà hàng." }, { status: 404 });
  }

  const food = restaurant.menuCategories
    .flatMap((category) => category.items)
    .find((item) => item.id === foodId);
  if (!food) {
    return NextResponse.json({ error: "Không tìm thấy món tại nhà hàng này." }, { status: 404 });
  }

  const flashSale = flashSaleItemId
    ? await getFoodFlashSale(food.id, flashSaleItemId)
    : null;

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      isOpen: restaurant.isOpen,
      availabilityMessage: restaurant.availabilityMessage ?? null,
    },
    food,
    flashSale,
  });
}
