import type { ReactNode } from "react";

import {
  headerActionsClassName,
  headerClassName,
  headerDescriptionClassName,
  headerEyebrowClassName,
  headerTitleClassName,
} from "./tailwindClasses";

type AccountHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export default function AccountHeader({
  title,
  description,
  eyebrow = "Tài khoản",
  actions,
}: AccountHeaderProps) {
  return (
    <header className={headerClassName}>
      <div>
        <p className={headerEyebrowClassName}>{eyebrow}</p>
        <h1 className={headerTitleClassName}>{title}</h1>
        {description ? (
          <p className={headerDescriptionClassName}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className={headerActionsClassName}>{actions}</div> : null}
    </header>
  );
}
