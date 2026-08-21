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
  validateLoginValues,
  validatePasswordResetRequestValues,
  validateRegisterValues,
  validateResetPasswordValues,
} from "@/utils/validation";

export type AuthState = AuthActionState | null;

const SIGNUP_OTP_REGEX = /^\d{6}$/;
const SIGNUP_OTP_EMPTY_ERROR = "Vui lòng nhập mã xác nhận.";
const SIGNUP_OTP_FORMAT_ERROR = "Vui lòng nhập mã xác nhận gồm 6 chữ số.";
const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Nếu email tồn tại trong hệ thống, EatNow đã gửi hướng dẫn đặt lại mật khẩu.";

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

async function getSiteOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "localhost:3000";
  const protocol =
    headerStore.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

async function getAuthConfirmRedirectUrl(nextPath: string) {
  const url = new URL("/auth/confirm", await getSiteOrigin());
  url.searchParams.set("next", nextPath);

  return url.toString();
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

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validation = validatePasswordResetRequestValues({
    email: formString(formData, "email"),
  });

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.normalized.email,
    {
      redirectTo: await getAuthConfirmRedirectUrl("/reset-password"),
    }
  );

  if (error) {
    logSupabaseAuthError("requestPasswordReset", error);

    return {
      status: "error",
      error: "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau ít phút.",
    };
  }

  return {
    status: "success",
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
  };
}

export async function resetPassword(
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
  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });

  if (error) {
    logSupabaseAuthError("resetPassword", error);

    return {
      status: "error",
      error:
        "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng mở lại liên kết trong email hoặc gửi yêu cầu mới.",
    };
  }

  redirect("/login?reset=success");
}

export async function verifySignupOtp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formString(formData, "email"));
  const token = formString(formData, "token").trim();
  const emailError = validateEmail(email);
  const tokenError = !token
    ? SIGNUP_OTP_EMPTY_ERROR
    : SIGNUP_OTP_REGEX.test(token)
      ? ""
      : SIGNUP_OTP_FORMAT_ERROR;

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
    message: "Đã gửi lại mã xác nhận.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
