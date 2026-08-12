import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";

type AuthBrandPanelProps = {
  imageSrc: string;
  tagline: string;
  subtitle?: string;
  compact?: boolean;
};

export default function AuthBrandPanel({
  imageSrc,
  tagline,
  subtitle,
  compact = false,
}: AuthBrandPanelProps) {
  if (compact) {
    return (
      <div className="auth-mobile-brand">
        <div className="auth-wordmark" aria-label="EatNow">
          <UtensilsCrossed size={18} />
          <span>EatNow</span>
        </div>
        <p className="text-[var(--brand-text-soft)]">{tagline}</p>
      </div>
    );
  }

  return (
    <div className="auth-brand-panel">
      <Image
        className="auth-brand-image"
        src={imageSrc}
        alt="Món ăn Việt Nam tại EatNow"
        fill
        priority
        sizes="(max-width: 720px) 0px, 540px"
      />
      <div className="auth-brand-overlay" aria-hidden="true" />
      <div className="auth-brand-content">
        <div className="auth-wordmark auth-wordmark--light" aria-label="EatNow">
          <UtensilsCrossed />
          <span>EatNow</span>
        </div>
        <p className="auth-brand-tagline">{tagline}</p>
        {subtitle ? <p className="auth-brand-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
}
