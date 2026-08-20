import AdminDashboard from "@/components/admin/AdminDashboard";
import type {
  AdminAuditList,
  AdminCatalogKind,
  AdminDashboardStats,
  AdminRefund,
  AdminRefundList,
  AdminRestaurant,
  AdminRestaurantList,
  AdminSiteMedia,
  AdminTab,
  AdminUser,
  AdminUserList,
} from "@/types/admin";
import {
  EMPTY_ADMIN_CATEGORIES,
  EMPTY_ADMIN_TAGS,
  parseAdminCategories,
  parseAdminTags,
} from "@/lib/data/adminCatalog";
import { parseSiteMedia } from "@/types/siteMedia";
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
  "restaurants",
  "refunds",
  "catalog",
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
const EMPTY_REFUNDS: AdminRefundList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_AUDIT: AdminAuditList = { items: [], total: 0, limit: 20, offset: 0 };
const EMPTY_MEDIA: AdminSiteMedia = parseSiteMedia(null);

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
      restaurants={tab === "restaurants" ? parseRestaurants(contentResult.data) : EMPTY_RESTAURANTS}
      refunds={tab === "refunds" ? parseRefunds(contentResult.data) : EMPTY_REFUNDS}
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
      audit={tab === "overview" || tab === "audit" ? parseAudit(contentResult.data) : EMPTY_AUDIT}
      loadError={errors.length ? "Chưa thể tải đầy đủ dữ liệu. Hãy kiểm tra SQL 13–19." : undefined}
    />
  );
}
