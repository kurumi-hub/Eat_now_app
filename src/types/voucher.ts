export type VoucherIssuerType = "platform" | "restaurant";
export type VoucherBenefitScope = "items" | "shipping";
export type VoucherTargetScope = "system" | "restaurant" | "category" | "food";
export type VoucherDiscountType = "fixed" | "percent";
export type VoucherDistributionMode = "auto" | "claim" | "assigned";
export type VoucherWalletStatus = "available" | "reserved" | "used" | "expired" | "revoked";
export type VoucherStoredStatus = "draft" | "active" | "paused" | "archived";
export type VoucherEffectiveStatus =
  | VoucherStoredStatus
  | "scheduled"
  | "exhausted"
  | "ended";

export type VoucherTarget = {
  id: string;
  type: Exclude<VoucherTargetScope, "system">;
  name: string;
};

export type VoucherOption = {
  id: string;
  name: string;
  restaurantId?: string;
  restaurantName?: string;
};

export type VoucherManagementItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  terms: string;
  issuerType: VoucherIssuerType;
  restaurantId?: string;
  benefitScope: VoucherBenefitScope;
  targetScope: VoucherTargetScope;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  usageLimitTotal: number | null;
  usageLimitUser: number;
  usedCount: number;
  status: VoucherStoredStatus;
  effectiveStatus: VoucherEffectiveStatus;
  startAt: string;
  expiredAt: string;
  totalBudget: number | null;
  reservedBudget: number;
  spentBudget: number;
  distributionMode: VoucherDistributionMode;
  claimLimitTotal: number | null;
  claimedCount: number;
  targets: VoucherTarget[];
  createdAt: string;
  updatedAt: string;
};

export type VoucherManagementData = {
  items: VoucherManagementItem[];
  total: number;
  limit: number;
  offset: number;
  options: {
    restaurants: VoucherOption[];
    categories: VoucherOption[];
    foods: VoucherOption[];
  };
};

export type VoucherSaveInput = {
  id?: string;
  code: string;
  name: string;
  description: string;
  terms: string;
  benefitScope: VoucherBenefitScope;
  targetScope: VoucherTargetScope;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  usageLimitTotal: number | null;
  usageLimitUser: number;
  totalBudget: number | null;
  distributionMode: VoucherDistributionMode;
  claimLimitTotal: number | null;
  startAt: string;
  expiredAt: string;
  targetIds: string[];
  status: VoucherStoredStatus;
};

export type PublicVoucher = {
  id: string;
  code: string;
  name: string;
  description: string;
  issuerType: VoucherIssuerType;
  restaurantId?: string;
  benefitScope: VoucherBenefitScope;
  targetScope: VoucherTargetScope;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  expiredAt: string;
  targets: VoucherTarget[];
  distributionMode: VoucherDistributionMode;
  claimLimitTotal: number | null;
  claimedCount: number;
  canClaim: boolean;
  walletAvailableCount: number;
};

export type VoucherWalletItem = PublicVoucher & {
  walletId: string;
  walletStatus: VoucherWalletStatus;
  source: "claim" | "admin" | "system" | "referral" | "compensation";
  claimedAt: string;
  reservedAt?: string;
  usedAt?: string;
  orderId?: string;
  walletExpiresAt: string;
};

export type CustomerVoucherData = {
  discover: PublicVoucher[];
  wallet: VoucherWalletItem[];
};

export type VoucherActionResult = {
  ok: boolean;
  message: string;
  voucherId?: string;
};
