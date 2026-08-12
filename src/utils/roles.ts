import type { PublicUser, UserRole } from "../types/auth";

export const USER_ROLE_VALUES = [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "ADMIN",
] as const satisfies readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Khách hàng",
  RESTAURANT_OWNER: "Chủ quán",
  ADMIN: "Quản trị viên",
};

type RoleReadableUser = Partial<Pick<PublicUser, "roles">> & {
  role?: unknown;
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLE_VALUES.includes(value as UserRole)
  );
}

export function normalizeRoles(
  value: unknown,
  fallback: UserRole[] = []
): UserRole[] {
  const candidates = Array.isArray(value) ? value : [value];
  const roles = candidates.filter(isUserRole);

  if (roles.length === 0) {
    return [...fallback];
  }

  return Array.from(new Set(roles));
}

export function getUserRoles(user: RoleReadableUser | null | undefined) {
  if (!user) {
    return [];
  }

  const roles = normalizeRoles(user.roles);

  if (roles.length > 0) {
    return roles;
  }

  return normalizeRoles(user.role);
}

export function hasRole(
  user: RoleReadableUser | null | undefined,
  role: UserRole
) {
  return getUserRoles(user).includes(role);
}

export function hasAnyRole(
  user: RoleReadableUser | null | undefined,
  roles: UserRole[]
) {
  return roles.some((role) => hasRole(user, role));
}

export function getPrimaryRole(
  user: RoleReadableUser | null | undefined,
  fallback: UserRole = "CUSTOMER"
) {
  return getUserRoles(user)[0] ?? fallback;
}

export function formatRole(role: UserRole) {
  return ROLE_LABELS[role];
}
