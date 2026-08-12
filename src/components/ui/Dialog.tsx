"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidthClassName?: string;
};

export default function Dialog({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-sm",
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={[
          "w-full rounded-3xl bg-[var(--brand-surface)] shadow-2xl",
          maxWidthClassName,
          "max-h-[90vh] overflow-y-auto",
        ].join(" ")}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="text-lg font-bold text-[var(--brand-text)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-full p-1.5 text-[var(--brand-text-soft)] hover:bg-black/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end gap-2 px-6 pb-5 pt-2">{children}</div>
  );
}
