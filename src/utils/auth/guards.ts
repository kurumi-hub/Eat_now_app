import { redirect } from "next/navigation";
import { hasAnyRole } from "@/utils/roles";
import { createClient } from "@/utils/supabase/server";
import type { PublicUser, UserRole } from "@/types/auth";
import { getMyAccess } from "./access";
import { toPublicUser } from "./publicUser";

export async function getCurrentPublicUser(): Promise<PublicUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const access = await getMyAccess(supabase);

  return toPublicUser(user, access);
}

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
