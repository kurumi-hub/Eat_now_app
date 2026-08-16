import OrderTrackingPage from "@/components/order/OrderTrackingPage";
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

  return <OrderTrackingPage orderId={decodeURIComponent(orderId)} user={user} />;
}
