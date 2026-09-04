import type { UserRole } from "@/types/auth";

const FALLBACK_PATH = "/";
const AUTH_PATHS = new Set(["/login", "/register", "/signup"]);

export function getSafeRedirectPath(path: string | null | undefined) {
  if (!path) {
    return FALLBACK_PATH;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return FALLBACK_PATH;
  }

  try {
    const parsed = new URL(path, "https://eatnow.local");
    const safePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (AUTH_PATHS.has(parsed.pathname)) {
      return FALLBACK_PATH;
    }

    return safePath || FALLBACK_PATH;
  } catch {
    return FALLBACK_PATH;
  }
}

export function getDefaultPostLoginPath(roles: UserRole[]) {
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
    return "/admin";
  }

  if (roles.includes("MODERATOR")) {
    return "/moderator";
  }

  if (
    roles.includes("RESTAURANT_OWNER") ||
    roles.includes("RESTAURANT_STAFF")
  ) {
    return "/owner";
  }

  if (roles.includes("SHIPPER")) {
    return "/shipper";
  }

  return FALLBACK_PATH;
}

export function getPostLoginRedirectPath(
  roles: UserRole[],
  requestedPath: string | null | undefined
) {
  const roleLandingPath = getDefaultPostLoginPath(roles);

  if (roleLandingPath !== FALLBACK_PATH) {
    return roleLandingPath;
  }

  return getSafeRedirectPath(requestedPath);
}
