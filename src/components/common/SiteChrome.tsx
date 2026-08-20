"use client";

import { Alert, Snackbar } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import SiteFooter from "@/components/common/SiteFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import {
  NAVIGATION_START_EVENT,
  signalNavigationStart,
} from "@/utils/navigationFeedback";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [navigating, setNavigating] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const hideChrome = CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    setNavigating(false);
  }, [routeKey]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setNavigating(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setNavigating(false), 12000);
    };
    window.addEventListener(NAVIGATION_START_EVENT, start);
    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, start);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    const target = event.target as Element;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target === "_blank" || event.metaKey || event.ctrlKey) {
      return;
    }

    const next = new URL(anchor.href, window.location.href);
    if (
      next.origin === window.location.origin &&
      `${next.pathname}${next.search}` !==
        `${window.location.pathname}${window.location.search}`
    ) {
      signalNavigationStart();
    }
  };

  const navigateToSection = (sectionId: string) => {
    if (pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    signalNavigationStart();
    router.push(`/#${sectionId}`);
  };

  if (hideChrome) return children;

  return (
    <div className="site-chrome" onClickCapture={handleClickCapture}>
      <div
        className={`navigation-progress${navigating ? " is-visible" : ""}`}
        role="progressbar"
        aria-label="Đang chuyển trang"
        aria-hidden={!navigating}
      />
      <CustomerHeader
        user={user}
        deliveryAddress={deliveryAddress}
        activeSectionId={pathname === "/" ? "home-hero" : null}
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
