import HomePage from "@/components/home/HomePage";
import { getHomeCategories } from "@/lib/data/catalog";
import { getFeaturedRestaurants } from "@/lib/data/restaurants";
import { getSiteMedia } from "@/lib/data/siteMedia";
import { getHomeFlashSale } from "@/lib/data/flashSales";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { parseCustomerOrders } from "@/lib/data/customerOrders";
import { getPublicVouchers, parseCustomerVouchers } from "@/lib/data/vouchers";
import { getFavoriteRestaurants } from "@/lib/data/favoriteRestaurants";

type HomeProps = {
  searchParams: Promise<{ home?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [user, params] = await Promise.all([getCurrentPublicUser(), searchParams]);
  const explicitHome = Array.isArray(params.home) ? params.home[0] : params.home;
  if (user && hasRole(user, "SHIPPER") && explicitHome !== "1") redirect("/shipper");

  const [categories, featuredRestaurants, siteMedia, flashSale, personal] = await Promise.all([
    getHomeCategories(),
    getFeaturedRestaurants(),
    getSiteMedia(),
    getHomeFlashSale(),
    user ? (async () => {
      const supabase = await createClient();
      const [ordersResult, vouchersResult, favorites] = await Promise.all([
        supabase.rpc("api_list_customer_orders", { p_status: null, p_search: null, p_limit: 20, p_offset: 0 }),
        supabase.rpc("api_list_customer_vouchers"),
        getFavoriteRestaurants(supabase),
      ]);
      if (ordersResult.error) console.error("[home] Không thể tải đơn cá nhân", ordersResult.error.message);
      if (vouchersResult.error) console.error("[home] Không thể tải ưu đãi cá nhân", vouchersResult.error.message);
      const voucherData = vouchersResult.error ? { discover: [], wallet: [] } : parseCustomerVouchers(vouchersResult.data);
      const availableWallet = voucherData.wallet.filter((item) => item.walletStatus === "available");
      const walletVoucherIds = new Set(availableWallet.map((item) => item.id));
      return {
        orders: ordersResult.error ? [] : parseCustomerOrders(ordersResult.data).items,
        vouchers: [
          ...availableWallet,
          ...voucherData.discover.filter((item) => !walletVoucherIds.has(item.id)),
        ].slice(0, 3),
        favorites,
      };
    })() : getPublicVouchers().then((vouchers) => ({ orders: [], vouchers: vouchers.slice(0, 3), favorites: [] })),
  ]);

  return (
    <HomePage
      user={user}
      categories={categories}
      featuredRestaurants={featuredRestaurants}
      heroImage={siteMedia.home_hero}
      flashSale={flashSale}
      orders={personal.orders}
      vouchers={personal.vouchers}
      favorites={personal.favorites}
    />
  );
}
