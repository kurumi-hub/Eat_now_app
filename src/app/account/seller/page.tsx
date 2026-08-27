import AccountHeader from "@/components/account/AccountHeader";
import SellerApplicationPage from "@/components/account/SellerApplicationPage";
import { parseSellerContext } from "@/lib/data/owner";
import type { SellerContext } from "@/types/owner";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

async function getSellerContext(): Promise<SellerContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_get_seller_context");

  if (error) {
    const isMissingRpc =
      error.code === "PGRST202" ||
      error.code === "42883" ||
      /api_get_seller_context/i.test(error.message ?? "");

    if (!isMissingRpc && error.code !== "42501") {
      console.error("[seller] Không thể đọc seller context", error.message);
    }

    return parseSellerContext(null);
  }

  return parseSellerContext(data);
}

export default async function AccountSellerPage() {
  const user = await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER"]);
  const sellerContext = await getSellerContext();

  return (
    <>
      <AccountHeader
        title="Bán hàng cùng EatNow"
        description="Theo dõi trạng thái đăng ký mở quán và truy cập kênh người bán của bạn."
      />
      <SellerApplicationPage
        key={`${sellerContext.application?.id ?? "new"}-${sellerContext.application?.updatedAt ?? "empty"}`}
        user={user}
        sellerContext={sellerContext}
      />
    </>
  );
}
