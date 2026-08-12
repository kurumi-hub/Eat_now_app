import CheckoutPage from "@/components/checkout/CheckoutPage";
import { requireCurrentUser } from "@/utils/auth/guards";
import { listAddressesAction } from "@/app/account/addresses/actions";

export default async function CheckoutRoute() {
  const user = await requireCurrentUser();
  const addresses = await listAddressesAction();

  return <CheckoutPage user={user} addresses={addresses} />;
}
