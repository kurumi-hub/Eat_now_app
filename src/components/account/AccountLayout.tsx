"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import { hasRole } from "@/utils/roles";
import SnackbarToast from "@/components/ui/Snackbar";
import AccountSidebar from "./AccountSidebar";
import { getVisibleAccountNavItems } from "./accountNavItems";

type AccountLayoutProps = {
  user: PublicUser;
  children: ReactNode;
};

export default function AccountLayout({ user, children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const visibleItems = useMemo(() => getVisibleAccountNavItems(user), [user]);
  const currentPath = visibleItems.some((item) => item.href === pathname)
    ? pathname
    : visibleItems[0]?.href ?? "";
  const sellerLabel = hasRole(user, "RESTAURANT_OWNER")
    ? "Kênh người bán"
    : "Bán hàng cùng EatNow";

  const handlePlaceholder = (message: string) => {
    setNotice(message);
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  return (
    <div className="account-page">
      <CustomerHeader
        user={user}
        onPlaceholder={handlePlaceholder}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="account-shell">
        <div className="account-layout-grid">
          <AccountSidebar user={user} />

          <div className="account-main-column">
            <div className="account-mobile-nav">
              <div
                role="tablist"
                aria-label="Điều hướng tài khoản"
                className="flex gap-1 overflow-x-auto border-b border-[var(--brand-border)]"
              >
                {visibleItems.map((item) => (
                  <button
                    key={item.href}
                    role="tab"
                    aria-selected={item.href === currentPath}
                    onClick={() => router.push(item.href)}
                    className={[
                      "whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2",
                      item.href === currentPath
                        ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                        : "border-transparent text-[var(--brand-text-soft)] hover:text-[var(--brand-text)]",
                    ].join(" ")}
                  >
                    {item.href === "/account/seller" ? sellerLabel : item.label}
                  </button>
                ))}
              </div>
            </div>

            <section className="account-content" aria-label="Nội dung tài khoản">
              {children}
            </section>
          </div>
        </div>
      </main>

      <SnackbarToast
        open={Boolean(notice)}
        message={notice}
        severity="info"
        autoHideDuration={3200}
        onClose={() => setNotice("")}
      />
    </div>
  );
}
