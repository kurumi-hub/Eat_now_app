import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

import type { PublicUser, UserRole } from "@/types/auth";
import { hasAnyRole } from "@/utils/roles";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
  allowedRoles?: UserRole[];
};

export const accountNavItems: AccountNavItem[] = [
  {
    href: "/account/profile",
    label: "Hồ sơ cá nhân",
    icon: ManageAccountsOutlinedIcon,
  },
  {
    href: "/account/security",
    label: "Bảo mật",
    icon: SecurityOutlinedIcon,
  },
  {
    href: "/account/preferences",
    label: "Cài đặt",
    icon: NotificationsOutlinedIcon,
  },
  {
    href: "/account/addresses",
    label: "Địa chỉ giao hàng",
    icon: HomeWorkOutlinedIcon,
    allowedRoles: ["CUSTOMER"],
  },
  {
    href: "/account/seller",
    label: "Bán hàng cùng EatNow",
    icon: StorefrontOutlinedIcon,
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
