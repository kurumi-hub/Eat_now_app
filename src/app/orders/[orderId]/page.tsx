import OrderDetailPage from "@/components/order/OrderDetailPage";
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

  return <OrderDetailPage orderId={decodeURIComponent(orderId)} user={user} />;
}
