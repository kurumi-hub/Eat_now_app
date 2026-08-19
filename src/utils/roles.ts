import {
  USER_ROLES,
  type PublicUser,
  type UserRole,
} from "../types/auth";

export const USER_ROLE_VALUES = USER_ROLES;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Chủ nền tảng",
  ADMIN: "Quản trị viên",
  MODERATOR: "Điều hành viên",
  RESTAURANT_STAFF: "Nhân viên quán",
  SHIPPER: "Tài xế",
  CUSTOMER: "Khách hàng",
  RESTAURANT_OWNER: "Chủ quán",
};

const ROLE_PRIORITY = new Map<UserRole, number>(
  USER_ROLE_VALUES.map((role, index) => [role, index] as const)
);

type RoleReadableUser = Partial<Pick<PublicUser, "roles">> & {
  role?: unknown;
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLE_VALUES.includes(value as UserRole)
  );
}

function normalizeRoleValue(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  return isUserRole(normalized) ? normalized : null;
}

export function normalizeRoles(
  value: unknown,
  fallback: UserRole[] = []
): UserRole[] {
  const candidates = Array.isArray(value) ? value : [value];
  const roles = candidates
    .map(normalizeRoleValue)
    .filter((role): role is UserRole => Boolean(role));

  if (roles.length === 0) {
    return [...fallback];
  }

  return Array.from(new Set(roles)).sort(
    (left, right) =>
      (ROLE_PRIORITY.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (ROLE_PRIORITY.get(right) ?? Number.MAX_SAFE_INTEGER)
  );
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
