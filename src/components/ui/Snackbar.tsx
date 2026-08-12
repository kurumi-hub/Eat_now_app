"use client";

import { useEffect } from "react";
import Alert from "./Alert";

type SnackbarProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
  severity?: "success" | "error" | "warning" | "info";
};

export default function Snackbar({
  open,
  message,
  onClose,
  autoHideDuration = 4000,
  severity = "info",
}: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
      <Alert severity={severity} className="shadow-lg">
        {message}
      </Alert>
    </div>
  );
}
