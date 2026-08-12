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
      <section className={`auth-card auth-card--${variant}`}>
        <AuthBrandPanel {...brand} />
        <div className="auth-form-panel">
          <AuthBrandPanel {...brand} compact />
          <div className="auth-form-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
