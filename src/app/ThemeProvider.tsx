"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "redwood"
  | "coral-pink"
  | "teal"
  | "ocean"
  | "grape"
  | "forest"
  | "sunset"
  | "lavender"
  | "rose-gold"
  | "slate"
  | "tomato"
  | "chili"
  | "mustard"
  | "avocado"
  | "mango"
  | "lime"
  | "cherry"
  | "papaya"
  | "saffron"
  | "basil"
  | "curry"
  | "plum"
  | "cinnamon"
  | "olive"
  | "honey"
  | "cocoa"
  | "blueberry"
  | "watermelon"
  | "peach"
  | "matcha";

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "redwood", label: "Redwood", swatch: "#e8264a" },
  { id: "coral-pink", label: "Coral Pink", swatch: "#ff6f81" },
  { id: "teal", label: "Teal", swatch: "#0f9b8e" },
  { id: "ocean", label: "Ocean Blue", swatch: "#2f7fd6" },
  { id: "grape", label: "Grape", swatch: "#8b4fd1" },
  { id: "forest", label: "Forest", swatch: "#2e8b57" },
  { id: "sunset", label: "Sunset", swatch: "#e8792b" },
  { id: "lavender", label: "Lavender", swatch: "#9086d6" },
  { id: "rose-gold", label: "Rose Gold", swatch: "#c98a7a" },
  { id: "slate", label: "Slate", swatch: "#4b5a6b" },
  { id: "tomato", label: "Tomato", swatch: "#e0432b" },
  { id: "chili", label: "Chili Red", swatch: "#c62e2e" },
  { id: "mustard", label: "Mustard", swatch: "#d6a419" },
  { id: "avocado", label: "Avocado", swatch: "#6a8f3d" },
  { id: "mango", label: "Mango", swatch: "#f2a01e" },
  { id: "lime", label: "Lime", swatch: "#8bb62c" },
  { id: "cherry", label: "Cherry", swatch: "#b3223e" },
  { id: "papaya", label: "Papaya", swatch: "#ff7a45" },
  { id: "saffron", label: "Saffron", swatch: "#f0a500" },
  { id: "basil", label: "Basil", swatch: "#3e7d4f" },
  { id: "curry", label: "Curry", swatch: "#c9821f" },
  { id: "plum", label: "Plum", swatch: "#7a3b6d" },
  { id: "cinnamon", label: "Cinnamon", swatch: "#a9652e" },
  { id: "olive", label: "Olive", swatch: "#6e7233" },
  { id: "honey", label: "Honey", swatch: "#e0a52e" },
  { id: "cocoa", label: "Cocoa", swatch: "#6b4331" },
  { id: "blueberry", label: "Blueberry", swatch: "#3d5aa8" },
  { id: "watermelon", label: "Watermelon", swatch: "#e0475e" },
  { id: "peach", label: "Peach", swatch: "#f2905e" },
  { id: "matcha", label: "Matcha", swatch: "#7a9a5e" },
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("redwood");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("eatnow-theme") as ThemeId | null;
    if (savedTheme) setThemeState(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (mounted) window.localStorage.setItem("eatnow-theme", theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
