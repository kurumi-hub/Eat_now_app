"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type {
  AuthActionState,
  RegisterFormValues,
  ResetPasswordFormValues,
} from "@/types/auth";
import {
  logSupabaseAuthError,
  mapSignupAuthError,
} from "@/utils/auth/errorMessages";
import { toPublicUser } from "@/utils/auth/publicUser";
import { getPostLoginRedirectPath } from "@/utils/auth/redirects";
import { createClient } from "@/utils/supabase/server";
import {
  normalizeEmail,
  validateEmail,
  validateForgotPasswordValues,
  validateLoginValues,
  validateRegisterValues,
  validateResetPasswordValues,
} from "@/utils/validation";

export type AuthState = AuthActionState | null;

const SIGNUP_OTP_REGEX = /^\d{8}$/;

function formString(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function formBoolean(formData: FormData, name: string) {
  const value = formData.get(name);

  return value === "on" || value === "true";
}

function firstFieldError(fieldErrors: Record<string, string | undefined>) {
  return Object.values(fieldErrors).find(Boolean) || "";
}

async function getRequestOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/$/,
    ""
  );

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.startsWith("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : "";
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values = {
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    remember: formBoolean(formData, "remember"),
  };
  const validation = validateLoginValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validation.normalized.email,
    password: values.password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      error: "Email hoặc mật khẩu không chính xác.",
    };
  }

  const user = toPublicUser(data.user);
  const redirectPath = getPostLoginRedirectPath(
    user.roles,
    formString(formData, "next")
  );

  redirect(redirectPath);
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values: RegisterFormValues = {
    fullName:
      formString(formData, "fullName") || formString(formData, "name"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
    termsAccepted: formBoolean(formData, "termsAccepted"),
  };
  const validation = validateRegisterValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.normalized.email,
    password: values.password,
    options: {
      data: {
        name: validation.normalized.fullName,
        full_name: validation.normalized.fullName,
        fullName: validation.normalized.fullName,
        phone: validation.normalized.phone,
        phone_number: validation.normalized.phone,
      },
      // Role and account status are backend-owned; Bao should confirm whether
      // they come from metadata, custom claims, or a profiles table.
    },
  });

  if (error) {
    logSupabaseAuthError("signup", error);

    return {
      status: "error",
      error: mapSignupAuthError(error),
    };
  }

  redirect(`/signup/verify?email=${encodeURIComponent(validation.normalized.email)}`);
}

export async function verifySignupOtp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formString(formData, "email"));
  const token = formString(formData, "token").replace(/\s/g, "");
  const emailError = validateEmail(email);
  const tokenError = SIGNUP_OTP_REGEX.test(token)
    ? ""
    : "Vui lòng nhập mã xác nhận gồm đúng 8 chữ số.";

  if (emailError || tokenError) {
    return {
      status: "error",
      error: emailError || tokenError,
      fieldErrors: {
        email: emailError,
        token: tokenError,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return {
      status: "error",
      error: "Mã xác nhận không đúng hoặc đã hết hạn.",
    };
  }

  redirect("/");
}

export async function resendSignupOtp(email: string): Promise<AuthState> {
  const normalizedEmail = normalizeEmail(email);
  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    return {
      status: "error",
      error: emailError,
      fieldErrors: { email: emailError },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
  });

  if (error) {
    return {
      status: "error",
      error: "Không thể gửi lại mã, thử lại sau ít phút.",
    };
  }

  return {
    status: "success",
    message: "Đã gửi lại mã xác nhận 8 số.",
  };
}

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values = { email: formString(formData, "email") };
  const validation = validateForgotPasswordValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const origin = await getRequestOrigin();

  if (!origin) {
    return {
      status: "error",
      error: "Chưa xác định được địa chỉ website để tạo liên kết đặt lại mật khẩu.",
    };
  }

  let callbackUrl: URL;

  try {
    callbackUrl = new URL("/auth/confirm", origin);
  } catch {
    return {
      status: "error",
      error: "Địa chỉ website dùng cho khôi phục mật khẩu chưa hợp lệ.",
    };
  }

  callbackUrl.searchParams.set("next", "/reset-password");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.normalized.email,
    { redirectTo: callbackUrl.toString() }
  );

  if (error) {
    logSupabaseAuthError("request-password-reset", error);

    if (error.status === 429) {
      return {
        status: "error",
        error: "Bạn yêu cầu quá nhanh. Vui lòng đợi một lúc rồi thử lại.",
      };
    }

    return {
      status: "error",
      error: "Chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.",
    };
  }

  // Keep the response generic so the form does not reveal registered emails.
  return {
    status: "success",
    message:
      "Nếu email tồn tại trong hệ thống, EatNow đã gửi liên kết đặt lại mật khẩu.",
  };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const values: ResetPasswordFormValues = {
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  };
  const validation = validateResetPasswordValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });

  if (error) {
    logSupabaseAuthError("update-password", error);

    return {
      status: "error",
      error:
        error.status === 422
          ? "Mật khẩu mới chưa đáp ứng yêu cầu bảo mật."
          : "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại.",
    };
  }

  await supabase.auth.signOut();
  redirect("/login?reset=success");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
