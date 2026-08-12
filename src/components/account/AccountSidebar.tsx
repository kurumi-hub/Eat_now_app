"use client";

import { BadgeCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/auth/actions";
import type { PublicUser } from "@/types/auth";
import { formatRole, getUserRoles, hasRole } from "@/utils/roles";
import { Avatar, Divider } from "@/components/ui/Primitives";
import Button from "@/components/ui/Button";
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
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Bán hàng cùng EatNow";

  return (
    <aside className="account-sidebar" aria-label="Điều hướng tài khoản">
      <section
        className="account-sidebar-summary"
        aria-label="Tóm tắt tài khoản"
      >
        <div className="account-sidebar-avatar-wrap">
          <Avatar
            className="account-sidebar-avatar"
            src={user.avatarUrl}
            fallback={getInitials(user.fullName)}
            size={72}
          />
          <span
            className="account-sidebar-verified"
            aria-label="Tài khoản đã xác thực"
          >
            <BadgeCheck size={18} />
          </span>
        </div>

        <h2 className="account-sidebar-name">{user.fullName}</h2>
        <p className="account-sidebar-email text-[var(--brand-text-soft)]">
          {user.email}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {roles.map((role) => (
            <span key={role} className="account-role-chip">
              {formatRole(role)}
            </span>
          ))}
        </div>
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
                <Icon size={18} />
                <span>
                  {item.href === "/account/seller" ? sellerLabel : item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Divider className="account-sidebar-divider" />

        <form action={logout}>
          <Button
            fullWidth
            variant="text"
            type="submit"
            startIcon={<LogOut size={18} />}
            className="account-sidebar-logout !text-[var(--brand-error)]"
          >
            Đăng xuất
          </Button>
        </form>
      </nav>
    </aside>
  );
}
