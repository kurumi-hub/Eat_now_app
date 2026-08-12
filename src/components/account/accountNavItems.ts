import { Bell, Building2, Shield, Store, UserCog } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

import type { PublicUser, UserRole } from "@/types/auth";
import { hasAnyRole } from "@/utils/roles";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: ComponentType<LucideProps>;
  allowedRoles?: UserRole[];
};

export const accountNavItems: AccountNavItem[] = [
  {
    href: "/account/profile",
    label: "Hồ sơ cá nhân",
    icon: UserCog,
  },
  {
    href: "/account/security",
    label: "Bảo mật",
    icon: Shield,
  },
  {
    href: "/account/preferences",
    label: "Cài đặt",
    icon: Bell,
  },
  {
    href: "/account/addresses",
    label: "Địa chỉ giao hàng",
    icon: Building2,
    allowedRoles: ["CUSTOMER"],
  },
  {
    href: "/account/seller",
    label: "Bán hàng cùng EatNow",
    icon: Store,
    allowedRoles: ["CUSTOMER", "RESTAURANT_OWNER"],
  },
];

export const accountPageCopy: Record<
  string,
  { title: string; description: string }
> = {
  "/account/profile": {
    title: "Hồ sơ cá nhân",
    description: "Quản lý thông tin cá nhân và thông tin liên hệ của bạn.",
  },
  "/account/security": {
    title: "Bảo mật",
    description: "Đổi mật khẩu và quản lý phiên đăng nhập hiện tại.",
  },
  "/account/preferences": {
    title: "Cài đặt",
    description: "Điều chỉnh thông báo và trải nghiệm hiển thị trong ứng dụng.",
  },
  "/account/addresses": {
    title: "Địa chỉ giao hàng",
    description: "Quản lý địa chỉ dùng cho đơn hàng của khách hàng.",
  },
  "/account/seller": {
    title: "Bán hàng trên EatNow",
    description:
      "Theo dõi trạng thái đăng ký mở quán và kênh người bán của bạn.",
  },
};

export function getVisibleAccountNavItems(user: PublicUser) {
  return accountNavItems.filter((item) => {
    if (!item.allowedRoles) {
      return true;
    }

    return hasAnyRole(user, item.allowedRoles);
  });
}
