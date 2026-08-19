import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Box, Paper } from "@mui/material";
import NextLink from "next/link";
import type { ReactNode } from "react";

import AuthBrandPanel from "./AuthBrandPanel";

type AuthVariant = "login" | "register";

type AuthLayoutProps = {
  children: ReactNode;
  variant?: AuthVariant;
};

const contentByVariant: Record<
  AuthVariant,
  {
    imageSrc: string;
    tagline: string;
    subtitle?: string;
  }
> = {
  login: {
    imageSrc: "/images/auth/login-food.png",
    tagline: "Vị ngon quê nhà, giao nhanh tận cửa.",
  },
  register: {
    imageSrc: "/images/auth/register-food.png",
    tagline: "Hương vị tận tâm, Giao hàng tận nơi.",
    subtitle: "Trải nghiệm ẩm thực tuyệt vời ngay tại nhà cùng EatNow.",
  },
};

export default function AuthLayout({
  children,
  variant = "login",
}: AuthLayoutProps) {
  const brand = contentByVariant[variant];

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
        <AuthBrandPanel {...brand} />
        <Box className="auth-form-panel">
          <AuthBrandPanel {...brand} compact />
          <Box className="auth-form-content">{children}</Box>
        </Box>
      </Paper>
    </main>
  );
}
