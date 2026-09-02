import Link from "next/link";
import type { ReactNode } from "react";

import * as routeNoticeStyles from "./tailwindClasses";

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
    <main className={routeNoticeStyles.routeNoticePageClassName}>
      <section
        className={routeNoticeStyles.routeNoticeCardClassName}
        aria-labelledby="route-notice-title"
      >
        {eyebrow ? (
          <p className={routeNoticeStyles.routeNoticeEyebrowClassName}>
            {eyebrow}
          </p>
        ) : null}
        <h1
          id="route-notice-title"
          className={routeNoticeStyles.routeNoticeTitleClassName}
        >
          {title}
        </h1>
        <p className={routeNoticeStyles.routeNoticeMessageClassName}>
          {message}
        </p>
        {children}
        {actions.length > 0 ? (
          <div className={routeNoticeStyles.routeNoticeActionsClassName}>
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={routeNoticeStyles.routeNoticeButtonClassName(
                  action.variant
                )}
                data-variant={action.variant ?? "secondary"}
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
