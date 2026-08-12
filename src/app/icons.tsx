type IconProps = {
  className?: string;
};

const base = "1.75";

export function IconClipboard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6M9 19h3" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.2 2.2L15.5 9.5" />
    </svg>
  );
}

export function IconBike({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M5.5 17.5 10 9h5" />
      <path d="M10 9 12.5 13h6" />
      <path d="M9 5h3l1 2" />
    </svg>
  );
}

export function IconBowl({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18a9 8 0 0 1-18 0Z" />
      <path d="M8 12c.5-1.2.5-2 0-3M12 12c.5-1.6.5-2.6 0-4M16 12c.5-1.2.5-2 0-3" />
    </svg>
  );
}

export function IconRiceBowl({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13h16a8 7 0 0 1-16 0Z" />
      <path d="M12 13V6" />
      <path d="M9 6c0-1.5 1-3 3-3s3 1.5 3 3" />
    </svg>
  );
}

export function IconCup({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8h10l-1 11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z" />
      <path d="M7 8 6.2 5.5A1 1 0 0 1 7.1 4h9.8a1 1 0 0 1 .9 1.5L17 8" />
      <circle cx="10.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4C10 4 4 10 4 18c8 0 14-6 14-14Z" />
      <path d="M5 19c4-5 8-8 14-14" />
    </svg>
  );
}

export function IconCake({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3Z" />
      <path d="M4 17h16" />
      <path d="M9 11V8M12 11V8M15 11V8" />
      <path d="M12 5.5c.8 0 1-.6 1-1s-.4-1-1-1.5c0 .5-.4.9-1 1s-1 .5-1 1 .5 1 1 1Z" />
    </svg>
  );
}

export function IconPizza({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5 20 5 12 21Z" />
      <path d="M4 5c0 6 3.6 10.4 8 12" />
      <path d="M20 5c0 6-3.6 10.4-8 12" />
      <circle cx="11" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTakeoutBox({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M4 9 6 4h12l2 5" />
      <path d="M12 9v11" />
    </svg>
  );
}

export function IconBurger({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10c0-3 3.6-5 8-5s8 2 8 5Z" />
      <path d="M3.5 13h17" />
      <path d="M4 17h16" />
      <path d="M5 17c0 2 1 3.5 3 3.5h8c2 0 3-1.5 3-3.5" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconStar({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7Z" />
    </svg>
  );
}

export function IconApple({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 8.3c1.6-.2 2.9.5 3.7 1.7-2 1.2-2.4 4-1 5.9-.6 1.4-1.3 2.7-2.4 3.8-.9.9-1.8 1.3-2.8 1.3s-1.5-.4-2.5-.4-1.7.4-2.6.4-1.9-.5-2.9-1.5C3.4 17.7 2.6 14 4 11.4c.9-1.6 2.4-2.6 4-2.6.9 0 1.8.4 2.6.4s1.6-.5 2.7-.5c1 0 1.9.3 2.7.9-1.4.9-2 2.5-1.5 3.9" />
      <path d="M13 5.5c.5-1 1.5-1.6 2.5-1.5.1 1-.4 2-1 2.6-.6.7-1.5 1.1-2.4 1 0-1 .4-1.7.9-2.1Z" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconMapPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4 0 7-2.7 7-6.8 0-3-1.8-4.7-3-6.7-.3 2-1.3 3-2.2 2.2-.7-.7-.3-2.3-.6-4-.3-1.7-1.5-3.3-3-3.7.4 1.8-.2 3.5-1.4 4.9C7 9.5 5 11.6 5 15.2 5 19.3 8 22 12 22Z" />
    </svg>
  );
}

export function IconPercent({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconStore({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5 5 4h14l1 5.5" />
      <path d="M4 9.5a2.3 2.3 0 0 0 4.4 1.1A2.3 2.3 0 0 0 12.7 10a2.3 2.3 0 0 0 4.4.6 2.3 2.3 0 0 0 4.4-1.1" />
      <path d="M5.5 11v8a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1v-8" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function IconPalette({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4c0-4.4-3.6-8.2-8-8.2Z" />
      <circle cx="7.5" cy="11" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="11" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkles({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3v3.2M11 3l-1.4 2.8L11 3l1.4 2.8L11 3" />
      <path d="M5 4v3M3.5 5.5h3" />
      <path d="M11 3c.5 3 2.6 5.1 5.6 5.6-3 .5-5.1 2.6-5.6 5.6-.5-3-2.6-5.1-5.6-5.6C8.4 8.1 10.5 6 11 3Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M18 15.5v3M16.5 17h3" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none">
      <path d="M6 4.2c0-.9 1-1.4 1.7-1L19 9.3c.7.4.7 1.5 0 1.9L7.7 17.3c-.7.4-1.7-.1-1.7-1Z" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconPercent({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

export function IconStore({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9 5 4h14l1 5" />
      <path d="M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}