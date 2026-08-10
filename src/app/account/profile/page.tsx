import AccountHeader from "@/components/account/AccountHeader";
import ProfileEditor from "@/components/account/ProfileEditor";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountProfilePage() {
  const user = await requireCurrentUser();

  return (
    <>
      <AccountHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin cá nhân và thông tin liên hệ của bạn."
      />
      <ProfileEditor user={user} />
    </>
  );
}
