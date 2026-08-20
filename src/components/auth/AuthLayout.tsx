import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Box, Paper } from "@mui/material";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { getSiteMedia } from "@/lib/data/siteMedia";
import AuthBrandPanel from "./AuthBrandPanel";

type AuthVariant = "login" | "register";

type AuthLayoutProps = {
  children: ReactNode;
  variant?: AuthVariant;
};

const contentByVariant: Record<
  AuthVariant,
  {
    mediaSlot: "auth_login" | "auth_register";
    tagline: string;
    subtitle?: string;
  }
> = {
  login: {
    mediaSlot: "auth_login",
    tagline: "Vị ngon quê nhà, giao nhanh tận cửa.",
  },
  register: {
    mediaSlot: "auth_register",
    tagline: "Hương vị tận tâm, Giao hàng tận nơi.",
    subtitle: "Trải nghiệm ẩm thực tuyệt vời ngay tại nhà cùng EatNow.",
  },
};

export default async function AuthLayout({
  children,
  variant = "login",
}: AuthLayoutProps) {
  const brand = contentByVariant[variant];
  const siteMedia = await getSiteMedia();
  const image = siteMedia[brand.mediaSlot];
  const brandProps = {
    tagline: brand.tagline,
    subtitle: brand.subtitle,
    imageSrc: image.imageUrl,
    imageAlt: image.altText,
  };

  return (
    <main className="auth-page">
      <Paper component="section" className={`auth-card auth-card--${variant}`}>
        <NextLink
          href="/"
          className="auth-close-button"
          aria-label="Đóng và về trang chủ"
          title="Đóng và về trang chủ"
        >
          <CloseOutlinedIcon />
        </NextLink>
        <AuthBrandPanel {...brandProps} />
        <Box className="auth-form-panel">
          <AuthBrandPanel {...brandProps} compact />
          <Box className="auth-form-content">{children}</Box>
        </Box>
      </Paper>
    </main>
  );
}
