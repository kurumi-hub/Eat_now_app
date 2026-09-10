export const ACCOUNT_PREFERENCES_STORAGE_KEY = "eatnow-account-preferences";
export const ACCOUNT_PREFERENCES_CHANGED_EVENT = "eatnow-preferences-changed";

export type AccountLanguage = "vi" | "en";
export type AccountTheme = "light" | "dark" | "system";

export type StoredAccountPreferences = {
  language: AccountLanguage;
  theme: AccountTheme;
  diet: string[];
  allergies: string[];
  orderNotifications: boolean;
  promotionNotifications: boolean;
  recommendationNotifications: boolean;
  chatbotPersonalization: boolean;
  saveChatHistory: boolean;
};

export const DEFAULT_ACCOUNT_PREFERENCES: StoredAccountPreferences = {
  language: "vi",
  theme: "system",
  diet: [],
  allergies: [],
  orderNotifications: true,
  promotionNotifications: true,
  recommendationNotifications: true,
  chatbotPersonalization: true,
  saveChatHistory: true,
};

export function readStoredAccountPreferences(): StoredAccountPreferences {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT_PREFERENCES;

  try {
    const value = JSON.parse(
      window.localStorage.getItem(ACCOUNT_PREFERENCES_STORAGE_KEY) || "{}"
    ) as Partial<StoredAccountPreferences>;

    return {
      ...DEFAULT_ACCOUNT_PREFERENCES,
      ...value,
      language: value.language === "en" ? "en" : "vi",
      theme: ["light", "dark", "system"].includes(value.theme || "")
        ? (value.theme as AccountTheme)
        : "system",
      diet: Array.isArray(value.diet) ? value.diet : [],
      allergies: Array.isArray(value.allergies) ? value.allergies : [],
    };
  } catch {
    window.localStorage.removeItem(ACCOUNT_PREFERENCES_STORAGE_KEY);
    return DEFAULT_ACCOUNT_PREFERENCES;
  }
}

export function resolveAccountTheme(theme: AccountTheme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyAccountPreferences(preferences: StoredAccountPreferences) {
  const resolvedTheme = resolveAccountTheme(preferences.theme);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
  document.documentElement.lang = preferences.language;
}

export function saveAccountPreferences(preferences: StoredAccountPreferences) {
  window.localStorage.setItem(
    ACCOUNT_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences)
  );
  applyAccountPreferences(preferences);
  window.dispatchEvent(
    new CustomEvent(ACCOUNT_PREFERENCES_CHANGED_EVENT, { detail: preferences })
  );
}
