import AccountHeader from "@/components/account/AccountHeader";
import PreferencesSettingsPanel from "@/components/account/PreferencesSettingsPanel";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountPreferencesPage() {
  await requireCurrentUser();

  return (
    <>
      <AccountHeader
        title="Cài đặt"
        description="Thiết lập thông báo, giao diện và ngôn ngữ hiển thị."
      />
      <PreferencesSettingsPanel />
    </>
  );
}
