"use client";

import { Mail, Phone, User } from "lucide-react";
import NextLink from "next/link";
import { useActionState, useMemo, useState, type FormEvent } from "react";

import { signup } from "@/app/auth/actions";
import { validateRegisterValues, type RegisterField } from "@/utils/validation";
import AlertBox from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Checkbox, FormControlLabel } from "@/components/ui/SelectionControls";
import { Spinner, Divider as UiDivider } from "@/components/ui/Primitives";
import SnackbarToast from "@/components/ui/Snackbar";

import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(signup, null);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [didSubmit, setDidSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const validation = useMemo(() => validateRegisterValues(values), [values]);

  const getFieldError = (fieldName: RegisterField) => {
    const localError =
      (touched[fieldName] || didSubmit) && validation.errors[fieldName]
        ? validation.errors[fieldName]
        : "";

    return state?.fieldErrors?.[fieldName] || localError || "";
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({
      ...current,
      termsAccepted: event.target.checked,
    }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setDidSubmit(true);

    if (pending || !validation.isValid) {
      event.preventDefault();
    }
  };

  const handleOAuthPlaceholder = () => {
    setSnackbar({
      open: true,
      message: "Đăng ký mạng xã hội đang được hoàn thiện.",
    });
  };

  return (
    <>
      <form
        action={formAction}
        className="auth-form auth-form--register"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="auth-title">Tạo tài khoản EatNow</h1>
            <p className="auth-description">
              Đăng ký để đặt món và theo dõi đơn hàng dễ dàng hơn.
            </p>
          </div>

          <OAuthButtons
            providers={["Google", "Facebook"]}
            onPlaceholder={handleOAuthPlaceholder}
          />

          <div className="flex items-center gap-3">
            <UiDivider className="flex-1" />
            <span className="text-xs text-[var(--brand-text-soft)]">
              Hoặc đăng ký bằng email
            </span>
            <UiDivider className="flex-1" />
          </div>

          {state?.error ? <AlertBox severity="error">{state.error}</AlertBox> : null}

          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]" />
            <TextField
              label="Họ và tên"
              name="fullName"
              value={values.fullName}
              onChange={handleTextChange}
              onBlur={handleBlur}
              error={Boolean(getFieldError("fullName"))}
              helperText={getFieldError("fullName")}
              autoComplete="name"
              placeholder="Nhập họ và tên"
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]" />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleTextChange}
              onBlur={handleBlur}
              error={Boolean(getFieldError("email"))}
              helperText={getFieldError("email")}
              autoComplete="email"
              placeholder="Nhập địa chỉ email"
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]" />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={values.phone}
              onChange={handleTextChange}
              onBlur={handleBlur}
              error={Boolean(getFieldError("phone"))}
              helperText={getFieldError("phone")}
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              className="pl-10"
            />
          </div>

          <PasswordField
            label="Mật khẩu"
            name="password"
            value={values.password}
            onChange={handleTextChange}
            onBlur={handleBlur}
            errorMessage={getFieldError("password")}
            helperText="Mật khẩu cần có ít nhất 8 ký tự."
            autoComplete="new-password"
            placeholder="Nhập mật khẩu"
          />

          <PasswordField
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleTextChange}
            onBlur={handleBlur}
            errorMessage={getFieldError("confirmPassword")}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
          />

          <div>
            <FormControlLabel
              control={
                <Checkbox
                  name="termsAccepted"
                  checked={values.termsAccepted}
                  onChange={handleTermsChange}
                />
              }
              label={
                <span className="text-sm">
                  Tôi đồng ý với{" "}
                  <span className="auth-inline-link">Điều khoản Dịch vụ</span>{" "}
                  và{" "}
                  <span className="auth-inline-link">Chính sách Bảo mật</span>{" "}
                  của EatNow.
                </span>
              }
            />
            {getFieldError("termsAccepted") ? (
              <p className="mt-1 text-xs text-[var(--brand-error)]">
                {getFieldError("termsAccepted")}
              </p>
            ) : null}
          </div>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={pending}
            startIcon={pending ? <Spinner size={18} /> : null}
          >
            {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>

          <p className="text-center text-sm">
            Đã có tài khoản?{" "}
            <NextLink className="auth-text-link" href="/login">
              Đăng nhập
            </NextLink>
          </p>
        </div>
      </form>

      <SnackbarToast
        open={snackbar.open}
        message={snackbar.message}
        severity="info"
        autoHideDuration={2600}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </>
  );
}
