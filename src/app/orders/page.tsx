import OrderHistoryPage from "@/components/order/OrderHistoryPage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function OrdersRoute() {
  const user = await getCurrentPublicUser();

  return <OrderHistoryPage user={user} />;
}
