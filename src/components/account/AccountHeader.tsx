import type { ReactNode } from "react";

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
    <header className="account-header">
      <div>
        <p className="account-header__eyebrow">{eyebrow}</p>
        <h1 className="account-header__title">{title}</h1>
        {description ? (
          <p className="account-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="account-header__actions">{actions}</div> : null}
    </header>
  );
}
