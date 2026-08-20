import type {
  AdminFinanceSettings,
  FinanceRestaurantOverride,
  FinanceRestaurantOption,
  FinanceSettlementCycle,
  FinanceSimulation,
  FinanceSimulationBreakdown,
  FinanceSimulationSettings,
  FinanceTaxBasis,
  FinanceTaxRule,
  FinanceVersion,
} from "@/types/admin";

type UnknownRecord = Record<string, unknown>;

export const EMPTY_ADMIN_FINANCE: AdminFinanceSettings = {
  versions: [],
  overrides: [],
  restaurants: [],
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: unknown) {
  return value == null ? undefined : numberValue(value);
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function isCycle(value: unknown): value is FinanceSettlementCycle {
  return ["daily", "weekly", "biweekly", "monthly"].includes(String(value));
}

function isTaxBasis(value: unknown): value is FinanceTaxBasis {
  return ["platform_fees", "owner_revenue", "order_subtotal"].includes(
    String(value)
  );
}

function parseTaxes(value: unknown): FinanceTaxRule[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): FinanceTaxRule[] => {
    if (!isRecord(item)) return [];
    const code = typeof item.code === "string" ? item.code : "";
    const name = typeof item.name === "string" ? item.name : "";
    if (!code || !name || !isTaxBasis(item.basis)) return [];
    return [{
      code,
      name,
      rate_percent: numberValue(item.rate_percent),
      basis: item.basis,
    }];
  });
}

function parseStatus(value: unknown): "scheduled" | "active" | "expired" {
  return value === "scheduled" || value === "active" ? value : "expired";
}

function parseVersion(item: unknown): FinanceVersion | null {
  if (!isRecord(item) || typeof item.id !== "string" || !isCycle(item.settlement_cycle)) {
    return null;
  }
  return {
    id: item.id,
    version_number: numberValue(item.version_number),
    name: typeof item.name === "string" ? item.name : "Biểu phí",
    commission_percent: numberValue(item.commission_percent),
    fixed_order_fee: numberValue(item.fixed_order_fee),
    gateway_fee_percent: numberValue(item.gateway_fee_percent),
    gateway_fixed_fee: numberValue(item.gateway_fixed_fee),
    refund_fee_percent: numberValue(item.refund_fee_percent),
    refund_fixed_fee: numberValue(item.refund_fixed_fee),
    voucher_platform_percent: numberValue(item.voucher_platform_percent),
    settlement_cycle: item.settlement_cycle,
    settlement_day: numberValue(item.settlement_day),
    minimum_payout: numberValue(item.minimum_payout),
    hold_percent: numberValue(item.hold_percent),
    hold_fixed_amount: numberValue(item.hold_fixed_amount),
    hold_days: numberValue(item.hold_days),
    taxes: parseTaxes(item.taxes),
    effective_from: typeof item.effective_from === "string" ? item.effective_from : "",
    effective_to: nullableString(item.effective_to),
    superseded_by_id: nullableString(item.superseded_by_id),
    note: nullableString(item.note),
    created_by: nullableString(item.created_by),
    created_by_name: nullableString(item.created_by_name),
    created_at: typeof item.created_at === "string" ? item.created_at : "",
    status: parseStatus(item.status),
  };
}

function parseOverride(item: unknown): FinanceRestaurantOverride | null {
  if (!isRecord(item) || typeof item.id !== "string" || typeof item.restaurant_id !== "string") {
    return null;
  }
  const cycle = isCycle(item.settlement_cycle) ? item.settlement_cycle : undefined;
  return {
    id: item.id,
    restaurant_id: item.restaurant_id,
    restaurant_name:
      typeof item.restaurant_name === "string" ? item.restaurant_name : "Nhà hàng",
    version_number: numberValue(item.version_number),
    name: typeof item.name === "string" ? item.name : "Ngoại lệ",
    commission_percent: nullableNumber(item.commission_percent),
    fixed_order_fee: nullableNumber(item.fixed_order_fee),
    gateway_fee_percent: nullableNumber(item.gateway_fee_percent),
    gateway_fixed_fee: nullableNumber(item.gateway_fixed_fee),
    refund_fee_percent: nullableNumber(item.refund_fee_percent),
    refund_fixed_fee: nullableNumber(item.refund_fixed_fee),
    voucher_platform_percent: nullableNumber(item.voucher_platform_percent),
    settlement_cycle: cycle,
    settlement_day: nullableNumber(item.settlement_day),
    minimum_payout: nullableNumber(item.minimum_payout),
    hold_percent: nullableNumber(item.hold_percent),
    hold_fixed_amount: nullableNumber(item.hold_fixed_amount),
    hold_days: nullableNumber(item.hold_days),
    taxes: item.taxes == null ? null : parseTaxes(item.taxes),
    effective_from: typeof item.effective_from === "string" ? item.effective_from : "",
    effective_to: nullableString(item.effective_to),
    superseded_by_id: nullableString(item.superseded_by_id),
    note: nullableString(item.note),
    created_by: nullableString(item.created_by),
    created_by_name: nullableString(item.created_by_name),
    created_at: typeof item.created_at === "string" ? item.created_at : "",
    status: parseStatus(item.status),
  };
}

function parseRestaurant(item: unknown): FinanceRestaurantOption | null {
  return isRecord(item) && typeof item.id === "string" && typeof item.name === "string"
    ? { id: item.id, name: item.name }
    : null;
}

export function parseAdminFinance(value: unknown): AdminFinanceSettings {
  if (!isRecord(value)) return EMPTY_ADMIN_FINANCE;
  return {
    versions: Array.isArray(value.versions)
      ? value.versions.map(parseVersion).filter((item): item is FinanceVersion => Boolean(item))
      : [],
    overrides: Array.isArray(value.overrides)
      ? value.overrides
          .map(parseOverride)
          .filter((item): item is FinanceRestaurantOverride => Boolean(item))
      : [],
    restaurants: Array.isArray(value.restaurants)
      ? value.restaurants
          .map(parseRestaurant)
          .filter((item): item is FinanceRestaurantOption => Boolean(item))
      : [],
  };
}

export function parseFinanceSimulation(value: unknown): FinanceSimulation | null {
  if (!isRecord(value) || !isRecord(value.settings) || !isRecord(value.input)
      || !isRecord(value.breakdown) || !isCycle(value.settings.settlement_cycle)
      || typeof value.settings.base_version_id !== "string") {
    return null;
  }
  const settings: FinanceSimulationSettings = {
    base_version_id: value.settings.base_version_id,
    base_version_number: numberValue(value.settings.base_version_number),
    base_version_name:
      typeof value.settings.base_version_name === "string"
        ? value.settings.base_version_name
        : "Biểu phí",
    override_id: nullableString(value.settings.override_id),
    override_version_number:
      value.settings.override_version_number == null
        ? null
        : numberValue(value.settings.override_version_number),
    override_name: nullableString(value.settings.override_name),
    restaurant_id: nullableString(value.settings.restaurant_id),
    at: typeof value.settings.at === "string" ? value.settings.at : "",
    commission_percent: numberValue(value.settings.commission_percent),
    fixed_order_fee: numberValue(value.settings.fixed_order_fee),
    gateway_fee_percent: numberValue(value.settings.gateway_fee_percent),
    gateway_fixed_fee: numberValue(value.settings.gateway_fixed_fee),
    refund_fee_percent: numberValue(value.settings.refund_fee_percent),
    refund_fixed_fee: numberValue(value.settings.refund_fixed_fee),
    voucher_platform_percent: numberValue(value.settings.voucher_platform_percent),
    voucher_owner_percent: numberValue(value.settings.voucher_owner_percent),
    settlement_cycle: value.settings.settlement_cycle,
    settlement_day: numberValue(value.settings.settlement_day),
    minimum_payout: numberValue(value.settings.minimum_payout),
    hold_percent: numberValue(value.settings.hold_percent),
    hold_fixed_amount: numberValue(value.settings.hold_fixed_amount),
    hold_days: numberValue(value.settings.hold_days),
    taxes: parseTaxes(value.settings.taxes),
  };
  const breakdown: FinanceSimulationBreakdown = {
    platform_funded_voucher: numberValue(value.breakdown.platform_funded_voucher),
    owner_funded_voucher: numberValue(value.breakdown.owner_funded_voucher),
    owner_gross_revenue: numberValue(value.breakdown.owner_gross_revenue),
    commission_fee: numberValue(value.breakdown.commission_fee),
    fixed_order_fee: numberValue(value.breakdown.fixed_order_fee),
    gateway_fee: numberValue(value.breakdown.gateway_fee),
    refund_processing_fee: numberValue(value.breakdown.refund_processing_fee),
    platform_fees_total: numberValue(value.breakdown.platform_fees_total),
    taxes: Array.isArray(value.breakdown.taxes)
      ? value.breakdown.taxes.flatMap((item) => {
          const tax = parseTaxes([item])[0];
          return tax && isRecord(item)
            ? [{ ...tax, base_amount: numberValue(item.base_amount), amount: numberValue(item.amount) }]
            : [];
        })
      : [],
    tax_total: numberValue(value.breakdown.tax_total),
    amount_before_hold: numberValue(value.breakdown.amount_before_hold),
    hold_amount: numberValue(value.breakdown.hold_amount),
    owner_receivable: numberValue(value.breakdown.owner_receivable),
    minimum_payout: numberValue(value.breakdown.minimum_payout),
    payout_eligible: value.breakdown.payout_eligible === true,
  };
  return {
    settings,
    input: {
      order_subtotal: numberValue(value.input.order_subtotal),
      voucher_discount: numberValue(value.input.voucher_discount),
      refund_amount: numberValue(value.input.refund_amount),
    },
    breakdown,
  };
}
