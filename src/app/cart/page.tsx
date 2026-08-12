import CartPage from "@/components/cart/CartPage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function CartRoute() {
  const user = await getCurrentPublicUser();

  return <CartPage user={user} />;
}
