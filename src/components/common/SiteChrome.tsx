"use client";

import { Alert, Snackbar } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import SiteFooter from "@/components/common/SiteFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";

type SiteChromeProps = {
  user: PublicUser | null;
  deliveryAddress?: string | null;
  children: ReactNode;
};

const CHROMELESS_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/signup",
  "/auth",
];

export default function SiteChrome({
  user,
  deliveryAddress,
  children,
}: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const hideChrome = CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const navigateToSection = (sectionId: string) => {
    if (pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    router.push(`/?home=1#${sectionId}`);
  };

  if (hideChrome) return children;

  return (
    <div className="site-chrome">
      <CustomerHeader
        user={user}
        deliveryAddress={deliveryAddress}
        activeSectionId={
          pathname === "/"
            ? "home-hero"
            : pathname === "/restaurants" || pathname.startsWith("/restaurants/")
              ? "restaurants"
            : pathname === "/vouchers"
              ? "vouchers"
              : null
        }
        onPlaceholder={setNotice}
        onSectionNavigate={navigateToSection}
      />
      {children}
      <SiteFooter onPlaceholder={setNotice} />
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
