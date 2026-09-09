import AccountHeader from "@/components/account/AccountHeader";
import SecuritySettings from "@/components/account/SecuritySettings";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountSecurityPage() {
  await requireCurrentUser();

  return (
    <>
      <AccountHeader title="Bảo mật" description="Bảo vệ tài khoản và kiểm soát dữ liệu của bạn trên EatNow." />
      <SecuritySettings />
    </>
  );
}
