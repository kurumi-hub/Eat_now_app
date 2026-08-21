import type { PublicUser } from "@/types/auth";
import { normalizeRoles } from "@/utils/roles";

type SessionRecord = Record<string, unknown>;

function isRecord(value: unknown): value is SessionRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeVietnamesePhone(value: unknown) {
  const phone = text(value).trim().replace(/[\s().-]/g, "");
  if (phone.startsWith("+84")) return `0${phone.slice(3)}`;
  if (phone.startsWith("84") && phone.length === 11) {
    return `0${phone.slice(2)}`;
  }
  return phone;
}

const SELLER_STATUSES = [
  "NOT_APPLIED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

export function parseSessionContext(value: unknown): PublicUser | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const phone = normalizeVietnamesePhone(value.phone);
  const permissions = Array.isArray(value.permissions)
    ? [...new Set(value.permissions.filter((item): item is string => typeof item === "string"))]
    : [];
  const status = ["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED"].includes(
    text(value.status)
  )
    ? (text(value.status) as PublicUser["status"])
    : "ACTIVE";
  const sellerStatus = SELLER_STATUSES.includes(
    text(value.seller_status) as (typeof SELLER_STATUSES)[number]
  )
    ? (text(value.seller_status) as NonNullable<PublicUser["sellerStatus"]>)
    : "NOT_APPLIED";

  return {
    id: value.id,
    fullName: text(value.full_name) || "Người dùng EatNow",
    email: text(value.email),
    phone: phone || undefined,
    avatarUrl: text(value.avatar_url) || undefined,
    roles: normalizeRoles(value.roles),
    permissions,
    status,
    createdAt: text(value.created_at),
    sellerStatus,
  };
}
