export const SELLER_STATUSES = [
  "NOT_APPLIED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const ACCOUNT_APPEARANCES = ["light", "dark", "system"] as const;

export type AccountAppearance = (typeof ACCOUNT_APPEARANCES)[number];

export type AccountPreferences = {
  orderStatusNotifications: boolean;
  promotionalNotifications: boolean;
  ownerNotifications: boolean;
  appearance: AccountAppearance;
  language: "Tiếng Việt";
};

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  avatarFile?: File | null;
};

export type ProfileUpdatePayload = {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  avatarFile?: File | null;
};

export type SecurityPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type AccountAddress = {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  note?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AddressFormValues = Omit<
  AccountAddress,
  "id" | "createdAt" | "updatedAt"
>;

export type SellerApplication = {
  status: SellerStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  restaurantId?: string;
};
