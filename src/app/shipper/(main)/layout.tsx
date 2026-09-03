import type { ReactNode } from "react";

import ShipperShell from "@/components/shipper/ShipperShell";

export default function ShipperMainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <ShipperShell>{children}</ShipperShell>;
}
