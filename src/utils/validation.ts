import type {
  AddressFormValues,
  ProfileFormValues,
  SecurityPasswordFormValues,
} from "../types/account";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from "../types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VIETNAMESE_MOBILE_REGEX = /^0(?:3|5|7|8|9)\d{8}$/;
const DEFAULT_PASSWORD_MIN_LENGTH = 8;

export type ValidationErrors<TField extends string> = Partial<
  Record<TField, string>
>;

export type ValidationResult<TField extends string, TNormalized> = {
  isValid: boolean;
  errors: ValidationErrors<TField>;
  normalized: TNormalized;
};

export type LoginField = "email" | "password";
export type ForgotPasswordField = "email";
export type ResetPasswordField = "password" | "confirmPassword";
export type RegisterField =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "termsAccepted";
export type ProfileField = "fullName" | "phone";
export type SecurityPasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword";
export type AddressField =
  | "recipientName"
  | "phone"
  | "line1"
  | "ward"
  | "district"
  | "city";

export function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return "Vui lòng nhập email.";
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return "Email không đúng định dạng.";
  }

  return "";
}

export function normalizeVietnamesePhone(phone: string) {
  const compactPhone = phone.trim().replace(/[\s().-]/g, "");

  if (compactPhone.startsWith("+84")) {
    return `0${compactPhone.slice(3)}`;
  }

  if (compactPhone.startsWith("84") && compactPhone.length === 11) {
    return `0${compactPhone.slice(2)}`;
  }

  return compactPhone;
}

export function validateVietnamesePhone(phone: string) {
  const normalizedPhone = normalizeVietnamesePhone(phone);

  if (!normalizedPhone) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (!VIETNAMESE_MOBILE_REGEX.test(normalizedPhone)) {
    return "Số điện thoại Việt Nam chưa đúng định dạng.";
  }

  return "";
}

export function validateFullName(fullName: string) {
  return normalizeWhitespace(fullName)
    ? ""
    : "Vui lòng nhập họ và tên.";
}

export function validatePasswordMinLength(
  password: string,
  minLength = DEFAULT_PASSWORD_MIN_LENGTH
) {
  if (!password) {
    return "Vui lòng nhập mật khẩu.";
  }

  if (password.length < minLength) {
    return `Mật khẩu cần có ít nhất ${minLength} ký tự.`;
  }

  return "";
}

export function validateConfirmPassword(
  confirmPassword: string,
  password: string
) {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu.";
  }

  if (confirmPassword !== password) {
    return "Mật khẩu xác nhận chưa khớp.";
  }

  return "";
}

export function hasValidationErrors(
  errors: Record<string, string | undefined>
) {
  return Object.values(errors).some(Boolean);
}

export function validateLoginValues(
  values: LoginFormValues
): ValidationResult<LoginField, { email: string }> {
  const errors: ValidationErrors<LoginField> = {
    email: validateEmail(values.email),
    password: values.password ? "" : "Vui lòng nhập mật khẩu.",
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized: {
      email: normalizeEmail(values.email),
    },
  };
}

export function validateForgotPasswordValues(
  values: ForgotPasswordFormValues
): ValidationResult<ForgotPasswordField, { email: string }> {
  const errors: ValidationErrors<ForgotPasswordField> = {
    email: validateEmail(values.email),
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized: { email: normalizeEmail(values.email) },
  };
}

export function validateResetPasswordValues(
  values: ResetPasswordFormValues
): ValidationResult<ResetPasswordField, Record<string, never>> {
  const errors: ValidationErrors<ResetPasswordField> = {
    password: validatePasswordMinLength(values.password),
    confirmPassword: validateConfirmPassword(
      values.confirmPassword,
      values.password
    ),
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized: {},
  };
}

export function validateRegisterValues(
  values: RegisterFormValues
): ValidationResult<
  RegisterField,
  { fullName: string; email: string; phone: string }
> {
  const normalized = {
    fullName: normalizeWhitespace(values.fullName),
    email: normalizeEmail(values.email),
    phone: normalizeVietnamesePhone(values.phone),
  };
  const errors: ValidationErrors<RegisterField> = {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    phone: validateVietnamesePhone(values.phone),
    password: validatePasswordMinLength(values.password),
    confirmPassword: validateConfirmPassword(
      values.confirmPassword,
      values.password
    ),
    termsAccepted: values.termsAccepted
      ? ""
      : "Bạn cần đồng ý với điều khoản.",
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized,
  };
}

export function validateProfileValues(
  values: ProfileFormValues
): ValidationResult<ProfileField, ProfileFormValues> {
  const normalized = {
    ...values,
    fullName: normalizeWhitespace(values.fullName),
    phone: normalizeVietnamesePhone(values.phone),
  };
  const errors: ValidationErrors<ProfileField> = {
    fullName: validateFullName(values.fullName),
    phone: validateVietnamesePhone(values.phone),
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized,
  };
}

export function validateSecurityPasswordValues(
  values: SecurityPasswordFormValues
): ValidationResult<SecurityPasswordField, Record<string, never>> {
  const errors: ValidationErrors<SecurityPasswordField> = {
    currentPassword: values.currentPassword
      ? ""
      : "Vui lòng nhập mật khẩu hiện tại.",
    newPassword: validatePasswordMinLength(values.newPassword),
    confirmNewPassword: validateConfirmPassword(
      values.confirmNewPassword,
      values.newPassword
    ),
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized: {},
  };
}

export function validateAddressValues(
  values: AddressFormValues
): ValidationResult<AddressField, AddressFormValues> {
  const normalized = {
    ...values,
    recipientName: normalizeWhitespace(values.recipientName),
    phone: normalizeVietnamesePhone(values.phone),
    line1: normalizeWhitespace(values.line1),
    ward: normalizeWhitespace(values.ward),
    district: normalizeWhitespace(values.district),
    city: normalizeWhitespace(values.city),
    note: values.note ? normalizeWhitespace(values.note) : "",
  };
  const errors: ValidationErrors<AddressField> = {
    recipientName: normalized.recipientName
      ? ""
      : "Vui lòng nhập tên người nhận.",
    phone: validateVietnamesePhone(values.phone),
    line1: normalized.line1 ? "" : "Vui lòng nhập địa chỉ.",
    // Google có thể không trả đủ cấp hành chính cho mọi địa chỉ tại Việt Nam.
    // Tọa độ + formattedAddress mới là dữ liệu bắt buộc để giao hàng.
    ward: "",
    district: "",
    city: "",
  };

  return {
    isValid: !hasValidationErrors(errors),
    errors,
    normalized,
  };
}
