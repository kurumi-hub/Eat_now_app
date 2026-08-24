export const RESTAURANT_APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_CHANGES",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type RestaurantApplicationStatus =
  (typeof RESTAURANT_APPLICATION_STATUSES)[number];

export const RESTAURANT_APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type RestaurantApprovalStatus =
  (typeof RESTAURANT_APPROVAL_STATUSES)[number];

export const RESTAURANT_LIFECYCLE_STATUSES = [
  "SETUP",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;

export type RestaurantLifecycleStatus =
  (typeof RESTAURANT_LIFECYCLE_STATUSES)[number];

export const RESTAURANT_ORDER_STATES = [
  "UNAVAILABLE",
  "APPROVAL_PENDING",
  "REJECTED",
  "SETUP",
  "SUSPENDED",
  "CLOSED",
  "UNPUBLISHED",
  "PAUSED",
  "CLOSED_BY_SCHEDULE",
  "OPEN",
] as const;

export type RestaurantOrderState =
  (typeof RESTAURANT_ORDER_STATES)[number];

export const RESTAURANT_MEMBERSHIP_STATUSES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
] as const;

export type RestaurantMembershipStatus =
  (typeof RESTAURANT_MEMBERSHIP_STATUSES)[number];

export const RESTAURANT_PERMISSIONS = [
  "restaurant.view",
  "restaurant.profile.manage",
  "restaurant.hours.manage",
  "restaurant.orders.toggle",
  "restaurant.media.manage",
  "restaurant.menu.view",
  "restaurant.menu.manage",
  "restaurant.orders.manage",
  "restaurant.orders.reject",
  "restaurant.staff.manage",
  "restaurant.finance.view",
  "restaurant.ownership.transfer",
] as const;

export type RestaurantPermission =
  (typeof RESTAURANT_PERMISSIONS)[number];

export type RestaurantApplication = {
  id: string;
  status: RestaurantApplicationStatus;
  revision: number;
  restaurantId?: string;
  restaurantName: string;
  description?: string;
  address: string;
  phone: string;
  lat?: number;
  lon?: number;
  timezone: string;
  businessLicenseNumber?: string;
  taxCode?: string;
  legalRepresentativeName?: string;
  reviewNote?: string;
  submittedAt?: string;
  reviewStartedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantApplicationEvent = {
  id: string;
  fromStatus?: RestaurantApplicationStatus;
  toStatus: RestaurantApplicationStatus;
  revision: number;
  note?: string;
  createdAt: string;
};

export type ManagedRestaurantSummary = {
  id: string;
  slug: string;
  name: string;
  membershipRole: "RESTAURANT_OWNER" | "RESTAURANT_STAFF";
  permissions: RestaurantPermission[];
  approvalStatus: RestaurantApprovalStatus;
  lifecycleStatus: RestaurantLifecycleStatus;
  publishedAt?: string;
  acceptingOrders?: boolean;
  orderState: RestaurantOrderState;
};

export type SellerContext = {
  application: RestaurantApplication | null;
  timeline: RestaurantApplicationEvent[];
  restaurants: ManagedRestaurantSummary[];
};

export type StaffInvitation = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  invitedByName: string;
  email: string;
  expiresAt: string;
  createdAt: string;
};

export type RestaurantHour = {
  dayOfWeek: number;
  slotNo: number;
  opensAt: string;
  closesAt: string;
};

export type RestaurantMedia = {
  id: string;
  kind: "logo" | "cover" | "gallery";
  url: string;
  objectPath?: string;
  altText?: string;
  displayOrder: number;
};

export type RestaurantMember = {
  userId: string;
  name: string;
  phone?: string;
  role: "RESTAURANT_OWNER" | "RESTAURANT_STAFF";
  status: RestaurantMembershipStatus;
  joinedAt?: string;
};

export type PendingStaffInvitation = {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

export type OwnerRestaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  lat?: number;
  lon?: number;
  timezone: string;
  approvalStatus: RestaurantApprovalStatus;
  lifecycleStatus: RestaurantLifecycleStatus;
  publishedAt?: string;
  acceptingOrders: boolean;
  pausedReason?: string;
  pausedUntil?: string;
  orderState: RestaurantOrderState;
};

export type OwnerDashboardData = {
  restaurant: OwnerRestaurant;
  permissions: RestaurantPermission[];
  hours: RestaurantHour[];
  media: RestaurantMedia[];
  members: RestaurantMember[];
  invitations: PendingStaffInvitation[];
  orderStats: { today: number; open: number; completedToday: number };
};

export type OrderEventItem = {
  id: string;
  eventType: string;
  fromOrderStatus?: string;
  toOrderStatus?: string;
  fromDeliveryStatus?: string;
  toDeliveryStatus?: string;
  source: string;
  note?: string;
  createdAt: string;
};

export type OwnerOrderItem = {
  id: string;
  code: string;
  status: string;
  deliveryStatus: string;
  version: number;
  createdAt: string;
  responseDueAt?: string;
  preparationDueAt?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  note?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  payment: { method: string; status: string };
  shipper: { id: string; name: string; phone?: string; plateNumber?: string } | null;
  incidentStatus: string;
  incidentReason?: string;
  items: Array<{ name: string; size?: string; quantity: number; lineTotal: number; note?: string }>;
  events: OrderEventItem[];
};

export type OwnerOrderList = { items: OwnerOrderItem[]; total: number; limit: number; offset: number };

export type OwnerMenuCatalogItem = {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
};

export type OwnerFoodImage = {
  id: string;
  url: string;
  objectPath?: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type OwnerFoodSize = {
  id?: string;
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
};

export type OwnerTopping = {
  id?: string;
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
};

export type OwnerToppingGroup = {
  id?: string;
  name: string;
  description: string;
  minSelect: number;
  maxSelect: number;
  isAvailable: boolean;
  displayOrder: number;
  toppings: OwnerTopping[];
};

export type OwnerFood = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isPublic: boolean;
  isAvailable: boolean;
  displayOrder: number;
  updatedAt: string;
  category: (OwnerMenuCatalogItem & { isActive: boolean }) | null;
  tags: Array<OwnerMenuCatalogItem & { isActive: boolean }>;
  images: OwnerFoodImage[];
  sizes: OwnerFoodSize[];
  toppingGroups: OwnerToppingGroup[];
};

export type OwnerMenuData = {
  foods: OwnerFood[];
  categories: OwnerMenuCatalogItem[];
  tags: OwnerMenuCatalogItem[];
};

export type OwnerFoodInput = {
  id?: string;
  expectedUpdatedAt?: string;
  name: string;
  description: string;
  basePrice: number;
  isAvailable: boolean;
  categoryId: string;
  tagIds: string[];
  sizes: OwnerFoodSize[];
  toppingGroups: OwnerToppingGroup[];
};

export type OwnerFoodActionResult = OwnerActionResult & { foodId?: string };

export type OwnerActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
