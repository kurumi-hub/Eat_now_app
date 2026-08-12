"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

import TextField from "@/components/ui/TextField";
import { IconButton } from "@/components/ui/Primitives";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  errorMessage?: string;
  helperText?: string;
};

export default function PasswordField({
  errorMessage,
  helperText,
  label,
  name,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold leading-[18px] text-[var(--brand-text-soft)]">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]"
        />
        <TextField
          {...props}
          name={name}
          type={isVisible ? "text" : "password"}
          error={Boolean(errorMessage)}
          aria-label={label || name || "Mật khẩu"}
          className={`pl-10 ${className}`}
          endAdornment={
            <IconButton
              type="button"
              aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setIsVisible((v) => !v)}
              className="min-h-9 min-w-9"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          }
        />
      </div>
      {(errorMessage || helperText) && (
        <p
          className={`mt-1 text-xs ${
            errorMessage ? "text-[var(--brand-error)]" : "text-[var(--brand-text-soft)]"
          }`}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
}
