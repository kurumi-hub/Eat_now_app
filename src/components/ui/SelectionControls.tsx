"use client";

import { type InputHTMLAttributes, type ReactNode } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className = "", ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={[
        "h-5 w-5 min-w-11 min-h-11 -m-3 cursor-pointer appearance-none rounded border-2 border-[#b99180] bg-white bg-center bg-no-repeat",
        "checked:border-[var(--brand-primary)] checked:bg-[var(--brand-primary)]",
        "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22><polyline points=%2220 6 9 17 4 12%22/></svg>')]",
        "focus-visible:outline-none focus-visible:shadow-[var(--brand-focus-ring)]",
        className,
      ].join(" ")}
      style={{ width: 20, height: 20, margin: 12 }}
      {...rest}
    />
  );
}

type RadioProps = InputHTMLAttributes<HTMLInputElement>;

export function Radio({ className = "", ...rest }: RadioProps) {
  return (
    <input
      type="radio"
      className={[
        "h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-[#b99180] bg-white",
        "checked:border-[6px] checked:border-[var(--brand-primary)]",
        "focus-visible:outline-none focus-visible:shadow-[var(--brand-focus-ring)]",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function FormControlLabel({
  control,
  label,
  className = "",
}: {
  control: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 py-1 text-sm text-[var(--brand-text)] ${className}`}
    >
      {control}
      {label}
    </label>
  );
}

export function RadioGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`} role="radiogroup">
      {children}
    </div>
  );
}
