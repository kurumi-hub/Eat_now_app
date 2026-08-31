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
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  listAddressesAction,
  setDefaultAddressAction,
} from "@/app/account/addresses/actions";
import { logout } from "@/app/auth/actions";
import { useCart } from "@/contexts/CartContext";
import type { AccountAddress } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import {
  DEFAULT_DELIVERY_LOCATION_LABEL,
  getAddressLineLabel,
  getAddressLocationLabel,
} from "@/utils/addressDisplay";
import { hasAnyRole, hasRole } from "@/utils/roles";
import {
  accountMenuLinkClassName,
  accountMenuLogoutClassName,
  authActionsClassName,
  avatarButtonClassName,
  avatarClassName,
  cartLinkClassName,
  headerBrandGroupClassName,
  headerClassName,
  headerInnerClassName,
  locationButtonClassName,
  locationChipClassName,
  locationManageClassName,
  locationMenuClassName,
  locationMenuHeaderClassName,
  locationMenuListClassName,
  locationMenuLoadingClassName,
  locationMenuStateClassName,
  locationOptionClassName,
  locationOptionNameClassName,
  locationOptionSecondaryClassName,
  loginButtonClassName,
  logoClassName,
  navClassName,
  navItemClassName,
  registerButtonClassName,
  searchButtonClassName,
  searchFormClassName,
  searchInputClassName,
  topActionsClassName,
} from "./tailwindClasses";

type CustomerHeaderProps = {
  user: PublicUser | null;
  onPlaceholder: (message: string) => void;
  onSectionNavigate: (sectionId: string) => void;
  deliveryLocationLabel?: string;
  searchValue?: string;
};

const navItems: { label: string; href: string; sectionId?: string }[] = [
  { label: "Khám phá", href: "/#home-hero", sectionId: "home-hero" },
  { label: "Nhà hàng", href: "/restaurants" },
  { label: "Ưu đãi", href: "/vouchers" },
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
  deliveryLocationLabel = DEFAULT_DELIVERY_LOCATION_LABEL,
  searchValue = "",
}: CustomerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [locationMenuAnchor, setLocationMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<AccountAddress[]>(
    []
  );
  const [activeDeliveryLocationLabel, setActiveDeliveryLocationLabel] =
    useState("");
  const [isLoadingDeliveryAddresses, setIsLoadingDeliveryAddresses] =
    useState(false);
  const [pendingAddressId, setPendingAddressId] = useState("");
  const [isSelectingLocation, startSelectingLocation] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Mở quán trên EatNow";
  const canChooseDeliveryAddress = hasRole(user, "CUSTOMER");
  const displayedDeliveryLocationLabel =
    activeDeliveryLocationLabel || deliveryLocationLabel;

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

  const loadDeliveryAddresses = async () => {
    if (!canChooseDeliveryAddress) return;

    setIsLoadingDeliveryAddresses(true);

    try {
      const addresses = await listAddressesAction();
      setDeliveryAddresses(addresses);
    } catch {
      onPlaceholder("Không thể tải danh sách địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsLoadingDeliveryAddresses(false);
    }
  };

  const handleLocationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLocationMenuAnchor(event.currentTarget);
    void loadDeliveryAddresses();
  };

  const handleLocationMenuClose = () => {
    setLocationMenuAnchor(null);
  };

  const handleSelectDeliveryAddress = (address: AccountAddress) => {
    if (isSelectingLocation || pendingAddressId) return;

    const nextLocationLabel = getAddressLocationLabel(address);

    if (address.isDefault) {
      setActiveDeliveryLocationLabel(nextLocationLabel);
      handleLocationMenuClose();
      return;
    }

    setPendingAddressId(address.id);
    setDeliveryAddresses((currentAddresses) =>
      currentAddresses.map((currentAddress) => ({
        ...currentAddress,
        isDefault: currentAddress.id === address.id,
      }))
    );
    setActiveDeliveryLocationLabel(nextLocationLabel);

    startSelectingLocation(() => {
      void (async () => {
        try {
          await setDefaultAddressAction(address.id);
          handleLocationMenuClose();
          router.refresh();
        } catch {
          onPlaceholder("Không thể đổi vị trí giao hàng. Vui lòng thử lại.");
          setActiveDeliveryLocationLabel("");
          void loadDeliveryAddresses();
        } finally {
          setPendingAddressId("");
        }
      })();
    });
  };

  return (
    <header className={headerClassName}>
      <div className={headerInnerClassName}>
        <div className={headerBrandGroupClassName}>
          <Link className={logoClassName} href="/" aria-label="EatNow trang chủ">
            EatNow
          </Link>
          <button
            className={locationButtonClassName}
            type="button"
            aria-controls={
              locationMenuAnchor ? "delivery-location-menu" : undefined
            }
            aria-haspopup="menu"
            aria-expanded={locationMenuAnchor ? "true" : undefined}
            onClick={handleLocationMenuOpen}
          >
            <LocationOnOutlinedIcon fontSize="small" />
            <span>{displayedDeliveryLocationLabel}</span>
            <ExpandMoreOutlinedIcon fontSize="small" />
          </button>
          <Menu
            id="delivery-location-menu"
            anchorEl={locationMenuAnchor}
            open={Boolean(locationMenuAnchor)}
            onClose={handleLocationMenuClose}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          >
            <div className={locationMenuClassName}>
              <div className={locationMenuHeaderClassName}>
                <strong>Chọn địa chỉ giao hàng</strong>
                <span>{displayedDeliveryLocationLabel}</span>
              </div>

              {!user ? (
                <div className={locationMenuStateClassName}>
                  <p>Đăng nhập để chọn địa chỉ giao hàng đã lưu.</p>
                  <Link href="/login" onClick={handleLocationMenuClose}>
                    Đăng nhập
                  </Link>
                </div>
              ) : !canChooseDeliveryAddress ? (
                <div className={locationMenuStateClassName}>
                  <p>Tài khoản này chưa bật địa chỉ giao hàng.</p>
                  <Link href="/account/profile" onClick={handleLocationMenuClose}>
                    Xem tài khoản
                  </Link>
                </div>
              ) : isLoadingDeliveryAddresses && deliveryAddresses.length === 0 ? (
                <div className={locationMenuLoadingClassName}>
                  <CircularProgress size={18} />
                  <span>Đang tải địa chỉ...</span>
                </div>
              ) : deliveryAddresses.length > 0 ? (
                <div className={locationMenuListClassName}>
                  {deliveryAddresses.map((address) => (
                    <MenuItem
                      className={locationOptionClassName(address.isDefault)}
                      data-active={address.isDefault}
                      key={address.id}
                      onClick={() => handleSelectDeliveryAddress(address)}
                      disabled={Boolean(
                        pendingAddressId && pendingAddressId !== address.id
                      )}
                    >
                      <ListItemIcon>
                        <HomeWorkOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <span className={locationOptionNameClassName}>
                            {address.recipientName || "Địa chỉ giao hàng"}
                          </span>
                        }
                        secondary={
                          <span className={locationOptionSecondaryClassName}>
                            {getAddressLineLabel(address)}
                          </span>
                        }
                      />
                      {pendingAddressId === address.id ? (
                        <CircularProgress size={18} />
                      ) : address.isDefault ? (
                        <Chip
                          className={locationChipClassName}
                          size="small"
                          label="Đang dùng"
                        />
                      ) : null}
                    </MenuItem>
                  ))}
                </div>
              ) : (
                <div className={locationMenuStateClassName}>
                  <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                  <Link href="/account/addresses" onClick={handleLocationMenuClose}>
                    Thêm địa chỉ
                  </Link>
                </div>
              )}

              <Divider />
              <Link
                className={locationManageClassName}
                href="/account/addresses"
                onClick={handleLocationMenuClose}
              >
                Quản lý địa chỉ
              </Link>
            </div>
          </Menu>
        </div>

        <form className={searchFormClassName} role="search" onSubmit={handleSearchSubmit}>
          <span className="sr-only">
            Tìm kiếm món ăn hoặc nhà hàng
          </span>
          <InputBase
            className={searchInputClassName}
            placeholder="Tìm kiếm món ăn, nhà hàng..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            inputProps={{ "aria-label": "Tìm kiếm món ăn hoặc nhà hàng" }}
          />
          <IconButton
            type="submit"
            aria-label="Tìm kiếm"
            className={searchButtonClassName}
          >
            <SearchOutlinedIcon />
          </IconButton>
        </form>

        <nav className={navClassName} aria-label="Điều hướng trang chủ">
          {navItems.map((item) => {
            const isActive =
              item.href === "/restaurants"
                ? pathname === "/restaurants"
                : item.href === "/vouchers"
                ? pathname.startsWith("/vouchers")
                : pathname === "/" && item.sectionId === "home-hero";

            return (
              <Link
                key={item.label}
                className={navItemClassName(isActive)}
                href={item.href}
                onClick={(e) => {
                  if (item.sectionId && pathname === "/") {
                    e.preventDefault();
                    onSectionNavigate(item.sectionId);
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={topActionsClassName}>
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className={cartLinkClassName}
          >
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </Link>

          {user ? (
            <>
              <IconButton
                className={avatarButtonClassName}
                aria-label="Mở menu tài khoản"
                aria-controls={menuAnchor ? "customer-account-menu" : undefined}
                aria-haspopup="menu"
                aria-expanded={menuAnchor ? "true" : undefined}
                onClick={handleMenuOpen}
              >
                <Avatar className={avatarClassName} src={user.avatarUrl}>
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
                  className={accountMenuLinkClassName}
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
                  className={accountMenuLinkClassName}
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
                    className={accountMenuLinkClassName}
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
                  className={accountMenuLinkClassName}
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
                    className={accountMenuLinkClassName}
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
                  <button type="submit" className={accountMenuLogoutClassName}>
                    <LogoutOutlinedIcon fontSize="small" />
                    <span>Đăng xuất</span>
                  </button>
                </form>
              </Menu>
            </>
          ) : (
            <div className={authActionsClassName}>
              <Link className={loginButtonClassName} href="/login">
                Đăng nhập
              </Link>
              <Link className={registerButtonClassName} href="/register">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
