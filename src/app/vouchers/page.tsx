import VoucherPage from "@/components/voucher/VoucherPage";
import { parseCustomerVouchers } from "@/lib/data/vouchers";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function VouchersRoute() {
  const user = await getCurrentPublicUser();
  if (!user) {
    redirect("/login?next=/vouchers");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_list_customer_vouchers");
  if (error) console.error("api_list_customer_vouchers error:", error.message);
  return <VoucherPage data={error ? { discover: [], wallet: [] } : parseCustomerVouchers(data)} isAuthenticated />;
}
