"use server";

import type { SecurityPasswordFormValues } from "@/types/account";
import { createClient } from "@/utils/supabase/server";
import type {
  SecurityPasswordField,
  ValidationErrors,
} from "@/utils/validation";
import { validateSecurityPasswordValues } from "@/utils/validation";

export type SecurityPasswordActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  fieldErrors?: ValidationErrors<SecurityPasswordField>;
};

function formString(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function firstFieldError(fieldErrors: ValidationErrors<SecurityPasswordField>) {
  return Object.values(fieldErrors).find(Boolean) || "";
}

export async function changePasswordAction(
  _previousState: SecurityPasswordActionState,
  formData: FormData
): Promise<SecurityPasswordActionState> {
  const values: SecurityPasswordFormValues = {
    currentPassword: formString(formData, "currentPassword"),
    newPassword: formString(formData, "newPassword"),
    confirmNewPassword: formString(formData, "confirmNewPassword"),
  };
  const validation = validateSecurityPasswordValues(values);

  if (!validation.isValid) {
    return {
      status: "error",
      error: firstFieldError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  if (values.currentPassword === values.newPassword) {
    return {
      status: "error",
      error: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      fieldErrors: {
        newPassword: "Vui lòng chọn mật khẩu mới khác mật khẩu hiện tại.",
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: "error",
      error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  // Re-authenticate before changing a sensitive credential. This also prevents
  // an unattended authenticated browser from changing the account password.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: values.currentPassword,
  });

  if (signInError) {
    return {
      status: "error",
      error: "Mật khẩu hiện tại không chính xác.",
      fieldErrors: {
        currentPassword: "Mật khẩu hiện tại không chính xác.",
      },
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: values.newPassword,
  });

  if (updateError) {
    console.error("[account.security.change-password]", {
      status: updateError.status,
      code: updateError.code,
    });

    return {
      status: "error",
      error:
        updateError.status === 422
          ? "Mật khẩu mới chưa đáp ứng yêu cầu bảo mật hoặc đã được sử dụng."
          : updateError.status === 429
            ? "Bạn thao tác quá nhanh. Vui lòng đợi một lúc rồi thử lại."
            : "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại.",
    };
  }

  return {
    status: "success",
    message: "Đã cập nhật mật khẩu thành công.",
  };
}
