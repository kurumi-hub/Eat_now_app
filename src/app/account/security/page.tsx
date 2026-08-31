import AccountHeader from "@/components/account/AccountHeader";
import SecuritySettingsPanel from "@/components/account/SecuritySettingsPanel";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountSecurityPage() {
  const user = await requireCurrentUser();

  return (
    <>
      <AccountHeader
        title="Bảo mật"
        description="Quản lý mật khẩu và phiên đăng nhập của tài khoản EatNow."
      />
      <SecuritySettingsPanel user={user} />
    </>
  );
}
