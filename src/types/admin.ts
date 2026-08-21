import type { UserRole } from "./auth";
import type { SiteMediaMap } from "./siteMedia";

export type AdminTab =
  | "overview"
  | "users"
  | "applications"
  | "restaurants"
  | "refunds"
  | "catalog"
  | "finance"
  | "media"
  | "audit";

export type AdminSiteMedia = SiteMediaMap;

export type AdminDashboardStats = {
  users: { total: number; active: number; suspended: number };
  restaurants: { total: number; pending: number; suspended: number };
  orders: { today: number; open: number; cancelled_today: number };
  refunds: { pending: number; approved: number; processing: number };
  moderation: {
    open: number;
    in_review: number;
    urgent: number;
    resolved_today: number;
  };
};

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  roles: UserRole[];
  can_manage: boolean;
};

export type AdminUserList = {
  items: AdminUser[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminRestaurantOwner = {
  id: string;
  full_name: string;
  phone?: string | null;
};

export type AdminRestaurant = {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  is_active: boolean;
  is_verified: boolean;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  lifecycle_status: "SETUP" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  published_at?: string | null;
  accepting_orders: boolean;
  order_state: string;
  rating_average: number;
  rating_count: number;
  created_at: string;
  owners: AdminRestaurantOwner[];
};

export type AdminRestaurantList = {
  items: AdminRestaurant[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminRestaurantApplication = {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  restaurant_id?: string | null;
  restaurant_name: string;
  description?: string | null;
  address: string;
  phone: string;
  lat?: number | null;
  lon?: number | null;
  timezone: string;
  business_license_number?: string | null;
  tax_code?: string | null;
  legal_representative_name?: string | null;
  status: string;
  revision: number;
  submitted_at?: string | null;
  review_started_at?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
};

export type AdminRestaurantApplicationList = {
  items: AdminRestaurantApplication[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminRefund = {
  id: string;
  order_id: string;
  order_code: string;
  requested_amount: number;
  approved_amount?: number | null;
  status: string;
  reason: string;
  requested_at: string;
  processed_at?: string | null;
  requester?: {
    id: string;
    full_name: string;
    phone?: string | null;
  } | null;
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    transaction_id?: string | null;
  };
};

export type AdminRefundList = {
  items: AdminRefund[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminCatalogKind = "categories" | "tags";

export type AdminCategory = {
  id: string;
  name: string;
  icon_url: string | null;
  icon_object_path: string | null;
  icon_alt_text: string;
  display_order: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminTag = {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminCategoryList = {
  items: AdminCategory[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminTagList = {
  items: AdminTag[];
  total: number;
  limit: number;
  offset: number;
};

export type FinanceSettlementCycle =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly";

export type FinanceTaxBasis =
  | "platform_fees"
  | "owner_revenue"
  | "order_subtotal";

export type FinanceTaxRule = {
  code: string;
  name: string;
  rate_percent: number;
  basis: FinanceTaxBasis;
};

export type FinanceSettingsValues = {
  commission_percent: number;
  fixed_order_fee: number;
  gateway_fee_percent: number;
  gateway_fixed_fee: number;
  refund_fee_percent: number;
  refund_fixed_fee: number;
  voucher_platform_percent: number;
  settlement_cycle: FinanceSettlementCycle;
  settlement_day: number;
  minimum_payout: number;
  hold_percent: number;
  hold_fixed_amount: number;
  hold_days: number;
  taxes: FinanceTaxRule[];
};

export type FinanceVersion = FinanceSettingsValues & {
  id: string;
  version_number: number;
  name: string;
  effective_from: string;
  effective_to: string | null;
  superseded_by_id: string | null;
  note: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  status: "scheduled" | "active" | "expired";
};

export type FinanceOverrideSettings = Omit<Partial<FinanceSettingsValues>, "taxes"> & {
  taxes?: FinanceTaxRule[] | null;
};

export type FinanceRestaurantOverride = FinanceOverrideSettings & {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  version_number: number;
  name: string;
  effective_from: string;
  effective_to: string | null;
  superseded_by_id: string | null;
  note: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  status: "scheduled" | "active" | "expired";
};

export type FinanceRestaurantOption = {
  id: string;
  name: string;
};

export type AdminFinanceSettings = {
  versions: FinanceVersion[];
  overrides: FinanceRestaurantOverride[];
  restaurants: FinanceRestaurantOption[];
};

export type CreateFinanceVersionInput = {
  name: string;
  effective_from: string;
  effective_to: string | null;
  note: string;
  settings: FinanceSettingsValues;
};

export type CreateFinanceOverrideInput = {
  restaurant_id: string;
  name: string;
  effective_from: string;
  effective_to: string | null;
  note: string;
  settings: FinanceOverrideSettings;
};

export type FinanceSimulationInput = {
  restaurant_id: string | null;
  at: string;
  order_subtotal: number;
  voucher_discount: number;
  refund_amount: number;
};

export type FinanceSimulationSettings = FinanceSettingsValues & {
  base_version_id: string;
  base_version_number: number;
  base_version_name: string;
  override_id: string | null;
  override_version_number: number | null;
  override_name: string | null;
  restaurant_id: string | null;
  at: string;
  voucher_owner_percent: number;
};

export type FinanceSimulationBreakdown = {
  platform_funded_voucher: number;
  owner_funded_voucher: number;
  owner_gross_revenue: number;
  commission_fee: number;
  fixed_order_fee: number;
  gateway_fee: number;
  refund_processing_fee: number;
  platform_fees_total: number;
  taxes: Array<FinanceTaxRule & { base_amount: number; amount: number }>;
  tax_total: number;
  amount_before_hold: number;
  hold_amount: number;
  owner_receivable: number;
  minimum_payout: number;
  payout_eligible: boolean;
};

export type FinanceSimulation = {
  settings: FinanceSimulationSettings;
  input: {
    order_subtotal: number;
    voucher_discount: number;
    refund_amount: number;
  };
  breakdown: FinanceSimulationBreakdown;
};

export type FinanceSimulationActionResult =
  | { ok: true; message: string; data: FinanceSimulation }
  | { ok: false; message: string };

export type AdminCatalogOrderItem = {
  id: string;
  display_order: number;
};

export type AdminAuditLog = {
  id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
};

export type AdminAuditList = {
  items: AdminAuditLog[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
