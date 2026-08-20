import "server-only";

import type {
  AdminCategory,
  AdminCategoryList,
  AdminTag,
  AdminTagList,
} from "@/types/admin";

type UnknownRecord = Record<string, unknown>;

export const EMPTY_ADMIN_CATEGORIES: AdminCategoryList = {
  items: [], total: 0, limit: 20, offset: 0,
};

export const EMPTY_ADMIN_TAGS: AdminTagList = {
  items: [], total: 0, limit: 20, offset: 0,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseListMeta(value: UnknownRecord) {
  return {
    total: numberValue(value.total),
    limit: numberValue(value.limit) || 20,
    offset: numberValue(value.offset),
  };
}

export function parseAdminCategories(value: unknown): AdminCategoryList {
  if (!isRecord(value)) return EMPTY_ADMIN_CATEGORIES;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): AdminCategory[] => {
        if (!isRecord(item) || typeof item.id !== "string") return [];
        return [{
          id: item.id,
          name: typeof item.name === "string" ? item.name : "Danh mục",
          icon_url: typeof item.icon_url === "string" ? item.icon_url : null,
          icon_object_path:
            typeof item.icon_object_path === "string" ? item.icon_object_path : null,
          icon_alt_text:
            typeof item.icon_alt_text === "string" ? item.icon_alt_text : "",
          display_order: numberValue(item.display_order),
          is_active: item.is_active !== false,
          usage_count: numberValue(item.usage_count),
          created_at: typeof item.created_at === "string" ? item.created_at : "",
          updated_at: typeof item.updated_at === "string" ? item.updated_at : "",
        }];
      })
    : [];
  const meta = parseListMeta(value);
  return { items, total: meta.total, limit: meta.limit, offset: meta.offset };
}

export function parseAdminTags(value: unknown): AdminTagList {
  if (!isRecord(value)) return EMPTY_ADMIN_TAGS;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): AdminTag[] => {
        if (!isRecord(item) || typeof item.id !== "string") return [];
        return [{
          id: item.id,
          name: typeof item.name === "string" ? item.name : "Tag",
          display_order: numberValue(item.display_order),
          is_active: item.is_active !== false,
          usage_count: numberValue(item.usage_count),
          created_at: typeof item.created_at === "string" ? item.created_at : "",
          updated_at: typeof item.updated_at === "string" ? item.updated_at : "",
        }];
      })
    : [];
  const meta = parseListMeta(value);
  return { items, total: meta.total, limit: meta.limit, offset: meta.offset };
}
