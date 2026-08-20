import ModeratorDashboard from "@/components/moderator/ModeratorDashboard";
import type {
  ModerationQueue,
  ModerationReport,
  ModerationStatus,
  ModeratorDashboardStats,
} from "@/types/moderator";
import { MODERATION_STATUSES } from "@/types/moderator";
import { requirePermission } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type ModeratorPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
  }>;
};

type UnknownRecord = Record<string, unknown>;

const EMPTY_STATS: ModeratorDashboardStats = {
  open: 0,
  in_review: 0,
  urgent: 0,
  resolved_today: 0,
};

const EMPTY_QUEUE: ModerationQueue = {
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseStats(value: unknown): ModeratorDashboardStats {
  if (!isRecord(value) || !isRecord(value.moderation)) {
    return EMPTY_STATS;
  }

  return {
    open: safeNumber(value.moderation.open),
    in_review: safeNumber(value.moderation.in_review),
    urgent: safeNumber(value.moderation.urgent),
    resolved_today: safeNumber(value.moderation.resolved_today),
  };
}

function parseQueue(value: unknown): ModerationQueue {
  if (!isRecord(value)) {
    return EMPTY_QUEUE;
  }

  const items = Array.isArray(value.items)
    ? value.items.filter(
        (item): item is ModerationReport =>
          isRecord(item) &&
          typeof item.id === "string" &&
          typeof item.entity_id === "string" &&
          typeof item.entity_type === "string" &&
          typeof item.reason === "string" &&
          typeof item.status === "string" &&
          typeof item.priority === "string" &&
          typeof item.created_at === "string"
      )
    : [];

  return {
    items,
    total: safeNumber(value.total),
    limit: safeNumber(value.limit) || 20,
    offset: safeNumber(value.offset),
  };
}

function normalizeStatus(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;
  return MODERATION_STATUSES.includes(status as ModerationStatus)
    ? (status as ModerationStatus)
    : "all";
}

export default async function ModeratorPage({ searchParams }: ModeratorPageProps) {
  const user = await requirePermission("moderation.queue");
  const params = await searchParams;
  const activeStatus = normalizeStatus(params.status);
  const pageValue = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsedPage = Number.parseInt(pageValue ?? "", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = 20;
  const supabase = await createClient();

  const [dashboardResult, queueResult] = await Promise.all([
    supabase.rpc("api_get_admin_dashboard"),
    supabase.rpc("api_list_moderation_queue", {
      p_status: activeStatus === "all" ? null : activeStatus,
      p_limit: limit,
      p_offset: (page - 1) * limit,
    }),
  ]);

  const errors = [dashboardResult.error, queueResult.error].filter(Boolean);
  if (errors.length > 0) {
    console.error("[moderator] Không thể tải dashboard", errors);
  }

  return (
    <ModeratorDashboard
      user={user}
      stats={parseStats(dashboardResult.data)}
      queue={parseQueue(queueResult.data)}
      activeStatus={activeStatus}
      loadError={
        errors.length > 0
          ? "Chưa thể tải đầy đủ dữ liệu kiểm duyệt. Hãy kiểm tra SQL 14–17 và thử tải lại."
          : undefined
      }
    />
  );
}
