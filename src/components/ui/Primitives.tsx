import { type ButtonHTMLAttributes, type ImgHTMLAttributes, forwardRef } from "react";

export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`animate-spin text-current ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
      />
    </svg>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={[
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[var(--brand-text-soft)] transition-colors hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:shadow-[var(--brand-focus-ring)]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";

type AvatarProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
  size?: number;
};

export function Avatar({
  src,
  alt = "",
  fallback,
  size = 40,
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-[var(--brand-primary)] text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-t border-[var(--brand-border)] ${className}`} />;
}
