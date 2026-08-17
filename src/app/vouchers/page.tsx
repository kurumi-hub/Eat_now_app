import VoucherPage from "@/components/voucher/VoucherPage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Vouchers() {
  const user = await getCurrentPublicUser();
  return <VoucherPage user={user} />;
}
