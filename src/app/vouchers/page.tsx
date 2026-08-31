import VoucherPage from "@/components/voucher/VoucherPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Vouchers() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <VoucherPage user={user} deliveryLocationLabel={deliveryLocationLabel} />
  );
}
