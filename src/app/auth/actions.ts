"use server";

import { redirect } from "next/navigation";

import type { AuthActionState, RegisterFormValues } from "@/types/auth";
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
  validateRegisterValues,
} from "@/utils/validation";

export type AuthState = AuthActionState | null;

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
  const token = formString(formData, "token").trim();
  const emailError = validateEmail(email);

  if (emailError || !token) {
    return {
      status: "error",
      error: emailError || "Vui lòng nhập mã xác nhận.",
      fieldErrors: {
        email: emailError,
        token: token ? "" : "Vui lòng nhập mã xác nhận.",
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
