import CartPage from "@/components/cart/CartPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function CartRoute() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return <CartPage user={user} deliveryLocationLabel={deliveryLocationLabel} />;
}
