import ShipperDashboard from "@/components/shipper/ShipperDashboard";
import { parseShipperDashboard } from "@/lib/data/shipper";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

export default async function ShipperPage() {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const dashboardResult = await supabase.rpc("api_get_shipper_dashboard");
  if (dashboardResult.error) console.error("[shipper] Không thể tải dashboard", dashboardResult.error);
  return <ShipperDashboard user={user} data={parseShipperDashboard(dashboardResult.data)} />;
}
