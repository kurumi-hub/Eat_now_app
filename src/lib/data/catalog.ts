import "server-only";

import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/utils/supabase/public";

type PublicCategoryRow = {
  id: string;
  name: string;
  icon_url: string | null;
  icon_alt_text: string | null;
};

export type RuntimeHomeCategory = {
  id: string;
  label: string;
  imageUrl: string | null;
  altText: string;
};

const fetchHomeCategories = unstable_cache(
  async (): Promise<RuntimeHomeCategory[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,icon_url,icon_alt_text,display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(8);

    if (error) {
      if (!["PGRST204", "42703"].includes(error.code ?? "")) {
        console.error("[catalog] Không thể tải danh mục trang chủ", error.message);
      }
      return [];
    }

    return ((data ?? []) as unknown as PublicCategoryRow[]).map((item) => ({
      id: item.id,
      label: item.name,
      imageUrl: item.icon_url,
      altText: item.icon_alt_text?.trim() || `Danh mục ${item.name}`,
    }));
  },
  ["catalog-home-categories-v1"],
  { revalidate: 300, tags: ["catalog"] }
);

export function getHomeCategories() {
  return fetchHomeCategories();
}
