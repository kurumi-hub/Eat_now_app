export const MODERATION_STATUSES = [
  "open",
  "in_review",
  "resolved",
  "dismissed",
] as const;

export type ModerationStatus = (typeof MODERATION_STATUSES)[number];
export type ModerationPriority = "low" | "normal" | "high" | "urgent";
export type ModerationEntityType =
  | "restaurant_review"
  | "food_review"
  | "restaurant"
  | "food"
  | "user"
  | "order"
  | string;

export type ModerationPerson = {
  id?: string;
  full_name?: string;
};

export type ModerationTarget = Record<string, unknown> & {
  rating?: number;
  comment?: string;
  moderation_status?: string;
  author_id?: string;
  name?: string;
  full_name?: string;
  code?: string;
  status?: string;
};

export type ModerationReport = {
  id: string;
  entity_type: ModerationEntityType;
  entity_id: string;
  reason: string;
  description?: string | null;
  status: ModerationStatus;
  priority: ModerationPriority;
  assigned_to?: string | null;
  resolution?: string | null;
  resolution_note?: string | null;
  created_at: string;
  updated_at?: string;
  reporter?: ModerationPerson | null;
  target?: ModerationTarget | null;
};

export type ModeratorDashboardStats = {
  open: number;
  in_review: number;
  urgent: number;
  resolved_today: number;
};

export type ModerationQueue = {
  items: ModerationReport[];
  total: number;
  limit: number;
  offset: number;
};

export type ModeratorActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
