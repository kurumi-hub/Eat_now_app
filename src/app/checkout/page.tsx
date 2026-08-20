import CheckoutPage from "@/components/checkout/CheckoutPage";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function CheckoutRoute() {
  const [user, addresses] = await Promise.all([
    requireCurrentUser(),
    getCurrentUserAddresses(),
  ]);

  return <CheckoutPage user={user} addresses={addresses} />;
}
