"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import {
  ACCOUNT_PREFERENCES_CHANGED_EVENT,
  applyAccountPreferences,
  readStoredAccountPreferences,
  resolveAccountTheme,
  type StoredAccountPreferences,
} from "@/utils/accountPreferences";
import { createAppTheme } from "./theme";

type AppThemeProviderProps = {
  children: ReactNode;
};

export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = (preferences = readStoredAccountPreferences()) => {
      applyAccountPreferences(preferences);
      setMode(resolveAccountTheme(preferences.theme));
    };
    const handlePreferenceChange = (event: Event) => {
      sync((event as CustomEvent<StoredAccountPreferences>).detail);
    };
    const handleSystemThemeChange = () => sync();
    const handleStorageChange = () => sync();

    sync();
    window.addEventListener(
      ACCOUNT_PREFERENCES_CHANGED_EVENT,
      handlePreferenceChange
    );
    media.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        ACCOUNT_PREFERENCES_CHANGED_EVENT,
        handlePreferenceChange
      );
      media.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
