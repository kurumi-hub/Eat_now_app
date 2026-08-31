import OrderHistoryPage from "@/components/order/OrderHistoryPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function OrdersRoute() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <OrderHistoryPage
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    />
  );
}
