import AccountHeader from "@/components/account/AccountHeader";
import PreferenceSettings from "@/components/account/PreferenceSettings";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountPreferencesPage() {
  await requireCurrentUser();

  return (
    <>
      <AccountHeader title="Cài đặt chung" description="Điều chỉnh trải nghiệm, thông báo và cách chatbot cá nhân hóa gợi ý." />
      <PreferenceSettings />
    </>
  );
}
