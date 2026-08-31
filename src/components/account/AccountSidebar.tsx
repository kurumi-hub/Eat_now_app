"use client";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Avatar, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/auth/actions";
import type { PublicUser } from "@/types/auth";
import { formatRole, getUserRoles, hasRole } from "@/utils/roles";
import { getVisibleAccountNavItems } from "./accountNavItems";
import {
  roleChipClassName,
  sidebarAvatarClassName,
  sidebarAvatarWrapClassName,
  sidebarClassName,
  sidebarDividerClassName,
  sidebarEmailClassName,
  sidebarLinkClassName,
  sidebarLinksClassName,
  sidebarLogoutClassName,
  sidebarNameClassName,
  sidebarNavClassName,
  sidebarSummaryClassName,
  sidebarVerifiedClassName,
} from "./tailwindClasses";

function getInitials(fullName = "EatNow") {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

type AccountSidebarProps = {
  user: PublicUser;
};

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const visibleItems = getVisibleAccountNavItems(user);
  const roles = getUserRoles(user);
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Bán hàng cùng EatNow";

  return (
    <aside className={sidebarClassName} aria-label="Điều hướng tài khoản">
      <section
        className={sidebarSummaryClassName}
        aria-label="Tóm tắt tài khoản"
      >
        <div className={sidebarAvatarWrapClassName}>
          <Avatar className={sidebarAvatarClassName} src={user.avatarUrl}>
            {getInitials(user.fullName)}
          </Avatar>
          <span
            className={sidebarVerifiedClassName}
            aria-label="Tài khoản đã xác thực"
          >
            <VerifiedOutlinedIcon fontSize="small" />
          </span>
        </div>

        <Typography variant="h3" component="h2" className={sidebarNameClassName}>
          {user.fullName}
        </Typography>
        <Typography color="text.secondary" className={sidebarEmailClassName}>
          {user.email}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{ flexWrap: "wrap", justifyContent: "center" }}
        >
          {roles.map((role) => (
            <Chip
              key={role}
              label={formatRole(role)}
              size="small"
              className={roleChipClassName}
            />
          ))}
        </Stack>
      </section>

      <nav className={sidebarNavClassName} aria-label="Menu tài khoản">
        <div className={sidebarLinksClassName}>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isSelected = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isSelected ? "page" : undefined}
                className={sidebarLinkClassName(isSelected)}
                data-selected={isSelected}
              >
                <Icon fontSize="small" />
                <span>
                  {item.href === "/account/seller" ? sellerLabel : item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Divider className={sidebarDividerClassName} />

        <form action={logout}>
          <Button
            fullWidth
            color="error"
            variant="text"
            type="submit"
            startIcon={<LogoutOutlinedIcon />}
            className={sidebarLogoutClassName}
          >
            Đăng xuất
          </Button>
        </form>
      </nav>
    </aside>
  );
}
