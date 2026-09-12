import CheckoutPage from "@/components/checkout/CheckoutPage";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { requireCurrentUser } from "@/utils/auth/guards";
import { getDeliverySelection } from "@/lib/deliverySelection";

export default async function CheckoutRoute() {
  const [user, addresses] = await Promise.all([
    requireCurrentUser(),
    getCurrentUserAddresses(),
  ]);

  const deliverySelection = await getDeliverySelection(addresses);
  return (
    <CheckoutPage
      user={user}
      addresses={addresses}
      initialAddressId={deliverySelection?.kind === "saved" ? deliverySelection.addressId : undefined}
    />
  );
}
