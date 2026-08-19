import type { SupabaseClient } from "@supabase/supabase-js";

import type { CurrentUserAccess, UserStatus } from "@/types/auth";
import { normalizeRoles } from "@/utils/roles";

type AccessRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AccessRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStatus(value: unknown, isActive: boolean): UserStatus {
  if (
    value === "ACTIVE" ||
    value === "PENDING_VERIFICATION" ||
    value === "SUSPENDED"
  ) {
    return value;
  }

  return isActive ? "ACTIVE" : "SUSPENDED";
}

/**
 * Nguồn quyền duy nhất của frontend. SQL 13 đọc dữ liệu từ public.user_roles
 * và profile, vì vậy tuyệt đối không dùng user_metadata để cấp quyền.
 */
export async function getMyAccess(
  supabase: SupabaseClient
): Promise<CurrentUserAccess | null> {
  const { data, error } = await supabase.rpc("api_get_my_access");

  if (error) {
    console.error("[auth] Không thể đọc api_get_my_access", {
      code: error.code,
      message: error.message,
    });
    return null;
  }

  if (!isRecord(data) || typeof data.user_id !== "string") {
    console.error("[auth] api_get_my_access trả về dữ liệu không hợp lệ");
    return null;
  }

  const isActive = data.is_active !== false;

  return {
    userId: data.user_id,
    roles: normalizeRoles(data.roles),
    isActive,
    status: normalizeStatus(data.status, isActive),
  };
}
