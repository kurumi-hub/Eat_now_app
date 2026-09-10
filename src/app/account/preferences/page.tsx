import AccountHeader from "@/components/account/AccountHeader";
import PreferencesSettingsPanel from "@/components/account/PreferencesSettingsPanel";
import { getCurrentAccountPreferences } from "@/lib/data/accountPreferences";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountPreferencesPage() {
  await requireCurrentUser();
  const preferences = await getCurrentAccountPreferences();

  return (
    <>
      <AccountHeader
        title="Cài đặt"
        description="Thiết lập thông báo, giao diện và ngôn ngữ hiển thị."
      />
      <PreferencesSettingsPanel initialPreferences={preferences} />
    </>
  );
}
