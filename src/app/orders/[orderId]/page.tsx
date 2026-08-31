import OrderDetailPage from "@/components/order/OrderDetailPage";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type OrderDetailRouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailRoute({
  params,
}: OrderDetailRouteProps) {
  const { orderId } = await params;
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <OrderDetailPage
      orderId={decodeURIComponent(orderId)}
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    />
  );
}
