import "server-only";

import { unstable_cache } from "next/cache";

import type {
  PublicVoucher,
  CustomerVoucherData,
  VoucherManagementData,
  VoucherManagementItem,
  VoucherOption,
  VoucherTarget,
  VoucherWalletItem,
} from "@/types/voucher";
import { createPublicClient } from "@/utils/supabase/public";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function string(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: unknown) {
  return value === null || value === undefined || value === "" ? null : number(value);
}

function targets(value: unknown): VoucherTarget[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    const type = string(item.type);
    if (!string(item.id) || !["restaurant", "category", "food"].includes(type)) return [];
    return [{ id: string(item.id), type: type as VoucherTarget["type"], name: string(item.name, "Đối tượng") }];
  });
}

function options(value: unknown): VoucherOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    return [{
      id: string(item.id),
      name: string(item.name, "Đối tượng"),
      restaurantId: optionalString(item.restaurant_id),
      restaurantName: optionalString(item.restaurant_name),
    }];
  });
}

function managementItems(value: unknown): VoucherManagementItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    return [{
      id: string(item.id), code: string(item.code), name: string(item.name),
      description: string(item.description), terms: string(item.terms),
      issuerType: string(item.issuer_type, "platform") as VoucherManagementItem["issuerType"],
      restaurantId: optionalString(item.restaurant_id),
      benefitScope: string(item.benefit_scope, "items") as VoucherManagementItem["benefitScope"],
      targetScope: string(item.target_scope, "system") as VoucherManagementItem["targetScope"],
      discountType: string(item.discount_type, "fixed") as VoucherManagementItem["discountType"],
      discountValue: number(item.discount_value), maxDiscount: nullableNumber(item.max_discount),
      minOrderValue: number(item.min_order_value), usageLimitTotal: nullableNumber(item.usage_limit_total),
      usageLimitUser: number(item.usage_limit_user) || 1, usedCount: number(item.used_count),
      status: string(item.status, "draft") as VoucherManagementItem["status"],
      effectiveStatus: string(item.effective_status, "draft") as VoucherManagementItem["effectiveStatus"],
      startAt: string(item.start_at), expiredAt: string(item.expired_at),
      totalBudget: nullableNumber(item.total_budget), reservedBudget: number(item.reserved_budget),
      spentBudget: number(item.spent_budget), targets: targets(item.targets),
      distributionMode: string(item.distribution_mode, "auto") as VoucherManagementItem["distributionMode"],
      claimLimitTotal: nullableNumber(item.claim_limit_total), claimedCount: number(item.claimed_count),
      createdAt: string(item.created_at), updatedAt: string(item.updated_at),
    }];
  });
}

export const EMPTY_VOUCHER_MANAGEMENT: VoucherManagementData = {
  items: [], total: 0, limit: 100, offset: 0,
  options: { restaurants: [], categories: [], foods: [] },
};

export function parseVoucherManagement(value: unknown): VoucherManagementData {
  const source = record(value);
  const rawOptions = record(source.options);
  return {
    items: managementItems(source.items), total: number(source.total),
    limit: number(source.limit) || 100, offset: number(source.offset),
    options: {
      restaurants: options(rawOptions.restaurants),
      categories: options(rawOptions.categories),
      foods: options(rawOptions.foods),
    },
  };
}

export function parsePublicVouchers(value: unknown): PublicVoucher[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    return [{
      id: string(item.id), code: string(item.code), name: string(item.name),
      description: string(item.description),
      issuerType: string(item.issuer_type, "platform") as PublicVoucher["issuerType"],
      restaurantId: optionalString(item.restaurant_id),
      benefitScope: string(item.benefit_scope, "items") as PublicVoucher["benefitScope"],
      targetScope: string(item.target_scope, "system") as PublicVoucher["targetScope"],
      discountType: string(item.discount_type, "fixed") as PublicVoucher["discountType"],
      discountValue: number(item.discount_value), maxDiscount: nullableNumber(item.max_discount),
      minOrderValue: number(item.min_order_value), expiredAt: string(item.expired_at),
      targets: targets(item.targets),
      distributionMode: string(item.distribution_mode, "auto") as PublicVoucher["distributionMode"],
      claimLimitTotal: nullableNumber(item.claim_limit_total), claimedCount: number(item.claimed_count),
      canClaim: item.can_claim === true, walletAvailableCount: number(item.wallet_available_count),
    }];
  });
}

function parseWallet(value: unknown): VoucherWalletItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    const [voucher] = parsePublicVouchers([item]);
    if (!voucher || !string(item.wallet_id)) return [];
    return [{
      ...voucher,
      walletId: string(item.wallet_id),
      walletStatus: string(item.wallet_status, "available") as VoucherWalletItem["walletStatus"],
      source: string(item.source, "claim") as VoucherWalletItem["source"],
      claimedAt: string(item.claimed_at),
      reservedAt: optionalString(item.reserved_at),
      usedAt: optionalString(item.used_at),
      orderId: optionalString(item.order_id),
      walletExpiresAt: string(item.wallet_expires_at, string(item.expired_at)),
    }];
  });
}

export function parseCustomerVouchers(value: unknown): CustomerVoucherData {
  const source = record(value);
  return { discover: parsePublicVouchers(source.discover), wallet: parseWallet(source.wallet) };
}

const fetchPublicVouchers = unstable_cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("api_list_public_vouchers_v2");
  if (error) throw new Error(error.message);
  return parsePublicVouchers(data);
}, ["public-vouchers-v2"], { revalidate: 60, tags: ["vouchers"] });

export async function getPublicVouchers(): Promise<PublicVoucher[]> {
  try {
    return await fetchPublicVouchers();
  } catch (error) {
    console.error("[vouchers] Không thể tải voucher công khai", error);
    return [];
  }
}
