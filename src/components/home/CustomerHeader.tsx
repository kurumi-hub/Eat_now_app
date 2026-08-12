"use client";

import {
  Building2,
  ChevronDown,
  LogOut,
  MapPin,
  Receipt,
  Search,
  ShoppingCart,
  Store,
  UserCog,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/auth/actions";
import type { PublicUser } from "@/types/auth";
import { hasAnyRole, hasRole } from "@/utils/roles";
import { useCartStore } from "@/store/cartStore";
import { Avatar } from "@/components/ui/Primitives";

type CustomerHeaderProps = {
  user: PublicUser | null;
  onPlaceholder: (message: string) => void;
  onSectionNavigate: (sectionId: string) => void;
};

const navItems = [
  { label: "Khám phá", sectionId: "home-hero" },
  { label: "Nhà hàng", sectionId: "featured-restaurants" },
  { label: "Công thức", sectionId: "recipes" },
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
}: CustomerHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Mở quán trên EatNow";

  const totalItems = useCartStore((state) => state.totalItems());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const cartBadgeCount = hydrated ? totalItems : 0;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPlaceholder(
      "Tính năng tìm kiếm sẽ được triển khai ở sprint tiếp theo."
    );
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
            <MapPin className="h-4 w-4" />
            <span>Ninh Kiều, Cần Thơ</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <form className="home-search" role="search" onSubmit={handleSearchSubmit}>
          <span className="home-visually-hidden">
            Tìm kiếm món ăn hoặc nhà hàng
          </span>
          <input
            className="home-search__input"
            placeholder="Tìm kiếm món ăn, nhà hàng..."
            aria-label="Tìm kiếm món ăn hoặc nhà hàng"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="home-search__button"
          >
            <Search className="h-5 w-5" />
          </button>
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
            aria-label="Giỏ hàng"
            className="home-cart-button relative"
            href="/cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartBadgeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-error)] px-1 text-[10px] font-bold text-white">
                {cartBadgeCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                className="home-avatar-button"
                aria-label="Mở menu tài khoản"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Avatar
                  className="home-avatar"
                  src={user.avatarUrl}
                  fallback={getInitials(user.fullName)}
                  size={36}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-[var(--brand-border)] bg-white py-2 shadow-xl"
                >
                  <Link
                    href="/account/profile"
                    className="home-account-menu__link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5">
                      <UserCog className="h-4 w-4" />
                      Tài khoản của tôi
                    </span>
                  </Link>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-black/5"
                    onClick={() => {
                      setMenuOpen(false);
                      onPlaceholder(
                        "Đơn hàng sẽ được triển khai ở sprint tiếp theo."
                      );
                    }}
                  >
                    <Receipt className="h-4 w-4" />
                    Đơn hàng của tôi
                  </button>
                  {hasRole(user, "CUSTOMER") ? (
                    <Link
                      href="/account/addresses"
                      className="home-account-menu__link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5">
                        <Building2 className="h-4 w-4" />
                        Địa chỉ giao hàng
                      </span>
                    </Link>
                  ) : null}
                  <Link
                    href="/account/preferences"
                    className="home-account-menu__link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5">
                      <Bell className="h-4 w-4" />
                      Cài đặt
                    </span>
                  </Link>
                  {hasAnyRole(user, ["CUSTOMER", "RESTAURANT_OWNER"]) ? (
                    <Link
                      href="/account/seller"
                      className="home-account-menu__link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5">
                        <Store className="h-4 w-4" />
                        {sellerLabel}
                      </span>
                    </Link>
                  ) : null}
                  <hr className="my-2 border-t border-[var(--brand-border)]" />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="home-account-menu__logout flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--brand-error)] hover:bg-black/5"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
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
