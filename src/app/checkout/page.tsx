import { Suspense } from "react";

import CheckoutPage from "@/components/order/CheckoutPage";
import { orderPageClassName } from "@/components/order/tailwindClasses";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function CheckoutRoute() {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <Suspense fallback={<div className={orderPageClassName()} />}>
      <CheckoutPage user={user} deliveryLocationLabel={deliveryLocationLabel} />
    </Suspense>
  );
}
