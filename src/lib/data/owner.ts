import type {
  ManagedRestaurantSummary,
  OwnerFood,
  OwnerDashboardData,
  OwnerOrderList,
  OwnerMenuCatalogItem,
  OwnerMenuData,
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

export const EMPTY_OWNER_ORDERS: OwnerOrderList = { items: [], total: 0, limit: 100, offset: 0 };

export function parseOwnerOrders(value: unknown): OwnerOrderList {
  const source = record(value);
  const items = Array.isArray(source.items) ? source.items.flatMap((raw) => {
    const item = record(raw); if (!string(item.id)) return [];
    const payment = record(item.payment); const shipper = record(item.shipper);
    return [{
      id: string(item.id), code: string(item.code), status: string(item.status),
      deliveryStatus: string(item.delivery_status), version: number(item.version),
      createdAt: string(item.created_at), responseDueAt: optionalString(item.response_due_at),
      preparationDueAt: optionalString(item.preparation_due_at),
      pickupConfirmationRequestedAt: optionalString(item.pickup_confirmation_requested_at),
      pickupConfirmedAt: optionalString(item.pickup_confirmed_at), receiverName: string(item.receiver_name),
      receiverPhone: string(item.receiver_phone), deliveryAddress: string(item.delivery_address),
      note: optionalString(item.note), subtotal: number(item.subtotal), shippingFee: number(item.shipping_fee),
      discountAmount: number(item.discount_amount), taxAmount: number(item.tax_amount), totalPrice: number(item.total_price),
      payment: { method: string(payment.method), status: string(payment.status) },
      shipper: string(shipper.id) ? { id: string(shipper.id), name: string(shipper.name),
        phone: optionalString(shipper.phone), plateNumber: optionalString(shipper.plate_number) } : null,
      incidentStatus: string(item.incident_status, "none"), incidentReason: optionalString(item.incident_reason),
      items: Array.isArray(item.items) ? item.items.map((rawItem) => { const orderItem = record(rawItem); return {
        name: string(orderItem.name), size: optionalString(orderItem.size), quantity: number(orderItem.quantity),
        lineTotal: number(orderItem.line_total), note: optionalString(orderItem.note) }; }) : [],
      events: Array.isArray(item.events) ? item.events.map((rawEvent) => { const event = record(rawEvent); return {
        id: string(event.id), eventType: string(event.event_type),
        fromOrderStatus: optionalString(event.from_order_status), toOrderStatus: optionalString(event.to_order_status),
        fromDeliveryStatus: optionalString(event.from_delivery_status), toDeliveryStatus: optionalString(event.to_delivery_status),
        source: string(event.source), note: optionalString(event.note), createdAt: string(event.created_at) }; }) : [],
    }];
  }) : [];
  return { items, total: number(source.total), limit: number(source.limit) || 100, offset: number(source.offset) };
}

export function parseOwnerMenu(value: unknown): OwnerMenuData {
  const source = record(value);
  const parseCatalog = (raw: unknown): OwnerMenuCatalogItem[] =>
    Array.isArray(raw) ? raw.flatMap((value) => {
      const item = record(value);
      if (!string(item.id)) return [];
      return [{ id: string(item.id), name: string(item.name),
        isActive: item.is_active === true, displayOrder: number(item.display_order) }];
    }) : [];
  const categories = parseCatalog(source.categories);
  const tags = parseCatalog(source.tags);
  const foods: OwnerFood[] = Array.isArray(source.foods) ? source.foods.flatMap((raw) => {
    const item = record(raw);
    if (!string(item.id)) return [];
    const rawCategory = record(item.category);
    const parseOptions = (value: unknown) => Array.isArray(value) ? value : [];
    return [{
      id: string(item.id), name: string(item.name), description: string(item.description),
      basePrice: number(item.base_price), isPublic: item.is_public === true,
      isAvailable: item.is_available === true, displayOrder: number(item.display_order),
      updatedAt: string(item.updated_at),
      category: string(rawCategory.id) ? { id: string(rawCategory.id),
        name: string(rawCategory.name), isActive: rawCategory.is_active === true,
        displayOrder: 0 } : null,
      tags: parseOptions(item.tags).flatMap((rawTag) => { const tag = record(rawTag);
        return string(tag.id) ? [{ id: string(tag.id), name: string(tag.name),
          isActive: tag.is_active === true, displayOrder: 0 }] : []; }),
      images: parseOptions(item.images).flatMap((rawImage) => { const image = record(rawImage);
        return string(image.id) ? [{ id: string(image.id), url: string(image.url),
          objectPath: optionalString(image.object_path), altText: string(image.alt_text),
          isPrimary: image.is_primary === true, displayOrder: number(image.display_order) }] : []; }),
      sizes: parseOptions(item.sizes).map((rawSize) => { const size = record(rawSize); return {
        id: optionalString(size.id), name: string(size.name), price: number(size.price),
        isAvailable: size.is_available === true, displayOrder: number(size.display_order) }; }),
      toppingGroups: parseOptions(item.topping_groups).map((rawGroup) => {
        const group = record(rawGroup); return { id: optionalString(group.id),
          name: string(group.name), description: string(group.description),
          minSelect: number(group.min_select), maxSelect: number(group.max_select) || 1,
          isAvailable: group.is_available === true, displayOrder: number(group.display_order),
          toppings: parseOptions(group.toppings).map((rawTopping) => { const topping = record(rawTopping); return {
            id: optionalString(topping.id), name: string(topping.name), price: number(topping.price),
            isAvailable: topping.is_available === true, displayOrder: number(topping.display_order) }; })
        };
      }),
    }];
  }) : [];
  return { foods, categories, tags };
}
