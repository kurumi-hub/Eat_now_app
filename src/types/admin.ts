import type { UserRole } from "./auth";

export type AdminTab =
  | "overview"
  | "users"
  | "restaurants"
  | "refunds"
  | "audit";

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
  limit: number;
  offset: number;
};

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
