import type { ReactNode } from "react";

export const metadata = {
  title: "EatNow Shipper",
};

export default function ShipperLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Mở quyền truy cập trực tiếp cho luồng giao diện Shipper để xem trước và kiểm thử
  return <>{children}</>;
}
