import OwnerDashboard from "@/components/owner/OwnerDashboard";
import RouteNotice from "@/components/common/RouteNotice";
import { parseManagedRestaurants, parseOwnerDashboard } from "@/lib/data/owner";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type Props = { searchParams: Promise<{ restaurant?: string | string[] }> };

export default async function OwnerPage({ searchParams }: Props) {
  const user = await requireAnyRole(["RESTAURANT_OWNER", "RESTAURANT_STAFF"]);
  const params = await searchParams;
  const requested = (Array.isArray(params.restaurant) ? params.restaurant[0] : params.restaurant) || "";
  const supabase = await createClient();
  const listResult = await supabase.rpc("api_list_my_restaurants");
  const restaurants = parseManagedRestaurants(listResult.data);
  const selected = restaurants.find((item) => item.id === requested) || restaurants[0];

  if (!selected) {
    return <RouteNotice eyebrow="Kênh người bán" title="Chưa có nhà hàng được phân công" message="Hồ sơ đã duyệt hoặc lời mời Staff được chấp nhận sẽ xuất hiện tại đây." actions={[{ href: "/account/seller", label: "Xem hồ sơ & lời mời", variant: "primary" }]} />;
  }
  const dashboardResult = await supabase.rpc("api_get_owner_restaurant_dashboard", { p_restaurant_id: selected.id });
  const dashboard = parseOwnerDashboard(dashboardResult.data);
  if (!dashboard || dashboardResult.error) {
    console.error("[owner] Không thể tải dashboard", dashboardResult.error);
    return <RouteNotice eyebrow="Kênh người bán" title="Chưa thể tải nhà hàng" message="Hãy kiểm tra SQL 21–22 và thử lại." actions={[{ href: "/account/seller", label: "Về hồ sơ bán hàng", variant: "primary" }]} />;
  }

  return <OwnerDashboard userId={user.id} restaurants={restaurants} data={dashboard} />;
}
