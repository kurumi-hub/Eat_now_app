"use client";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Avatar, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/auth/actions";
import type { PublicUser } from "@/types/auth";
import { useCartStore } from "@/store/cartStore";
import { formatRole, getUserRoles, hasAnyRole } from "@/utils/roles";
import { getVisibleAccountNavItems } from "./accountNavItems";

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
  const resetCartSession = useCartStore((state) => state.resetCartSession);
  const sellerLabel = hasAnyRole(user, ["RESTAURANT_OWNER", "RESTAURANT_STAFF"])
    ? "Nhà hàng của tôi"
    : "Bán hàng cùng EatNow";

  return (
    <aside className="account-sidebar" aria-label="Điều hướng tài khoản">
      <section
        className="account-sidebar-summary"
        aria-label="Tóm tắt tài khoản"
      >
        <div className="account-sidebar-avatar-wrap">
          <Avatar className="account-sidebar-avatar" src={user.avatarUrl}>
            {getInitials(user.fullName)}
          </Avatar>
          <span
            className="account-sidebar-verified"
            aria-label="Tài khoản đã xác thực"
          >
            <VerifiedOutlinedIcon fontSize="small" />
          </span>
        </div>

        <Typography variant="h3" component="h2" className="account-sidebar-name">
          {user.fullName}
        </Typography>
        <Typography color="text.secondary" className="account-sidebar-email">
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
              className="account-role-chip"
            />
          ))}
        </Stack>
      </section>

      <nav className="account-sidebar-nav" aria-label="Menu tài khoản">
        <div className="account-sidebar-links">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isSelected = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isSelected ? "page" : undefined}
                className={`account-sidebar-link${
                  isSelected ? " is-selected" : ""
                }`}
              >
                <Icon fontSize="small" />
                <span>
                  {item.href === "/account/seller" ? sellerLabel : item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Divider className="account-sidebar-divider" />

        <form action={logout} onSubmit={resetCartSession}>
          <Button
            fullWidth
            color="error"
            variant="text"
            type="submit"
            startIcon={<LogoutOutlinedIcon />}
            className="account-sidebar-logout"
          >
            Đăng xuất
          </Button>
        </form>
      </nav>
    </aside>
  );
}
