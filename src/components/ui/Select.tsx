import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, name, children, ...rest }, ref) => {
    const selectId = id ?? name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-[13px] font-semibold leading-[18px] text-[var(--brand-text-soft)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={[
              "min-h-11 w-full appearance-none rounded-xl border border-[#d9c9c0] bg-[#fffdfc] px-3.5 pr-9 text-[15px] text-[var(--brand-text)] outline-none transition-shadow",
              "hover:border-[#b99180] focus:border-[var(--brand-primary)] focus:shadow-[var(--brand-focus-ring)]",
              className,
            ].join(" ")}
            {...rest}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export default Select;
