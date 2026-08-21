import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { hasAnyRole } from "@/utils/roles";
import { createClient } from "@/utils/supabase/server";
import type { PublicUser, UserRole } from "@/types/auth";
import { getMyAccess } from "./access";
import { toPublicUser } from "./publicUser";
import { parseSessionContext } from "./sessionContext";

export const getCurrentPublicUser = cache(async (): Promise<PublicUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_get_my_session_context");

  if (!error) {
    return parseSessionContext(data);
  }

  // Cho phép source được deploy trước SQL 17. Sau khi migration đã chạy,
  // nhánh này không còn phát sinh trên các lần điều hướng bình thường.
  const isMissingRpc =
    error.code === "PGRST202" ||
    error.code === "42883" ||
    /api_get_my_session_context/i.test(error.message ?? "");
  if (!isMissingRpc) {
    if (error.code !== "42501") {
      console.error("[auth] Không thể đọc session context", error.message);
    }
    return null;
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;
  const access = await getMyAccess(supabase);

  return toPublicUser(user, access);
});

export async function requireCurrentUser(): Promise<PublicUser> {
  const user = await getCurrentPublicUser();

  if (!user) {
    redirect("/login");
  }

  if (user.status === "SUSPENDED") {
    redirect("/unauthorized?reason=suspended");
  }

  return user;
}

export async function requireAnyRole(
  allowedRoles: UserRole[]
): Promise<PublicUser> {
  const user = await requireCurrentUser();

  // UI/server route guards improve navigation, but backend authorization must
  // still protect private data and privileged actions once APIs are finalized.
  if (!hasAnyRole(user, allowedRoles)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requirePermission(permission: string): Promise<PublicUser> {
  const user = await requireCurrentUser();

  if (!(user.permissions ?? []).includes(permission)) {
    redirect("/unauthorized");
  }

  return user;
}
