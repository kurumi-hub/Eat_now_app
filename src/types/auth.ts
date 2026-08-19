import type { SellerStatus } from "./account";

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "RESTAURANT_OWNER",
  "RESTAURANT_STAFF",
  "SHIPPER",
  "CUSTOMER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "SUSPENDED",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  sellerStatus?: SellerStatus;
};

export type CurrentUserAccess = {
  userId: string;
  roles: UserRole[];
  isActive: boolean;
  status: UserStatus;
};

export type AuthRequestStatus = "idle" | "submitting" | "success" | "error";

export type LoginFormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export type SignupOtpFormValues = {
  email: string;
  token: string;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type AuthActionState<TField extends string = string> = {
  status: AuthRequestStatus;
  error?: string;
  message?: string;
  fieldErrors?: Partial<Record<TField, string>>;
};

export type AuthResult<TData = unknown, TField extends string = string> =
  | {
      ok: true;
      data: TData;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      status?: number;
      fieldErrors?: Partial<Record<TField, string>>;
    };
