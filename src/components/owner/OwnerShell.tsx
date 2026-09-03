"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
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

import * as ownerStyles from "@/components/owner/tailwindClasses";
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
      className={ownerStyles.sidebarLinkClassName(active)}
      onClick={onNavigate}
    >
      <Icon className={ownerStyles.sidebarIconClassName} fontSize="small" />
      <span>{item.label}</span>
      {item.badge ? <span className={ownerStyles.sidebarBadgeClassName}>{item.badge}</span> : null}
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
    <div className={ownerStyles.shellClassName(isMenuOpen)}>
      <aside
        className={ownerStyles.sidebarClassName}
        data-menu-open={isMenuOpen ? "true" : "false"}
        aria-label="Restaurant Owner navigation"
      >
        <div className={ownerStyles.sidebarBrandClassName}>
          <StorefrontIcon className={ownerStyles.sidebarBrandIconClassName} />
          <div>
            <p className={ownerStyles.sidebarBrandTitleClassName}>EatNow</p>
            <span className={ownerStyles.sidebarBrandSubtitleClassName}>Restaurant Owner</span>
          </div>
        </div>

        <Link
          href="/"
          className="mx-1 flex min-h-[36px] items-center justify-center gap-2 rounded-[7px] border border-[#ddc1b4] bg-[#fff8f5] px-3 py-1.5 text-xs font-bold text-[#7a3000] hover:bg-[#ffd3c6] transition-colors shadow-sm"
          title="Quay về trang chủ EatNow"
          onClick={closeMenu}
        >
          <HomeOutlinedIcon fontSize="small" />
          <span>Về trang chủ EatNow</span>
        </Link>

        <nav className={ownerStyles.sidebarNavClassName} aria-label="Owner main menu">
          {ownerNavItems.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              active={isActivePath(pathname, item)}
              onNavigate={closeMenu}
            />
          ))}
        </nav>

        <div className={ownerStyles.sidebarBottomClassName}>
          <SidebarLink
            item={ownerSettingsNavItem}
            active={isActivePath(pathname, ownerSettingsNavItem)}
            onNavigate={closeMenu}
          />
          <Link
            href="/owner/menu/new"
            className={ownerStyles.sidebarCtaClassName}
            onClick={closeMenu}
          >
            <AddIcon fontSize="small" />
            <span>Add New Dish</span>
          </Link>
          <div className={ownerStyles.sidebarProfileClassName}>
            <div className={ownerStyles.sidebarAvatarClassName} aria-hidden="true">
              OP
            </div>
            <div>
              <p className={ownerStyles.sidebarProfileNameClassName}>
                {ownerRestaurant.ownerProfileName}
              </p>
              <span className={ownerStyles.sidebarProfileIdClassName}>
                ID: {ownerRestaurant.ownerProfileId}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <button
        className={ownerStyles.backdropClassName(isMenuOpen)}
        type="button"
        aria-label="Đóng menu"
        onClick={closeMenu}
      />

      <header className={ownerStyles.mobileBarClassName}>
        <button
          type="button"
          className={ownerStyles.mobileIconButtonClassName}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div>
          <p className={ownerStyles.mobileBrandTitleClassName}>EatNow</p>
          <span className={ownerStyles.mobileBrandSubtitleClassName}>
            {activeItem?.label ?? "Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-[#ddc1b4] bg-[#fff8f5] px-2.5 py-1 text-xs font-bold text-[#7a3000] hover:bg-[#ffd3c6] transition-colors"
            title="Quay về trang chủ EatNow"
          >
            <HomeOutlinedIcon fontSize="small" />
            <span>Về EatNow</span>
          </Link>
          <span className={ownerStyles.mobileBadgeClassName}>{ordersBadge}</span>
        </div>
      </header>

      <main className={ownerStyles.mainClassName}>{children}</main>

      <nav className={ownerStyles.bottomNavClassName} aria-label="Owner mobile menu">
        {ownerNavItems.slice(0, 4).map((item) => {
          const active = isActivePath(pathname, item);
          const Icon = active ? iconMap[item.id].filled : iconMap[item.id].outlined;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={ownerStyles.bottomNavLinkClassName(active)}
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
