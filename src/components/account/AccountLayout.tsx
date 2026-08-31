"use client";

import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, SyntheticEvent } from "react";
import { useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import { hasRole } from "@/utils/roles";
import AccountSidebar from "./AccountSidebar";
import { getVisibleAccountNavItems } from "./accountNavItems";
import {
  contentClassName,
  layoutGridClassName,
  mainColumnClassName,
  mobileNavClassName,
  mobileNavSx,
  pageClassName,
  shellClassName,
} from "./tailwindClasses";

type AccountLayoutProps = {
  user: PublicUser;
  deliveryLocationLabel?: string;
  children: ReactNode;
};

export default function AccountLayout({
  user,
  deliveryLocationLabel,
  children,
}: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const visibleItems = useMemo(() => getVisibleAccountNavItems(user), [user]);
  const currentPath = visibleItems.some((item) => item.href === pathname)
    ? pathname
    : visibleItems[0]?.href ?? false;
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Bán hàng cùng EatNow";

  const handlePlaceholder = (message: string) => {
    setNotice(message);
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const handleMobileNavChange = (_event: SyntheticEvent, value: string) => {
    router.push(value);
  };

  return (
    <div className={pageClassName}>
      <CustomerHeader
        user={user}
        deliveryLocationLabel={deliveryLocationLabel}
        onPlaceholder={handlePlaceholder}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className={shellClassName}>
        <div className={layoutGridClassName}>
          <AccountSidebar user={user} />

          <div className={mainColumnClassName}>
            <div className={mobileNavClassName}>
              <Tabs
                sx={mobileNavSx}
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
                  />
                ))}
              </Tabs>
            </div>

            <section className={contentClassName} aria-label="Nội dung tài khoản">
              {children}
            </section>
          </div>
        </div>
      </main>

      <CustomerFooter onPlaceholder={handlePlaceholder} />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3200}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      </Snackbar>
    </div>
  );
}
