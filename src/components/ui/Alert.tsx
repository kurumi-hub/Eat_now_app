import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type AlertSeverity = "success" | "error" | "warning" | "info";

type AlertProps = {
  severity?: AlertSeverity;
  children: ReactNode;
  className?: string;
};

const styles: Record<AlertSeverity, { bg: string; text: string; icon: ReactNode }> = {
  success: {
    bg: "bg-[var(--brand-success)]/10",
    text: "text-[var(--brand-success)]",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
  },
  error: {
    bg: "bg-[var(--brand-error)]/10",
    text: "text-[var(--brand-error)]",
    icon: <AlertCircle className="h-5 w-5 shrink-0" />,
  },
  warning: {
    bg: "bg-[var(--brand-warning)]/10",
    text: "text-[var(--brand-warning)]",
    icon: <TriangleAlert className="h-5 w-5 shrink-0" />,
  },
  info: {
    bg: "bg-[var(--brand-info)]/10",
    text: "text-[var(--brand-info)]",
    icon: <Info className="h-5 w-5 shrink-0" />,
  },
};

export default function Alert({
  severity = "info",
  children,
  className = "",
}: AlertProps) {
  const s = styles[severity];
  return (
    <div
      role="alert"
      className={[
        "flex items-center gap-2 rounded-xl px-4 py-3 text-sm",
        s.bg,
        s.text,
        className,
      ].join(" ")}
    >
      {s.icon}
      <div className="flex-1">{children}</div>
    </div>
  );
}
