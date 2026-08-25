export type ShipperApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_CHANGES"
  | "APPROVED"
  | "REJECTED";

export type DeliveryStatus =
  | "unassigned"
  | "searching"
  | "assigned"
  | "arrived_at_restaurant"
  | "picked_up"
  | "delivering"
  | "awaiting_customer_confirmation"
  | "proof_submitted"
  | "delivered"
  | "disputed"
  | "delivery_review"
  | "cancelled"
  | "failed";

export type ShipperApplication = {
  id: string;
  userId?: string;
  email?: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  identityNumber: string;
  driverLicenseNumber: string;
  vehicleType: string;
  plateNumber: string;
  status: ShipperApplicationStatus;
  revision: number;
  reviewNote?: string;
  submittedAt: string;
  reviewStartedAt?: string;
  reviewedAt?: string;
};

export type ShipperProfile = {
  id: string;
  fullName: string;
  vehicleType: string;
  plateNumber: string;
  isActive: boolean;
  isOnline: boolean;
  lat?: number;
  lon?: number;
  lastLocationAt?: string;
  ratingAverage: number;
  ratingCount: number;
};

export type AvailableDelivery = {
  orderId: string;
  code: string;
  orderStatus: string;
  restaurantName: string;
  restaurantAddress: string;
  pickupDistanceKm?: number;
  deliveryDistanceKm?: number;
  deliveryArea: string;
  earning: number;
  createdAt: string;
  canBatch: boolean;
};

export type DeliveryOffer = Omit<AvailableDelivery, "orderStatus" | "canBatch"> & {
  offerId: string;
  score: number;
  expiresAt: string;
};

export type ActiveDelivery = {
  orderId: string;
  code: string;
  orderStatus: string;
  deliveryStatus: DeliveryStatus;
  pickupConfirmationRequestedAt?: string;
  pickupConfirmedAt?: string;
  createdAt: string;
  earning: number;
  restaurant: { name: string; address: string; phone?: string; lat?: number; lon?: number };
  customer: { name: string; phone: string; address: string; note?: string; lat?: number; lon?: number };
  items: Array<{ name: string; size?: string; quantity: number; note?: string }>;
  proof?: { objectPath: string; status: "submitted" | "confirmed" | "disputed"; submittedAt: string };
};

export type DeliveryRouteStop = {
  id: string;
  orderId: string;
  stopType: "pickup" | "dropoff";
  sequence: number;
  label: string;
  address: string;
  lat?: number;
  lon?: number;
  status: "pending" | "completed" | "skipped";
};

export type DeliveryBatch = { id: string; orderCount: number; maxOrders: 2 };

export type DeliveryHistoryItem = {
  orderId: string;
  code: string;
  deliveryStatus: DeliveryStatus;
  restaurantName: string;
  earning: number;
  completedAt?: string;
};

export type ShipperDashboardData = {
  application: ShipperApplication | null;
  profile: ShipperProfile | null;
  offers: DeliveryOffer[];
  available: AvailableDelivery[];
  activeDeliveries: ActiveDelivery[];
  route: DeliveryRouteStop[];
  batch: DeliveryBatch | null;
  history: DeliveryHistoryItem[];
};

export type ShipperApplicationInput = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  identityNumber: string;
  driverLicenseNumber: string;
  vehicleType: string;
  plateNumber: string;
};

export type ShipperActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type AdminShipperApplicationList = {
  items: ShipperApplication[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminShipper = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth: string;
  vehicleType: string;
  plateNumber: string;
  isActive: boolean;
  isOnline: boolean;
  lastLocationAt?: string;
  ratingAverage: number;
  ratingCount: number;
  activeDeliveries: number;
  completedDeliveries: number;
  createdAt: string;
};

export type AdminShipperList = {
  items: AdminShipper[];
  total: number;
  limit: number;
  offset: number;
};

export type ShipperWalletBalances = {
  pending: number;
  earningAvailable: number;
  held: number;
  codLiability: number;
  availableToWithdraw: number;
  codDue: number;
  lifetimeEarned: number;
};

export type ShipperWalletSettings = {
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  earningHoldDays: number;
  withdrawalStep: number;
};

export type ShipperBankAccount = {
  id: string;
  bankCode: string;
  bankName: string;
  accountHolder: string;
  maskedAccountNumber: string;
  isVerified: boolean;
  updatedAt: string;
};

export type ShipperLedgerEntry = {
  id: string;
  orderId?: string;
  entryType: string;
  bucket: "earning" | "held" | "cod_liability";
  amount: number;
  availableAt: string;
  description: string;
  createdAt: string;
};

export type ShipperWithdrawal = {
  id: string;
  amount: number;
  status: "requested" | "approved" | "paid" | "rejected" | "cancelled" | "failed";
  bankName: string;
  maskedAccountNumber: string;
  shipperNote?: string;
  reviewNote?: string;
  transferReference?: string;
  requestedAt: string;
  processedAt?: string;
};

export type ShipperWalletData = {
  balances: ShipperWalletBalances;
  settings: ShipperWalletSettings;
  bankAccount: ShipperBankAccount | null;
  entries: ShipperLedgerEntry[];
  withdrawals: ShipperWithdrawal[];
};

export type AdminShipperWithdrawal = {
  id: string;
  shipperId: string;
  shipperName: string;
  amount: number;
  status: ShipperWithdrawal["status"];
  bankCode: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  shipperNote?: string;
  reviewNote?: string;
  transferReference?: string;
  requestedAt: string;
  processedAt?: string;
};

export type AdminShipperCodAccount = {
  shipperId: string;
  shipperName: string;
  plateNumber: string;
  earningAvailable: number;
  codLiability: number;
  codDue: number;
  availableToWithdraw: number;
};

export type AdminShipperFinanceData = {
  withdrawals: AdminShipperWithdrawal[];
  withdrawalTotal: number;
  codAccounts: AdminShipperCodAccount[];
  limit: number;
  offset: number;
};
