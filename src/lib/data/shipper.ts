import type {
  ActiveDelivery,
  AdminShipperList,
  AdminShipperApplicationList,
  AvailableDelivery,
  DeliveryBatch,
  DeliveryHistoryItem,
  DeliveryOffer,
  DeliveryRouteStop,
  AdminShipperFinanceData,
  ShipperApplication,
  ShipperApplicationStatus,
  ShipperDashboardData,
  ShipperProfile,
  ShipperWalletData,
} from "@/types/shipper";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? value as UnknownRecord : {};
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const optionalText = (value: unknown) => typeof value === "string" && value ? value : undefined;
const number = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const optionalNumber = (value: unknown) => value == null ? undefined : number(value);

function parseApplication(value: unknown): ShipperApplication | null {
  const item = record(value);
  if (!text(item.id)) return null;
  return {
    id: text(item.id), userId: optionalText(item.user_id), email: optionalText(item.email),
    fullName: text(item.full_name), phone: text(item.phone),
    dateOfBirth: text(item.date_of_birth), identityNumber: text(item.identity_number),
    driverLicenseNumber: text(item.driver_license_number), vehicleType: text(item.vehicle_type),
    plateNumber: text(item.plate_number),
    status: text(item.status, "SUBMITTED") as ShipperApplicationStatus,
    revision: number(item.revision) || 1, reviewNote: optionalText(item.review_note),
    submittedAt: text(item.submitted_at), reviewStartedAt: optionalText(item.review_started_at),
    reviewedAt: optionalText(item.reviewed_at),
  };
}

function parseProfile(value: unknown): ShipperProfile | null {
  const item = record(value);
  if (!text(item.id)) return null;
  return {
    id: text(item.id), fullName: text(item.full_name), vehicleType: text(item.vehicle_type),
    plateNumber: text(item.plate_number), isActive: item.is_active === true,
    isOnline: item.is_online === true, lat: optionalNumber(item.lat), lon: optionalNumber(item.lon),
    lastLocationAt: optionalText(item.last_location_at), ratingAverage: number(item.rating_average),
    ratingCount: number(item.rating_count),
  };
}

function parseAvailable(value: unknown): AvailableDelivery[] {
  return Array.isArray(value) ? value.flatMap((raw) => {
    const item = record(raw); if (!text(item.order_id)) return [];
    return [{ orderId: text(item.order_id), code: text(item.code), orderStatus: text(item.order_status),
      restaurantName: text(item.restaurant_name), restaurantAddress: text(item.restaurant_address),
      pickupDistanceKm: optionalNumber(item.pickup_distance_km),
      deliveryDistanceKm: optionalNumber(item.delivery_distance_km), deliveryArea: text(item.delivery_area),
      earning: number(item.earning), createdAt: text(item.created_at), canBatch: item.can_batch === true }];
  }) : [];
}

function parseActiveItem(value: unknown): ActiveDelivery | null {
  const item = record(value); if (!text(item.order_id)) return null;
  const restaurant = record(item.restaurant); const customer = record(item.customer);
  const proof = record(item.proof);
  return {
    orderId: text(item.order_id), code: text(item.code), orderStatus: text(item.order_status),
    deliveryStatus: text(item.delivery_status) as ActiveDelivery["deliveryStatus"],
    pickupConfirmationRequestedAt: optionalText(item.pickup_confirmation_requested_at),
    pickupConfirmedAt: optionalText(item.pickup_confirmed_at),
    createdAt: text(item.created_at), earning: number(item.earning),
    restaurant: { name: text(restaurant.name), address: text(restaurant.address),
      phone: optionalText(restaurant.phone), lat: optionalNumber(restaurant.lat), lon: optionalNumber(restaurant.lon) },
    customer: { name: text(customer.name), phone: text(customer.phone), address: text(customer.address),
      note: optionalText(customer.note), lat: optionalNumber(customer.lat), lon: optionalNumber(customer.lon) },
    items: Array.isArray(item.items) ? item.items.map((raw) => { const row = record(raw); return {
      name: text(row.name), size: optionalText(row.size), quantity: number(row.quantity), note: optionalText(row.note),
    }; }) : [],
    proof: text(proof.object_path) ? { objectPath: text(proof.object_path),
      status: text(proof.status) as "submitted" | "confirmed" | "disputed",
      submittedAt: text(proof.submitted_at) } : undefined,
  };
}

function parseActive(value: unknown): ActiveDelivery[] {
  return Array.isArray(value) ? value.flatMap((item) => { const parsed = parseActiveItem(item); return parsed ? [parsed] : []; }) : [];
}

function parseOffers(value: unknown): DeliveryOffer[] {
  return Array.isArray(value) ? value.flatMap((raw) => { const item = record(raw);
    return text(item.offer_id) ? [{ offerId: text(item.offer_id), orderId: text(item.order_id), code: text(item.code),
      restaurantName: text(item.restaurant_name), restaurantAddress: text(item.restaurant_address),
      pickupDistanceKm: optionalNumber(item.pickup_distance_km), deliveryDistanceKm: optionalNumber(item.delivery_distance_km),
      deliveryArea: text(item.delivery_area), earning: number(item.earning), createdAt: text(item.created_at),
      score: number(item.score), expiresAt: text(item.expires_at) }] : [];
  }) : [];
}

function parseRoute(value: unknown): DeliveryRouteStop[] {
  return Array.isArray(value) ? value.flatMap((raw) => { const item = record(raw);
    return text(item.id) ? [{ id: text(item.id), orderId: text(item.order_id),
      stopType: text(item.stop_type) as DeliveryRouteStop["stopType"], sequence: number(item.sequence_no),
      label: text(item.label), address: text(item.address), lat: optionalNumber(item.lat), lon: optionalNumber(item.lon),
      status: text(item.status) as DeliveryRouteStop["status"] }] : [];
  }) : [];
}

function parseBatch(value: unknown): DeliveryBatch | null {
  const item = record(value); return text(item.id) ? { id: text(item.id), orderCount: number(item.order_count), maxOrders: 2 } : null;
}

function parseHistory(value: unknown): DeliveryHistoryItem[] {
  return Array.isArray(value) ? value.flatMap((raw) => { const item = record(raw);
    return text(item.order_id) ? [{ orderId: text(item.order_id), code: text(item.code),
      deliveryStatus: text(item.delivery_status) as DeliveryHistoryItem["deliveryStatus"],
      restaurantName: text(item.restaurant_name), earning: number(item.earning),
      completedAt: optionalText(item.completed_at) }] : [];
  }) : [];
}

export function parseShipperDashboard(value: unknown): ShipperDashboardData {
  const source = record(value);
  return { application: parseApplication(source.application), profile: parseProfile(source.profile),
    offers: parseOffers(source.offers), available: parseAvailable(source.available),
    activeDeliveries: parseActive(source.active_deliveries), route: parseRoute(source.route),
    batch: parseBatch(source.batch), history: parseHistory(source.history) };
}

export function parseAdminShipperApplications(value: unknown): AdminShipperApplicationList {
  const source = record(value);
  return { items: Array.isArray(source.items) ? source.items.flatMap((item) => {
      const parsed = parseApplication(item); return parsed ? [parsed] : [];
    }) : [], total: number(source.total), limit: number(source.limit) || 20, offset: number(source.offset) };
}

export const EMPTY_ADMIN_SHIPPERS: AdminShipperList = {
  items: [], total: 0, limit: 20, offset: 0,
};

export function parseAdminShippers(value: unknown): AdminShipperList {
  const source = record(value);
  return {
    items: Array.isArray(source.items) ? source.items.flatMap((raw) => {
      const item = record(raw);
      if (!text(item.id) || !text(item.user_id)) return [];
      return [{
        id: text(item.id),
        userId: text(item.user_id),
        fullName: text(item.full_name, "Tài xế EatNow"),
        email: text(item.email),
        phone: optionalText(item.phone),
        avatarUrl: optionalText(item.avatar_url),
        dateOfBirth: text(item.date_of_birth),
        vehicleType: text(item.vehicle_type),
        plateNumber: text(item.plate_number),
        isActive: item.is_active === true,
        isOnline: item.is_online === true,
        lastLocationAt: optionalText(item.last_location_at),
        ratingAverage: number(item.rating_average),
        ratingCount: number(item.rating_count),
        activeDeliveries: number(item.active_deliveries),
        completedDeliveries: number(item.completed_deliveries),
        createdAt: text(item.created_at),
      }];
    }) : [],
    total: number(source.total),
    limit: number(source.limit) || 20,
    offset: number(source.offset),
  };
}

export const EMPTY_SHIPPER_WALLET: ShipperWalletData = {
  balances: { pending: 0, earningAvailable: 0, held: 0, codLiability: 0,
    availableToWithdraw: 0, codDue: 0, lifetimeEarned: 0 },
  settings: { minimumWithdrawal: 100000, maximumWithdrawal: 20000000,
    earningHoldDays: 2, withdrawalStep: 1000 },
  bankAccount: null, entries: [], withdrawals: [],
};

export function parseShipperWallet(value: unknown): ShipperWalletData {
  const source = record(value); const balances = record(source.balances);
  const settings = record(source.settings); const bank = record(source.bank_account);
  return {
    balances: {
      pending: number(balances.pending), earningAvailable: number(balances.earning_available),
      held: number(balances.held), codLiability: number(balances.cod_liability),
      availableToWithdraw: number(balances.available_to_withdraw), codDue: number(balances.cod_due),
      lifetimeEarned: number(balances.lifetime_earned),
    },
    settings: {
      minimumWithdrawal: number(settings.minimum_withdrawal) || 100000,
      maximumWithdrawal: number(settings.maximum_withdrawal) || 20000000,
      earningHoldDays: number(settings.earning_hold_days), withdrawalStep: number(settings.withdrawal_step) || 1000,
    },
    bankAccount: text(bank.id) ? { id: text(bank.id), bankCode: text(bank.bank_code),
      bankName: text(bank.bank_name), accountHolder: text(bank.account_holder),
      maskedAccountNumber: text(bank.masked_account_number), isVerified: bank.is_verified === true,
      updatedAt: text(bank.updated_at) } : null,
    entries: Array.isArray(source.entries) ? source.entries.flatMap((raw) => { const item = record(raw);
      return text(item.id) ? [{ id: text(item.id), orderId: optionalText(item.order_id),
        entryType: text(item.entry_type), bucket: text(item.bucket) as ShipperWalletData["entries"][number]["bucket"],
        amount: number(item.amount), availableAt: text(item.available_at), description: text(item.description),
        createdAt: text(item.created_at) }] : [];
    }) : [],
    withdrawals: Array.isArray(source.withdrawals) ? source.withdrawals.flatMap((raw) => { const item = record(raw);
      return text(item.id) ? [{ id: text(item.id), amount: number(item.amount),
        status: text(item.status) as ShipperWalletData["withdrawals"][number]["status"],
        bankName: text(item.bank_name), maskedAccountNumber: text(item.masked_account_number),
        shipperNote: optionalText(item.shipper_note), reviewNote: optionalText(item.review_note),
        transferReference: optionalText(item.transfer_reference), requestedAt: text(item.requested_at),
        processedAt: optionalText(item.processed_at) }] : [];
    }) : [],
  };
}

export const EMPTY_ADMIN_SHIPPER_FINANCE: AdminShipperFinanceData = {
  withdrawals: [], withdrawalTotal: 0, codAccounts: [], limit: 50, offset: 0,
};

export function parseAdminShipperFinance(value: unknown): AdminShipperFinanceData {
  const source = record(value);
  return {
    withdrawals: Array.isArray(source.withdrawals) ? source.withdrawals.flatMap((raw) => { const item = record(raw);
      return text(item.id) ? [{ id: text(item.id), shipperId: text(item.shipper_id),
        shipperName: text(item.shipper_name), amount: number(item.amount),
        status: text(item.status) as AdminShipperFinanceData["withdrawals"][number]["status"],
        bankCode: text(item.bank_code), bankName: text(item.bank_name),
        accountHolder: text(item.account_holder), accountNumber: text(item.account_number),
        shipperNote: optionalText(item.shipper_note), reviewNote: optionalText(item.review_note),
        transferReference: optionalText(item.transfer_reference), requestedAt: text(item.requested_at),
        processedAt: optionalText(item.processed_at) }] : [];
    }) : [],
    withdrawalTotal: number(source.withdrawal_total),
    codAccounts: Array.isArray(source.cod_accounts) ? source.cod_accounts.flatMap((raw) => { const item = record(raw);
      return text(item.shipper_id) ? [{ shipperId: text(item.shipper_id), shipperName: text(item.shipper_name),
        plateNumber: text(item.plate_number), earningAvailable: number(item.earning_available),
        codLiability: number(item.cod_liability), codDue: number(item.cod_due),
        availableToWithdraw: number(item.available_to_withdraw) }] : [];
    }) : [],
    limit: number(source.limit) || 50, offset: number(source.offset),
  };
}
