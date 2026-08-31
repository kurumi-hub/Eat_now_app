import type { ReactNode } from "react";

import AccountLayoutShell from "@/components/account/AccountLayout";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireCurrentUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);

  return (
    <AccountLayoutShell
      user={user}
      deliveryLocationLabel={deliveryLocationLabel}
    >
      {children}
    </AccountLayoutShell>
  );
}
