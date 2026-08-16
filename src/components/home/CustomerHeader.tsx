"use client";

import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/auth/actions";
import { useCart } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import { hasAnyRole, hasRole } from "@/utils/roles";

type CustomerHeaderProps = {
  user: PublicUser | null;
  onPlaceholder: (message: string) => void;
  onSectionNavigate: (sectionId: string) => void;
  searchValue?: string;
};

const navItems = [
  { label: "Khám phá", sectionId: "home-hero" },
  { label: "Nhà hàng", sectionId: "featured-restaurants" },
  { label: "Ưu đãi", sectionId: "featured-categories" },
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
  onPlaceholder,
  onSectionNavigate,
  searchValue = "",
}: CustomerHeaderProps) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Mở quán trên EatNow";

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = searchTerm.trim();

    if (!normalizedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
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
          <Link className="home-logo" href="/" aria-label="EatNow trang chủ">
            EatNow
          </Link>
          <button
            className="home-location"
            type="button"
            onClick={() =>
              onPlaceholder("Chọn vị trí giao hàng sẽ được hoàn thiện sau.")
            }
          >
            <LocationOnOutlinedIcon fontSize="small" />
            <span>Ninh Kiều, Cần Thơ</span>
            <ExpandMoreOutlinedIcon fontSize="small" />
          </button>
        </div>

        <form className="home-search" role="search" onSubmit={handleSearchSubmit}>
          <span className="home-visually-hidden">
            Tìm kiếm món ăn hoặc nhà hàng
          </span>
          <InputBase
            className="home-search__input"
            placeholder="Tìm kiếm món ăn, nhà hàng..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            inputProps={{ "aria-label": "Tìm kiếm món ăn hoặc nhà hàng" }}
          />
          <IconButton
            type="submit"
            aria-label="Tìm kiếm"
            className="home-search__button"
          >
            <SearchOutlinedIcon />
          </IconButton>
        </form>

        <nav className="home-nav" aria-label="Điều hướng trang chủ">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`home-nav__item ${
                item.sectionId === "home-hero" ? "is-active" : ""
              }`}
              type="button"
              onClick={() => onSectionNavigate(item.sectionId)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="home-actions-top">
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className="home-cart-link"
          >
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </Link>

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
                <Link
                  href="/orders"
                  className="home-account-menu__link"
                  onClick={handleMenuClose}
                >
                  <MenuItem component="span">
                    <ListItemIcon>
                      <ReceiptLongOutlinedIcon fontSize="small" />
                    </ListItemIcon>
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
                {hasAnyRole(user, ["CUSTOMER", "RESTAURANT_OWNER"]) ? (
                  <Link
                    href="/account/seller"
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
                <Divider />
                <form action={logout}>
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
