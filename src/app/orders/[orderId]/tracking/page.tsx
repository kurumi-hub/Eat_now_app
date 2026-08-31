import OrderTrackingPage from "@/components/order/OrderTrackingPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type OrderTrackingRouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderTrackingRoute({
  params,
}: OrderTrackingRouteProps) {
  const { orderId } = await params;
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <OrderTrackingPage
      orderId={decodeURIComponent(orderId)}
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    />
  );
}
