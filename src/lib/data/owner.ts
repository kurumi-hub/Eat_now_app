import type {
  ManagedRestaurantSummary,
  OwnerDashboardData,
  RestaurantApplication,
  RestaurantApplicationEvent,
  RestaurantApplicationStatus,
  RestaurantMedia,
  RestaurantMember,
  RestaurantPermission,
  RestaurantOrderState,
  SellerContext,
  StaffInvitation,
} from "@/types/owner";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
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

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function parseManagedRestaurants(value: unknown): ManagedRestaurantSummary[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    return [{
      id: string(item.id),
      slug: string(item.slug),
      name: string(item.name, "Nhà hàng"),
      membershipRole: string(item.membership_role) === "RESTAURANT_OWNER"
        ? "RESTAURANT_OWNER" as const
        : "RESTAURANT_STAFF" as const,
      permissions: strings(item.permissions) as RestaurantPermission[],
      approvalStatus: string(item.approval_status, "PENDING") as ManagedRestaurantSummary["approvalStatus"],
      lifecycleStatus: string(item.lifecycle_status, "SETUP") as ManagedRestaurantSummary["lifecycleStatus"],
      publishedAt: optionalString(item.published_at),
      acceptingOrders: item.accepting_orders === true,
      orderState: string(item.order_state, "UNAVAILABLE") as RestaurantOrderState,
    }];
  });
}

export function parseSellerContext(value: unknown): SellerContext {
  const source = record(value);
  const rawApplication = record(source.application);
  const application: RestaurantApplication | null = string(rawApplication.id) ? {
    id: string(rawApplication.id),
    status: string(rawApplication.status, "DRAFT") as RestaurantApplicationStatus,
    revision: number(rawApplication.revision) || 1,
    restaurantId: optionalString(rawApplication.restaurant_id),
    restaurantName: string(rawApplication.restaurant_name),
    description: optionalString(rawApplication.description),
    address: string(rawApplication.address),
    phone: string(rawApplication.phone),
    lat: rawApplication.lat == null ? undefined : number(rawApplication.lat),
    lon: rawApplication.lon == null ? undefined : number(rawApplication.lon),
    timezone: string(rawApplication.timezone, "Asia/Ho_Chi_Minh"),
    businessLicenseNumber: optionalString(rawApplication.business_license_number),
    taxCode: optionalString(rawApplication.tax_code),
    legalRepresentativeName: optionalString(rawApplication.legal_representative_name),
    reviewNote: optionalString(rawApplication.review_note),
    submittedAt: optionalString(rawApplication.submitted_at),
    reviewStartedAt: optionalString(rawApplication.review_started_at),
    reviewedAt: optionalString(rawApplication.reviewed_at),
    createdAt: string(rawApplication.created_at),
    updatedAt: string(rawApplication.updated_at),
  } : null;

  const timeline: RestaurantApplicationEvent[] = Array.isArray(source.timeline)
    ? source.timeline.flatMap((raw) => {
        const item = record(raw);
        if (!string(item.id)) return [];
        return [{
          id: string(item.id),
          fromStatus: optionalString(item.from_status) as RestaurantApplicationStatus | undefined,
          toStatus: string(item.to_status, "DRAFT") as RestaurantApplicationStatus,
          revision: number(item.revision) || 1,
          note: optionalString(item.note),
          createdAt: string(item.created_at),
        }];
      })
    : [];

  return { application, timeline, restaurants: parseManagedRestaurants(source.restaurants) };
}

export function parseStaffInvitations(value: unknown): StaffInvitation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    return [{
      id: string(item.id), restaurantId: string(item.restaurant_id),
      restaurantName: string(item.restaurant_name, "Nhà hàng"),
      invitedByName: string(item.invited_by_name, "Owner"),
      email: string(item.email), expiresAt: string(item.expires_at),
      createdAt: string(item.created_at),
    }];
  });
}

export function parseOwnerDashboard(value: unknown): OwnerDashboardData | null {
  const source = record(value);
  const restaurant = record(source.restaurant);
  if (!string(restaurant.id)) return null;
  const rawStats = record(source.order_stats);
  const hours = Array.isArray(source.hours) ? source.hours.map((raw) => {
    const item = record(raw);
    return { dayOfWeek: number(item.day_of_week), slotNo: number(item.slot_no) || 1,
      opensAt: string(item.opens_at).slice(0, 5), closesAt: string(item.closes_at).slice(0, 5) };
  }) : [];
  const media: RestaurantMedia[] = Array.isArray(source.media) ? source.media.flatMap((raw) => {
    const item = record(raw);
    const kind = string(item.kind);
    if (!string(item.id) || !["logo", "cover", "gallery"].includes(kind)) return [];
    return [{ id: string(item.id), kind: kind as RestaurantMedia["kind"], url: string(item.url),
      objectPath: optionalString(item.object_path), altText: optionalString(item.alt_text),
      displayOrder: number(item.display_order) }];
  }) : [];
  const members: RestaurantMember[] = Array.isArray(source.members) ? source.members.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.user_id)) return [];
    return [{ userId: string(item.user_id), name: string(item.name, "Thành viên"),
      phone: optionalString(item.phone), role: string(item.role) === "RESTAURANT_OWNER"
        ? "RESTAURANT_OWNER" as const : "RESTAURANT_STAFF" as const,
      status: string(item.status, "ACTIVE") as RestaurantMember["status"],
      joinedAt: optionalString(item.joined_at) }];
  }) : [];
  const invitations = Array.isArray(source.invitations) ? source.invitations.map((raw) => {
    const item = record(raw);
    return { id: string(item.id), email: string(item.email), status: string(item.status),
      expiresAt: string(item.expires_at), createdAt: string(item.created_at) };
  }).filter((item) => item.id) : [];
  return {
    restaurant: {
      id: string(restaurant.id), slug: string(restaurant.slug), name: string(restaurant.name),
      description: string(restaurant.description), address: string(restaurant.address),
      phone: string(restaurant.phone),
      lat: restaurant.lat == null ? undefined : number(restaurant.lat),
      lon: restaurant.lon == null ? undefined : number(restaurant.lon),
      timezone: string(restaurant.timezone, "Asia/Ho_Chi_Minh"),
      approvalStatus: string(restaurant.approval_status, "PENDING") as OwnerDashboardData["restaurant"]["approvalStatus"],
      lifecycleStatus: string(restaurant.lifecycle_status, "SETUP") as OwnerDashboardData["restaurant"]["lifecycleStatus"],
      publishedAt: optionalString(restaurant.published_at),
      acceptingOrders: restaurant.accepting_orders === true,
      pausedReason: optionalString(restaurant.paused_reason),
      pausedUntil: optionalString(restaurant.paused_until),
      orderState: string(restaurant.order_state, "UNAVAILABLE") as RestaurantOrderState,
    },
    permissions: strings(source.permissions) as RestaurantPermission[], hours, media, members, invitations,
    orderStats: { today: number(rawStats.today), open: number(rawStats.open),
      completedToday: number(rawStats.completed_today) },
  };
}
