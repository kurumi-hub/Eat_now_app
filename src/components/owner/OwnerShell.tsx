"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PaymentsIcon from "@mui/icons-material/Payments";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { SvgIconComponent } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  ordersBadge,
  ownerNavItems,
  ownerRestaurant,
  ownerSettingsNavItem,
  type OwnerNavItem,
} from "@/components/owner/ownerFlowData";

const iconMap: Record<
  OwnerNavItem["id"],
  { outlined: SvgIconComponent; filled: SvgIconComponent }
> = {
  dashboard: { outlined: DashboardOutlinedIcon, filled: DashboardIcon },
  orders: { outlined: ReceiptLongOutlinedIcon, filled: ReceiptLongIcon },
  menu: { outlined: RestaurantMenuOutlinedIcon, filled: RestaurantMenuIcon },
  revenue: { outlined: PaymentsOutlinedIcon, filled: PaymentsIcon },
  reviews: { outlined: StarBorderIcon, filled: StarIcon },
  settings: { outlined: SettingsOutlinedIcon, filled: SettingsIcon },
};

type OwnerShellProps = {
  children: ReactNode;
};

function isActivePath(pathname: string, item: OwnerNavItem) {
  if (item.href === "/owner") {
    return pathname === "/owner";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: OwnerNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = active ? iconMap[item.id].filled : iconMap[item.id].outlined;

  return (
    <Link
      href={item.href}
      className={`owner-sidebar__link${active ? " is-active" : ""}`}
      onClick={onNavigate}
    >
      <Icon className="owner-sidebar__icon" fontSize="small" />
      <span>{item.label}</span>
      {item.badge ? <span className="owner-sidebar__badge">{item.badge}</span> : null}
    </Link>
  );
}

export default function OwnerShell({ children }: OwnerShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeItem = [...ownerNavItems, ownerSettingsNavItem].find((item) =>
    isActivePath(pathname, item)
  );

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={`owner-shell${isMenuOpen ? " is-menu-open" : ""}`}>
      <aside className="owner-sidebar" aria-label="Restaurant Owner navigation">
        <div className="owner-sidebar__brand">
          <StorefrontIcon className="owner-sidebar__brand-icon" />
          <div>
            <p>EatNow</p>
            <span>Restaurant Owner</span>
          </div>
        </div>

        <nav className="owner-sidebar__nav" aria-label="Owner main menu">
          {ownerNavItems.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              active={isActivePath(pathname, item)}
              onNavigate={closeMenu}
            />
          ))}
        </nav>

        <div className="owner-sidebar__bottom">
          <SidebarLink
            item={ownerSettingsNavItem}
            active={isActivePath(pathname, ownerSettingsNavItem)}
            onNavigate={closeMenu}
          />
          <Link
            href="/owner/menu/new"
            className="owner-sidebar__cta"
            onClick={closeMenu}
          >
            <AddIcon fontSize="small" />
            <span>Add New Dish</span>
          </Link>
          <div className="owner-sidebar__profile">
            <div className="owner-sidebar__avatar" aria-hidden="true">
              OP
            </div>
            <div>
              <p>{ownerRestaurant.ownerProfileName}</p>
              <span>ID: {ownerRestaurant.ownerProfileId}</span>
            </div>
          </div>
        </div>
      </aside>

      <button
        className="owner-shell__backdrop"
        type="button"
        aria-label="Đóng menu"
        onClick={closeMenu}
      />

      <header className="owner-mobile-bar">
        <button
          type="button"
          className="owner-icon-button"
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div>
          <p>EatNow</p>
          <span>{activeItem?.label ?? "Dashboard"}</span>
        </div>
        <span className="owner-mobile-bar__badge">{ordersBadge}</span>
      </header>

      <main className="owner-main">{children}</main>

      <nav className="owner-bottom-nav" aria-label="Owner mobile menu">
        {ownerNavItems.slice(0, 4).map((item) => {
          const active = isActivePath(pathname, item);
          const Icon = active ? iconMap[item.id].filled : iconMap[item.id].outlined;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={active ? "is-active" : ""}
            >
              <Icon fontSize="small" />
              <span>{item.id === "dashboard" ? "Home" : item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
