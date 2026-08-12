import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SellerStatus } from "../../types/account";
import type { PublicUser, UserRole, UserStatus } from "../../types/auth";

type SupabasePublicUserSource = Pick<
  SupabaseUser,
  "created_at" | "email" | "email_confirmed_at" | "id" | "phone" | "user_metadata"
>;

type MetadataRecord = Record<string, unknown>;

const USER_ROLE_VALUES = [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "ADMIN",
] as const satisfies readonly UserRole[];

const USER_STATUS_VALUES = [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "SUSPENDED",
] as const satisfies readonly UserStatus[];

const SELLER_STATUS_VALUES = [
  "NOT_APPLIED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const satisfies readonly SellerStatus[];

function isRecord(value: unknown): value is MetadataRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readMetadataValue(metadata: MetadataRecord, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function readMetadataString(metadata: MetadataRecord, keys: string[]) {
  const value = readMetadataValue(metadata, keys);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeVietnamesePhone(phone: string) {
  const compactPhone = phone.trim().replace(/[\s().-]/g, "");

  if (compactPhone.startsWith("+84")) {
    return `0${compactPhone.slice(3)}`;
  }

  if (compactPhone.startsWith("84") && compactPhone.length === 11) {
    return `0${compactPhone.slice(2)}`;
  }

  return compactPhone;
}

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLE_VALUES.includes(value as UserRole)
  );
}

function normalizeRoles(value: unknown) {
  const candidates = Array.isArray(value) ? value : [value];
  const roles = candidates.filter(isUserRole);

  return Array.from(new Set(roles));
}

function readRoles(metadata: MetadataRecord) {
  const roles = normalizeRoles(
    readMetadataValue(metadata, ["roles", "role", "app_role", "user_role"])
  );

  // TODO: Confirm with Bao whether roles come from Supabase metadata,
  // custom JWT claims, or a profiles table before using this for enforcement.
  return roles.length > 0 ? roles : (["CUSTOMER"] satisfies UserRole[]);
}

function readStatus(metadata: MetadataRecord, isEmailConfirmed: boolean) {
  const status = readMetadataValue(metadata, ["status", "account_status"]);

  if (
    typeof status === "string" &&
    USER_STATUS_VALUES.includes(status as UserStatus)
  ) {
    return status as UserStatus;
  }

  return isEmailConfirmed ? "ACTIVE" : "PENDING_VERIFICATION";
}

function readSellerStatus(metadata: MetadataRecord) {
  const sellerStatus = readMetadataValue(metadata, [
    "sellerStatus",
    "seller_status",
  ]);

  if (
    typeof sellerStatus === "string" &&
    SELLER_STATUS_VALUES.includes(sellerStatus as SellerStatus)
  ) {
    return sellerStatus as SellerStatus;
  }

  return "NOT_APPLIED";
}

export function toPublicUser(user: SupabasePublicUserSource): PublicUser {
  const metadata = isRecord(user.user_metadata) ? user.user_metadata : {};
  const email = user.email ?? readMetadataString(metadata, ["email"]) ?? "";
  const phone =
    readMetadataString(metadata, ["phone", "phone_number"]) ?? user.phone ?? "";
  const avatarUrl = readMetadataString(metadata, [
    "avatarUrl",
    "avatar_url",
    "picture",
  ]);

  return {
    id: user.id,
    fullName:
      readMetadataString(metadata, [
        "fullName",
        "full_name",
        "displayName",
        "display_name",
        "name",
      ]) ?? "Người dùng EatNow",
    email,
    phone: phone ? normalizeVietnamesePhone(phone) : undefined,
    roles: readRoles(metadata),
    status: readStatus(metadata, Boolean(user.email_confirmed_at)),
    createdAt: user.created_at ?? "",
    avatarUrl,
    sellerStatus: readSellerStatus(metadata),
  };
}

export function toPublicUserOrNull(
  user: SupabasePublicUserSource | null | undefined
) {
  return user ? toPublicUser(user) : null;
}
