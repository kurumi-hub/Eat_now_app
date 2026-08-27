import type { ReactNode } from "react";

import OwnerShell from "@/components/owner/OwnerShell";
import { requireAnyRole } from "@/utils/auth/guards";

export default async function OwnerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireAnyRole(["RESTAURANT_OWNER"]);

  return <OwnerShell>{children}</OwnerShell>;
}
