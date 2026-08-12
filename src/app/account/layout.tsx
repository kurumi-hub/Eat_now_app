import type { ReactNode } from "react";

import AccountLayoutShell from "@/components/account/AccountLayout";
import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireCurrentUser();

  return <AccountLayoutShell user={user}>{children}</AccountLayoutShell>;
}
