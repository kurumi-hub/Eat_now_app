"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicUser } from "@/types/auth";

export default function MobileBottomNav({ user }: { user: PublicUser | null }) {
  const pathname = usePathname();
  const items = [
    {
      label: "Khám phá",
      href: "/restaurants",
      active:
        pathname === "/" ||
        pathname === "/restaurants" ||
        pathname.startsWith("/restaurants/"),
      icon: <ExploreOutlinedIcon />,
    },
    {
      label: "Đơn hàng",
      href: user ? "/orders" : "/login?next=/orders",
      active: pathname === "/orders" || pathname.startsWith("/orders/"),
      icon: <ReceiptLongOutlinedIcon />,
    },
    {
      label: "Tài khoản",
      href: user ? "/account/profile" : "/login?next=/account/profile",
      active: pathname === "/account" || pathname.startsWith("/account/"),
      icon: <AccountCircleOutlinedIcon />,
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Điều hướng chính trên di động">
      {items.map((item) => (
        <Link
          key={item.label}
          className={item.active ? "is-active" : undefined}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
