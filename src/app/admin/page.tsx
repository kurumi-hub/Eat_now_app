import AdminDashboard from "@/components/admin/AdminDashboard";
import type {
  AdminAuditList,
  AdminCatalogKind,
  AdminDashboardStats,
  AdminFinanceSettings,
  AdminOrderList,
  AdminRefund,
  AdminRefundList,
  AdminRestaurantApplication,
  AdminRestaurantApplicationList,
  AdminRestaurant,
  AdminRestaurantList,
  AdminSiteMedia,
  AdminTab,
  AdminUser,
  AdminUserList,
} from "@/types/admin";
import type { AdminShipperApplicationList } from "@/types/shipper";
import { EMPTY_ADMIN_FINANCE, parseAdminFinance } from "@/lib/data/adminFinance";
import { EMPTY_ADMIN_ORDERS, parseAdminOrders } from "@/lib/data/adminOrders";
import {
  EMPTY_ADMIN_CATEGORIES,
  EMPTY_ADMIN_TAGS,
  parseAdminCategories,
  parseAdminTags,
} from "@/lib/data/adminCatalog";
import { parseSiteMedia } from "@/types/siteMedia";
import { EMPTY_VOUCHER_MANAGEMENT, parseVoucherManagement } from "@/lib/data/vouchers";
import {
  EMPTY_ADMIN_SHIPPER_FINANCE,
  parseAdminShipperApplications,
  parseAdminShipperFinance,
} from "@/lib/data/shipper";
import { requirePermission } from "@/utils/auth/guards";
import { normalizeRoles } from "@/utils/roles";
import { createClient } from "@/utils/supabase/server";

type AdminPageProps = {
  searchParams: Promise<{
    tab?: string | string[];
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    catalog?: string | string[];
  }>;
};

type UnknownRecord = Record<string, unknown>;

const ADMIN_TABS: AdminTab[] = [
  "overview",
  "users",
  "applications",
  "shippers",
  "shipper_finance",
  "orders",
  "restaurants",
  "refunds",
  "vouchers",
  "catalog",
  "finance",
  "media",
  "audit",
];

const EMPTY_STATS: AdminDashboardStats = {
  users: { total: 0, active: 0, suspended: 0 },
  restaurants: { total: 0, pending: 0, suspended: 0 },
  orders: { today: 0, open: 0, cancelled_today: 0 },
  refunds: { pending: 0, approved: 0, processing: 0 },
  moderation: { open: 0, in_review: 0, urgent: 0, resolved_today: 0 },
};

const EMPTY_USERS: AdminUserList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_RESTAURANTS: AdminRestaurantList = {
  items: [], total: 0, limit: 20, offset: 0,
};
const EMPTY_APPLICATIONS: AdminRestaurantApplicationList = {
  items: [], total: 0, limit: 20, offset: 0,
};
const EMPTY_SHIPPER_APPLICATIONS: AdminShipperApplicationList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_REFUNDS: AdminRefundList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_AUDIT: AdminAuditList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_MEDIA: AdminSiteMedia = parseSiteMedia(null);
const EMPTY_FINANCE: AdminFinanceSettings = EMPTY_ADMIN_FINANCE;
const EMPTY_ORDERS: AdminOrderList = EMPTY_ADMIN_ORDERS;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function objectStats(value: unknown, keys: string[]) {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(keys.map((key) => [key, numberValue(source[key])]));
}

function parseStats(value: unknown): AdminDashboardStats {
  if (!isRecord(value)) return EMPTY_STATS;
  return {
    users: objectStats(value.users, ["total", "active", "suspended"]) as AdminDashboardStats["users"],
    restaurants: objectStats(value.restaurants, ["total", "pending", "suspended"]) as AdminDashboardStats["restaurants"],
    orders: objectStats(value.orders, ["today", "open", "cancelled_today"]) as AdminDashboardStats["orders"],
    refunds: objectStats(value.refunds, ["pending", "approved", "processing"]) as AdminDashboardStats["refunds"],
    moderation: objectStats(value.moderation, [
      "open", "in_review", "urgent", "resolved_today",
    ]) as AdminDashboardStats["moderation"],
  };
}

function parseUsers(value: unknown): AdminUserList {
  if (!isRecord(value)) return EMPTY_USERS;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): AdminUser[] => {
        if (!isRecord(item) || typeof item.id !== "string") return [];
        return [{
          id: item.id,
          full_name: typeof item.full_name === "string" ? item.full_name : "Người dùng EatNow",
          email: typeof item.email === "string" ? item.email : "",
          phone: typeof item.phone === "string" ? item.phone : null,
          avatar_url: typeof item.avatar_url === "string" ? item.avatar_url : null,
          is_active: item.is_active !== false,
          created_at: typeof item.created_at === "string" ? item.created_at : "",
          roles: normalizeRoles(item.roles),
          can_manage: item.can_manage === true,
        }];
      })
    : [];
  return {
    items,
    total: numberValue(value.total),
    limit: numberValue(value.limit) || 20,
    offset: numberValue(value.offset),
  };
}

function parseRestaurants(value: unknown): AdminRestaurantList {
  if (!isRecord(value)) return EMPTY_RESTAURANTS;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): AdminRestaurant[] => {
        if (!isRecord(item) || typeof item.id !== "string") return [];
        const owners = Array.isArray(item.owners)
          ? item.owners.filter(isRecord).flatMap((owner) =>
              typeof owner.id === "string"
                ? [{
                    id: owner.id,
                    full_name: typeof owner.full_name === "string" ? owner.full_name : "Chủ quán",
                    phone: typeof owner.phone === "string" ? owner.phone : null,
                  }]
                : []
            )
          : [];
        return [{
          id: item.id,
          name: typeof item.name === "string" ? item.name : "Nhà hàng",
          address: typeof item.address === "string" ? item.address : "",
          phone: typeof item.phone === "string" ? item.phone : null,
          is_active: item.is_active !== false,
          is_verified: item.is_verified === true,
          approval_status:
            item.approval_status === "APPROVED" || item.approval_status === "REJECTED"
              ? item.approval_status
              : "PENDING",
          lifecycle_status:
            item.lifecycle_status === "SETUP" ||
            item.lifecycle_status === "SUSPENDED" ||
            item.lifecycle_status === "CLOSED"
              ? item.lifecycle_status
              : "ACTIVE",
          published_at: typeof item.published_at === "string" ? item.published_at : null,
          accepting_orders: item.accepting_orders === true,
          order_state: typeof item.order_state === "string" ? item.order_state : "UNAVAILABLE",
          rating_average: numberValue(item.rating_average),
          rating_count: numberValue(item.rating_count),
          created_at: typeof item.created_at === "string" ? item.created_at : "",
          owners,
        }];
      })
    : [];
  return {
    items,
    total: numberValue(value.total),
    limit: numberValue(value.limit) || 20,
    offset: numberValue(value.offset),
  };
}

function parseApplications(value: unknown): AdminRestaurantApplicationList {
  if (!isRecord(value)) return EMPTY_APPLICATIONS;
  const items = Array.isArray(value.items) ? value.items.flatMap((raw): AdminRestaurantApplication[] => {
    if (!isRecord(raw) || typeof raw.id !== "string") return [];
    return [{
      id: raw.id,
      applicant_id: typeof raw.applicant_id === "string" ? raw.applicant_id : "",
      applicant_name: typeof raw.applicant_name === "string" ? raw.applicant_name : "Người đăng ký",
      applicant_email: typeof raw.applicant_email === "string" ? raw.applicant_email : "",
      restaurant_id: typeof raw.restaurant_id === "string" ? raw.restaurant_id : null,
      restaurant_name: typeof raw.restaurant_name === "string" ? raw.restaurant_name : "Nhà hàng",
      description: typeof raw.description === "string" ? raw.description : null,
      address: typeof raw.address === "string" ? raw.address : "",
      phone: typeof raw.phone === "string" ? raw.phone : "",
      lat: raw.lat == null ? null : numberValue(raw.lat),
      lon: raw.lon == null ? null : numberValue(raw.lon),
      timezone: typeof raw.timezone === "string" ? raw.timezone : "Asia/Ho_Chi_Minh",
      business_license_number: typeof raw.business_license_number === "string" ? raw.business_license_number : null,
      tax_code: typeof raw.tax_code === "string" ? raw.tax_code : null,
      legal_representative_name: typeof raw.legal_representative_name === "string" ? raw.legal_representative_name : null,
      status: typeof raw.status === "string" ? raw.status : "SUBMITTED",
      revision: numberValue(raw.revision) || 1,
      submitted_at: typeof raw.submitted_at === "string" ? raw.submitted_at : null,
      review_started_at: typeof raw.review_started_at === "string" ? raw.review_started_at : null,
      reviewed_at: typeof raw.reviewed_at === "string" ? raw.reviewed_at : null,
      review_note: typeof raw.review_note === "string" ? raw.review_note : null,
    }];
  }) : [];
  return { items, total: numberValue(value.total), limit: numberValue(value.limit) || 20, offset: numberValue(value.offset) };
}

function parseRefunds(value: unknown): AdminRefundList {
  if (!isRecord(value)) return EMPTY_REFUNDS;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): AdminRefund[] => {
        if (!isRecord(item) || typeof item.id !== "string" || !isRecord(item.payment)) return [];
        const requester = isRecord(item.requester) && typeof item.requester.id === "string"
          ? {
              id: item.requester.id,
              full_name: typeof item.requester.full_name === "string" ? item.requester.full_name : "Người dùng",
              phone: typeof item.requester.phone === "string" ? item.requester.phone : null,
            }
          : null;
        return [{
          id: item.id,
          order_id: typeof item.order_id === "string" ? item.order_id : "",
          order_code: typeof item.order_code === "string" ? item.order_code : "",
          requested_amount: numberValue(item.requested_amount),
          approved_amount: item.approved_amount == null ? null : numberValue(item.approved_amount),
          status: typeof item.status === "string" ? item.status : "pending",
          reason: typeof item.reason === "string" ? item.reason : "",
          requested_at: typeof item.requested_at === "string" ? item.requested_at : "",
          processed_at: typeof item.processed_at === "string" ? item.processed_at : null,
          requester,
          payment: {
            id: typeof item.payment.id === "string" ? item.payment.id : "",
            method: typeof item.payment.method === "string" ? item.payment.method : "",
            status: typeof item.payment.status === "string" ? item.payment.status : "",
            amount: numberValue(item.payment.amount),
            transaction_id: typeof item.payment.transaction_id === "string" ? item.payment.transaction_id : null,
          },
        }];
      })
    : [];
  return {
    items,
    total: numberValue(value.total),
    limit: numberValue(value.limit) || 20,
    offset: numberValue(value.offset),
  };
}

function parseAudit(value: unknown): AdminAuditList {
  if (!isRecord(value)) return EMPTY_AUDIT;
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item) =>
        isRecord(item) && typeof item.id === "string" && typeof item.action === "string"
          ? [{
              id: item.id,
              actor_id: typeof item.actor_id === "string" ? item.actor_id : null,
              actor_name: typeof item.actor_name === "string" ? item.actor_name : null,
              action: item.action,
              entity_type: typeof item.entity_type === "string" ? item.entity_type : "system",
              entity_id: typeof item.entity_id === "string" ? item.entity_id : null,
              old_value: isRecord(item.old_value) ? item.old_value : null,
              new_value: isRecord(item.new_value) ? item.new_value : null,
              created_at: typeof item.created_at === "string" ? item.created_at : "",
            }]
          : []
      )
    : [];
  return {
    items,
    total:
      numberValue(value.total) ||
      numberValue(value.offset) + items.length +
        (items.length === numberValue(value.limit) ? 1 : 0),
    limit: numberValue(value.limit) || 20,
    offset: numberValue(value.offset),
  };
}

function firstParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function positivePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requirePermission("users.view");
  const params = await searchParams;
  const requestedTab = firstParam(params.tab) as AdminTab;
  let tab = ADMIN_TABS.includes(requestedTab) ? requestedTab : "overview";
  if (tab === "media" && !user.permissions.includes("site_media.manage")) {
    tab = "overview";
  }
  if (tab === "catalog" && !user.permissions.includes("catalog.manage")) {
    tab = "overview";
  }
  if (tab === "finance" && !user.permissions.includes("finance.settings.manage")) {
    tab = "overview";
  }
  if (tab === "vouchers" && !user.permissions.includes("vouchers.manage")) {
    tab = "overview";
  }
  if (tab === "applications" && !user.permissions.includes("restaurants.verify")) {
    tab = "overview";
  }
  if (tab === "shippers" && !user.permissions.includes("shippers.verify")) {
    tab = "overview";
  }
  if (tab === "shipper_finance" && !user.permissions.includes("shippers.finance.manage")) {
    tab = "overview";
  }
  if (tab === "orders" && !user.permissions.includes("orders.view")) tab = "overview";
  const catalogKind: AdminCatalogKind =
    firstParam(params.catalog) === "tags" ? "tags" : "categories";
  const search = firstParam(params.q).slice(0, 80);
  const status = firstParam(params.status).slice(0, 30);
  const page = positivePage(params.page);
  const limit = 20;
  const offset = (page - 1) * limit;
  const supabase = await createClient();

  const contentPromise = (() => {
    if (tab === "users") {
      return supabase.rpc("api_list_admin_users", {
        p_search: search || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "applications") {
      return supabase.rpc("api_list_restaurant_applications", {
        p_status: status || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "shippers") {
      return supabase.rpc("api_list_admin_shipper_applications", {
        p_status: status || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "shipper_finance") {
      return supabase.rpc("api_list_admin_shipper_finance", {
        p_status: status || null,
        p_search: search || null,
        p_limit: limit,
        p_offset: offset,
      });
    }
    if (tab === "orders") return supabase.rpc("api_list_admin_orders", {
      p_status: status || null, p_search: search || null, p_limit: limit, p_offset: offset,
    });
    if (tab === "restaurants") {
      return supabase.rpc("api_list_admin_restaurants", {
        p_status: status || null, p_search: search || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "refunds") {
      return supabase.rpc("api_list_admin_refunds", {
        p_status: status || null, p_search: search || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "vouchers") {
      return supabase.rpc("api_list_admin_vouchers", {
        p_status: status || null, p_search: search || null, p_limit: limit, p_offset: offset,
      });
    }
    if (tab === "catalog") {
      const rpc = catalogKind === "tags"
        ? "api_list_admin_tags"
        : "api_list_admin_categories";
      return supabase.rpc(rpc, {
        p_status: status || null,
        p_search: search || null,
        p_limit: limit,
        p_offset: offset,
      });
    }
    if (tab === "media") {
      return supabase.rpc("api_get_site_media");
    }
    if (tab === "finance") {
      return supabase.rpc("api_get_finance_settings", {
        p_version_limit: 50,
        p_override_limit: 100,
      });
    }
    return supabase.rpc("api_list_audit_logs", {
      p_limit: tab === "audit" ? limit : 8,
      p_offset: tab === "audit" ? offset : 0,
    });
  })();

  const [dashboardResult, contentResult] = await Promise.all([
    supabase.rpc("api_get_admin_dashboard"),
    contentPromise,
  ]);
  const errors = [dashboardResult.error, contentResult.error].filter(Boolean);
  if (errors.length) console.error("[admin] Không thể tải dashboard", errors);

  return (
    <AdminDashboard
      user={user}
      tab={tab}
      searchTerm={search}
      statusFilter={status}
      stats={parseStats(dashboardResult.data)}
      users={tab === "users" ? parseUsers(contentResult.data) : EMPTY_USERS}
      applications={tab === "applications" ? parseApplications(contentResult.data) : EMPTY_APPLICATIONS}
      shipperApplications={tab === "shippers" ? parseAdminShipperApplications(contentResult.data) : EMPTY_SHIPPER_APPLICATIONS}
      shipperFinance={tab === "shipper_finance" ? parseAdminShipperFinance(contentResult.data) : EMPTY_ADMIN_SHIPPER_FINANCE}
      orders={tab === "orders" ? parseAdminOrders(contentResult.data) : EMPTY_ORDERS}
      restaurants={tab === "restaurants" ? parseRestaurants(contentResult.data) : EMPTY_RESTAURANTS}
      refunds={tab === "refunds" ? parseRefunds(contentResult.data) : EMPTY_REFUNDS}
      vouchers={tab === "vouchers" ? parseVoucherManagement(contentResult.data) : EMPTY_VOUCHER_MANAGEMENT}
      catalogKind={catalogKind}
      categories={
        tab === "catalog" && catalogKind === "categories"
          ? parseAdminCategories(contentResult.data)
          : EMPTY_ADMIN_CATEGORIES
      }
      tags={
        tab === "catalog" && catalogKind === "tags"
          ? parseAdminTags(contentResult.data)
          : EMPTY_ADMIN_TAGS
      }
      media={tab === "media" ? parseSiteMedia(contentResult.data) : EMPTY_MEDIA}
      finance={tab === "finance" ? parseAdminFinance(contentResult.data) : EMPTY_FINANCE}
      audit={tab === "overview" || tab === "audit" ? parseAudit(contentResult.data) : EMPTY_AUDIT}
      loadError={errors.length ? "Chưa thể tải đầy đủ dữ liệu. Hãy kiểm tra các migration, gồm SQL 32 cho Voucher." : undefined}
    />
  );
}
