"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import {
  Avatar,
  Badge,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/auth/actions";
import type { PublicUser } from "@/types/auth";
import { hasAnyRole, hasRole } from "@/utils/roles";
import { useCartStore } from "@/store/cartStore";
import { useCartSession } from "@/store/useCartSession";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { signalNavigationStart } from "@/utils/navigationFeedback";

type CustomerHeaderProps = {
  user: PublicUser | null;
  deliveryAddress?: string | null;
  activeSectionId?: string | null;
  onSectionNavigate: (sectionId: string) => void;
};

const navItems = [
  { label: "Khám phá", sectionId: "home-hero" },
  { label: "Nhà hàng", sectionId: "restaurants", href: "/restaurants" },
  { label: "Ưu đãi", sectionId: "vouchers", href: "/vouchers" },
];

function getInitials(fullName = "EatNow") {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export default function CustomerHeader({
  user,
  deliveryAddress,
  activeSectionId = "home-hero",
  onSectionNavigate,
}: CustomerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeSearch = pathname === "/restaurants" ? searchParams.get("q")?.trim() ?? "" : "";
  const [search, setSearch] = useState(routeSearch);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const hasSellerAccess = hasAnyRole(user, [
    "RESTAURANT_OWNER",
    "RESTAURANT_STAFF",
  ]);
  const sellerLabel = hasSellerAccess ? "Kênh người bán" : "Mở quán trên EatNow";
  const sellerHref = hasSellerAccess ? "/owner" : "/account/seller";

  // Đợi hydrate xong (persist middleware) mới đọc số lượng từ store để
  // tránh lệch nội dung giữa server render và client render.
  const totalItems = useCartStore((state) => state.totalItems());
  const resetCartSession = useCartStore((state) => state.resetCartSession);
  const cartReady = useCartSession(user?.id ?? null);
  const cartBadgeCount = cartReady ? totalItems : 0;

  useEffect(() => setSearch(routeSearch), [routeSearch]);

  const navigateToSearch = (value: string, replace = false) => {
    const next = pathname === "/restaurants"
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    const normalized = value.trim();
    if (normalized) next.set("q", normalized);
    else next.delete("q");
    next.delete("page");
    const query = next.toString();
    signalNavigationStart();
    const href = `/restaurants${query ? `?${query}` : ""}`;
    if (replace) router.replace(href);
    else router.push(href);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    if (pathname === "/restaurants" && routeSearch) navigateToSearch("", true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <div className="home-header__brand-group">
          <Link className="home-logo" href="/?home=1" aria-label="EatNow trang chủ">
            EatNow
          </Link>
          <Link
            className="home-location"
            href={
              hasRole(user, "CUSTOMER")
                ? "/account/addresses"
                : user
                  ? "/account/profile"
                  : "/login?next=/account/addresses"
            }
            title={deliveryAddress || "Chọn địa chỉ giao hàng"}
          >
            <LocationOnOutlinedIcon fontSize="small" />
            <span>{deliveryAddress || "Chọn địa chỉ giao hàng"}</span>
            <ExpandMoreOutlinedIcon fontSize="small" />
          </Link>
        </div>

        <form className="home-search" role="search" onSubmit={handleSearchSubmit}>
          <span className="home-visually-hidden">
            Tìm kiếm món ăn hoặc nhà hàng
          </span>
          <InputBase
            className="home-search__input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm nhà hàng hoặc món ăn..."
            inputProps={{ "aria-label": "Tìm kiếm món ăn hoặc nhà hàng" }}
          />
          {search ? (
            <IconButton
              type="button"
              aria-label="Xóa từ khóa tìm kiếm"
              className="home-search__clear"
              onClick={clearSearch}
            >
              <CloseOutlinedIcon />
            </IconButton>
          ) : null}
          <IconButton
            type="submit"
            aria-label="Tìm kiếm"
            className="home-search__button"
          >
            <SearchOutlinedIcon />
          </IconButton>
        </form>

        <nav className="home-nav" aria-label="Điều hướng trang chủ">
          {navItems.map((item) => {
            const className = `home-nav__item ${item.sectionId === activeSectionId ? "is-active" : ""}`;
            return item.href ? (
              <Link key={item.label} className={className} href={item.href}>{item.label}</Link>
            ) : (
              <button key={item.label} className={className} type="button" onClick={() => onSectionNavigate(item.sectionId)}>{item.label}</button>
            );
          })}
        </nav>

        <div className="home-actions-top">
          {user ? <NotificationCenter user={user} /> : null}
          {user ? (
            <IconButton
              aria-label="Giỏ hàng"
              className="home-cart-button"
              component={Link}
              href="/cart"
            >
              <Badge badgeContent={cartBadgeCount} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          ) : null}

          {user ? (
            <>
              <IconButton
                className="home-avatar-button"
                aria-label="Mở menu tài khoản"
                aria-controls={menuAnchor ? "customer-account-menu" : undefined}
                aria-haspopup="menu"
                aria-expanded={menuAnchor ? "true" : undefined}
                onClick={handleMenuOpen}
              >
                <Avatar className="home-avatar" src={user.avatarUrl}>
                  {getInitials(user.fullName)}
                </Avatar>
              </IconButton>
              <Menu
                id="customer-account-menu"
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Link
                  href="/account/profile"
                  className="home-account-menu__link"
                  onClick={handleMenuClose}
                >
                  <MenuItem component="span">
                    <ListItemIcon>
                      <ManageAccountsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Tài khoản của tôi</ListItemText>
                  </MenuItem>
                </Link>
                <Link href="/orders" className="home-account-menu__link" onClick={handleMenuClose}>
                  <MenuItem component="span">
                    <ListItemIcon><ReceiptLongOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Đơn hàng của tôi</ListItemText>
                  </MenuItem>
                </Link>
                {hasRole(user, "CUSTOMER") ? (
                  <Link
                    href="/account/addresses"
                    className="home-account-menu__link"
                    onClick={handleMenuClose}
                  >
                    <MenuItem component="span">
                      <ListItemIcon>
                        <HomeWorkOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Địa chỉ giao hàng</ListItemText>
                    </MenuItem>
                  </Link>
                ) : null}
                <Link
                  href="/account/preferences"
                  className="home-account-menu__link"
                  onClick={handleMenuClose}
                >
                  <MenuItem component="span">
                    <ListItemIcon>
                      <NotificationsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Cài đặt</ListItemText>
                  </MenuItem>
                </Link>
                {hasAnyRole(user, ["SUPER_ADMIN", "ADMIN"]) ? (
                  <Link
                    href="/admin"
                    className="home-account-menu__link"
                    onClick={handleMenuClose}
                  >
                    <MenuItem component="span">
                      <ListItemIcon>
                        <AdminPanelSettingsOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Khu vực quản trị</ListItemText>
                    </MenuItem>
                  </Link>
                ) : null}
                {hasAnyRole(user, ["SUPER_ADMIN", "ADMIN", "MODERATOR"]) ? (
                  <Link
                    href="/moderator"
                    className="home-account-menu__link"
                    onClick={handleMenuClose}
                  >
                    <MenuItem component="span">
                      <ListItemIcon>
                        <GavelOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Điều hành nội dung</ListItemText>
                    </MenuItem>
                  </Link>
                ) : null}
                {hasAnyRole(user, [
                  "CUSTOMER",
                  "RESTAURANT_OWNER",
                  "RESTAURANT_STAFF",
                ]) ? (
                  <Link
                    href={sellerHref}
                    className="home-account-menu__link"
                    onClick={handleMenuClose}
                  >
                    <MenuItem component="span">
                      <ListItemIcon>
                        <StorefrontOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{sellerLabel}</ListItemText>
                    </MenuItem>
                  </Link>
                ) : null}
                <Link
                  href="/shipper"
                  className="home-account-menu__link"
                  onClick={handleMenuClose}
                >
                  <MenuItem component="span">
                    <ListItemIcon>
                      <LocalShippingOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{hasRole(user, "SHIPPER") ? "Kênh tài xế" : "Đăng ký làm tài xế"}</ListItemText>
                  </MenuItem>
                </Link>
                <Divider />
                <form action={logout} onSubmit={resetCartSession}>
                  <button type="submit" className="home-account-menu__logout">
                    <LogoutOutlinedIcon fontSize="small" />
                    <span>Đăng xuất</span>
                  </button>
                </form>
              </Menu>
            </>
          ) : (
            <div className="home-auth-actions">
              <Link className="home-login-button" href="/login">
                Đăng nhập
              </Link>
              <Link className="home-register-button" href="/register">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
