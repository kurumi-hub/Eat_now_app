import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";

import AppThemeProvider from "@/theme/AppThemeProvider";
import SiteChrome from "@/components/common/SiteChrome";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";
import "./globals.css";
import "@/styles/variables.css";
import "@/styles/global.css";
import "@/styles/routes.css";
import "@/styles/home.css";
import "@/styles/auth.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EatNow - Đói bụng? EatNow lo hết.",
  description:
    "EatNow - app đặt đồ ăn giao nhanh, hơn 2.000 quán ăn quanh bạn, giao trung bình 15 phút.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentPublicUser();
  const addresses =
    user && hasRole(user, "CUSTOMER") ? await getCurrentUserAddresses() : [];
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${beVietnamPro.variable}`}
    >
      <body className="eatnow-body">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppThemeProvider>
            <Suspense fallback={children}>
              <SiteChrome
                user={user}
                deliveryAddress={defaultAddress?.line1 ?? null}
              >
                {children}
              </SiteChrome>
            </Suspense>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
