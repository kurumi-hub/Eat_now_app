"use client";

import { Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, SyntheticEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

import type { PublicUser } from "@/types/auth";
import { hasAnyRole } from "@/utils/roles";
import { signalNavigationStart } from "@/utils/navigationFeedback";
import AccountSidebar from "./AccountSidebar";
import { getVisibleAccountNavItems } from "./accountNavItems";

type AccountLayoutProps = {
  user: PublicUser;
  children: ReactNode;
};

export default function AccountLayout({ user, children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startNavigation] = useTransition();
  const [optimisticPath, setOptimisticPath] = useState(pathname);
  const visibleItems = useMemo(() => getVisibleAccountNavItems(user), [user]);
  const currentPath = visibleItems.some((item) => item.href === optimisticPath)
    ? optimisticPath
    : visibleItems[0]?.href ?? false;
  const sellerLabel = hasAnyRole(user, ["RESTAURANT_OWNER", "RESTAURANT_STAFF"])
    ? "Nhà hàng của tôi"
    : "Bán hàng cùng EatNow";

  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const handleMobileNavChange = (_event: SyntheticEvent, value: string) => {
    if (value === pathname) return;
    setOptimisticPath(value);
    signalNavigationStart();
    startNavigation(() => router.push(value));
  };

  return (
    <div className="account-page">
      <main className="account-shell">
        <div className="account-layout-grid">
          <AccountSidebar user={user} />

          <div className="account-main-column">
            <div className="account-mobile-nav">
              <Tabs
                value={currentPath}
                onChange={handleMobileNavChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Điều hướng tài khoản"
              >
                {visibleItems.map((item) => (
                  <Tab
                    key={item.href}
                    label={
                      item.href === "/account/seller" ? sellerLabel : item.label
                    }
                    value={item.href}
                    onPointerEnter={() => router.prefetch(item.href)}
                    onFocus={() => router.prefetch(item.href)}
                  />
                ))}
              </Tabs>
            </div>

            <section className="account-content" aria-label="Nội dung tài khoản">
              {children}
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
