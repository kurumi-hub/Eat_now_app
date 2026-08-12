import { forwardRef, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  endAdornment?: React.ReactNode;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      endAdornment,
      className = "",
      id,
      name,
      ...rest
    },
    ref
  ) => {
    const inputId = id ?? name;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[13px] font-semibold leading-[18px] text-[var(--brand-text-soft)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={[
              "min-h-11 w-full rounded-xl border bg-[#fffdfc] px-3.5 text-[15px] text-[var(--brand-text)] outline-none transition-shadow placeholder:text-[var(--brand-text-soft)]/60",
              "focus:shadow-[var(--brand-focus-ring)] focus:border-[var(--brand-primary)]",
              error
                ? "border-[var(--brand-error)]"
                : "border-[#d9c9c0] hover:border-[#b99180]",
              endAdornment ? "pr-11" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-2 flex items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={`mt-1 text-xs ${
              error ? "text-[var(--brand-error)]" : "text-[var(--brand-text-soft)]"
            }`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";

export default TextField;
