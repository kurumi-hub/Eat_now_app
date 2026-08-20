import "server-only";

import { unstable_cache } from "next/cache";

import { parseSiteMedia, type SiteMediaMap } from "@/types/siteMedia";
import { createPublicClient } from "@/utils/supabase/public";

const fetchSiteMedia = unstable_cache(
  async (): Promise<SiteMediaMap> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("api_get_site_media");

    if (error) {
      // Source có thể được deploy trước SQL 18. Ảnh local tiếp tục là fallback
      // cho tới khi migration và ảnh Storage đã sẵn sàng.
      if (!["PGRST202", "42883"].includes(error.code ?? "")) {
        console.error("[site-media] Không thể tải cấu hình ảnh", error.message);
      }
      return parseSiteMedia(null);
    }

    return parseSiteMedia(data);
  },
  ["site-media-v1"],
  { revalidate: 300, tags: ["site-media"] }
);

export function getSiteMedia() {
  return fetchSiteMedia();
}
