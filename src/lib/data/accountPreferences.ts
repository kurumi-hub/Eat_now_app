import "server-only";

import {
  ACCOUNT_APPEARANCES,
  ACCOUNT_LANGUAGES,
  type AccountAppearance,
  type AccountLanguage,
  type AccountPreferences,
} from "@/types/account";
import { createClient } from "@/utils/supabase/server";

export type AccountPreferenceField = keyof AccountPreferences;

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  orderStatusNotifications: true,
  promotionalNotifications: true,
  ownerNotifications: false,
  appearance: "system",
  language: "Tiếng Việt",
};

export type AccountPreferencesValidationResult =
  | {
      isValid: true;
      normalized: AccountPreferences;
      errors: Partial<Record<AccountPreferenceField, string>>;
    }
  | {
      isValid: false;
      normalized: AccountPreferences;
      errors: Partial<Record<AccountPreferenceField, string>>;
    };

type MetadataRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MetadataRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPreferenceSource(metadata: unknown) {
  if (!isRecord(metadata)) {
    return {};
  }

  const nestedPreferences =
    metadata.accountPreferences ??
    metadata.account_preferences ??
    metadata.preferences;

  return isRecord(nestedPreferences) ? nestedPreferences : metadata;
}

function readBoolean(
  source: MetadataRecord,
  key: AccountPreferenceField,
  fallback: boolean
) {
  const value = source[key];

  return typeof value === "boolean" ? value : fallback;
}

function readAppearance(value: unknown) {
  return typeof value === "string" &&
    ACCOUNT_APPEARANCES.includes(value as AccountAppearance)
    ? (value as AccountAppearance)
    : DEFAULT_ACCOUNT_PREFERENCES.appearance;
}

function readLanguage(value: unknown) {
  return typeof value === "string" &&
    ACCOUNT_LANGUAGES.includes(value as AccountLanguage)
    ? (value as AccountLanguage)
    : DEFAULT_ACCOUNT_PREFERENCES.language;
}

export function readAccountPreferences(metadata: unknown): AccountPreferences {
  const source = readPreferenceSource(metadata);

  return {
    orderStatusNotifications: readBoolean(
      source,
      "orderStatusNotifications",
      DEFAULT_ACCOUNT_PREFERENCES.orderStatusNotifications
    ),
    promotionalNotifications: readBoolean(
      source,
      "promotionalNotifications",
      DEFAULT_ACCOUNT_PREFERENCES.promotionalNotifications
    ),
    ownerNotifications: readBoolean(
      source,
      "ownerNotifications",
      DEFAULT_ACCOUNT_PREFERENCES.ownerNotifications
    ),
    appearance: readAppearance(source.appearance),
    language: readLanguage(source.language),
  };
}

export function validateAccountPreferences(
  value: unknown
): AccountPreferencesValidationResult {
  const errors: Partial<Record<AccountPreferenceField, string>> = {};

  if (!isRecord(value)) {
    return {
      isValid: false,
      normalized: DEFAULT_ACCOUNT_PREFERENCES,
      errors: {
        appearance: "Cài đặt không hợp lệ.",
      },
    };
  }

  for (const key of [
    "orderStatusNotifications",
    "promotionalNotifications",
    "ownerNotifications",
  ] as const) {
    if (typeof value[key] !== "boolean") {
      errors[key] = "Giá trị thông báo không hợp lệ.";
    }
  }

  if (
    typeof value.appearance !== "string" ||
    !ACCOUNT_APPEARANCES.includes(value.appearance as AccountAppearance)
  ) {
    errors.appearance = "Chế độ màu không hợp lệ.";
  }

  if (
    typeof value.language !== "string" ||
    !ACCOUNT_LANGUAGES.includes(value.language as AccountLanguage)
  ) {
    errors.language = "Ngôn ngữ không hợp lệ.";
  }

  const normalized: AccountPreferences = {
    orderStatusNotifications:
      typeof value.orderStatusNotifications === "boolean"
        ? value.orderStatusNotifications
        : DEFAULT_ACCOUNT_PREFERENCES.orderStatusNotifications,
    promotionalNotifications:
      typeof value.promotionalNotifications === "boolean"
        ? value.promotionalNotifications
        : DEFAULT_ACCOUNT_PREFERENCES.promotionalNotifications,
    ownerNotifications:
      typeof value.ownerNotifications === "boolean"
        ? value.ownerNotifications
        : DEFAULT_ACCOUNT_PREFERENCES.ownerNotifications,
    appearance: readAppearance(value.appearance),
    language: readLanguage(value.language),
  };

  return {
    isValid: Object.keys(errors).length === 0,
    normalized,
    errors,
  };
}

export async function getCurrentAccountPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return readAccountPreferences(user?.user_metadata);
}
