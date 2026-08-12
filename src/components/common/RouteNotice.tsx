import Link from "next/link";
import type { ReactNode } from "react";

type RouteNoticeAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type RouteNoticeProps = {
  eyebrow?: string;
  title: string;
  message: string;
  actions?: RouteNoticeAction[];
  children?: ReactNode;
};

export default function RouteNotice({
  eyebrow,
  title,
  message,
  actions = [{ href: "/", label: "Về trang chủ", variant: "primary" }],
  children,
}: RouteNoticeProps) {
  return (
    <main className="route-state">
      <section className="route-state__card" aria-labelledby="route-notice-title">
        {eyebrow ? <p className="route-state__eyebrow">{eyebrow}</p> : null}
        <h1 id="route-notice-title" className="route-state__title">
          {title}
        </h1>
        <p className="route-state__message">{message}</p>
        {children}
        {actions.length > 0 ? (
          <div className="route-state__actions">
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={
                  action.variant === "primary"
                    ? "route-button route-button--primary"
                    : "route-button"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
