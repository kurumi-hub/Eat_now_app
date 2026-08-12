import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "contained" | "outlined" | "text";
type ButtonColor = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: "small" | "medium" | "large";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-[15px] leading-5 min-h-11 px-[18px] transition-colors focus-visible:outline-none focus-visible:shadow-[var(--brand-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed";

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  small: "min-h-9 px-3 text-sm",
  medium: "",
  large: "min-h-12 px-6 text-base",
};

const variantMap: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  contained: {
    primary:
      "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]",
    secondary:
      "bg-[var(--brand-secondary)] text-white hover:opacity-90",
  },
  outlined: {
    primary:
      "border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 bg-transparent",
    secondary:
      "border border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-black/5 bg-transparent",
  },
  text: {
    primary: "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5",
    secondary: "text-[var(--brand-text)] hover:bg-black/5",
  },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "contained",
      color = "primary",
      fullWidth,
      startIcon,
      endIcon,
      size = "medium",
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          base,
          sizeMap[size],
          variantMap[variant][color],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {startIcon}
        {children}
        {endIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
