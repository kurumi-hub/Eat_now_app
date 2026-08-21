import SellerApplicationPanel from "@/components/account/SellerApplicationPanel";
import { parseSellerContext, parseStaffInvitations } from "@/lib/data/owner";
import { requireAnyRole } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

export default async function AccountSellerPage() {
  await requireAnyRole([
    "CUSTOMER",
    "RESTAURANT_OWNER",
    "RESTAURANT_STAFF",
  ]);

  const supabase = await createClient();
  const [contextResult, invitationsResult] = await Promise.all([
    supabase.rpc("api_get_my_seller_context"),
    supabase.rpc("api_list_my_staff_invitations"),
  ]);
  if (contextResult.error || invitationsResult.error) {
    console.error("[seller] Không thể tải dữ liệu", contextResult.error || invitationsResult.error);
  }

  return (
    <>
      <header className="account-page-heading">
        <p className="account-page-heading__eyebrow">Tài khoản</p>
        <h1 className="account-page-heading__title">Bán hàng cùng EatNow</h1>
        <p className="account-page-heading__description">
          Theo dõi trạng thái đăng ký mở quán và truy cập kênh người bán.
        </p>
      </header>

      <SellerApplicationPanel
        context={parseSellerContext(contextResult.data)}
        invitations={parseStaffInvitations(invitationsResult.data)}
      />
    </>
  );
}
