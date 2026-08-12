"use client";

import { Mail } from "lucide-react";
import NextLink from "next/link";
import { useActionState, useMemo, useState, type FormEvent } from "react";

import { login } from "@/app/auth/actions";
import { validateLoginValues } from "@/utils/validation";
import AlertBox from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Checkbox, FormControlLabel } from "@/components/ui/SelectionControls";
import { Spinner, Divider as UiDivider } from "@/components/ui/Primitives";
import SnackbarToast from "@/components/ui/Snackbar";

import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

type LoginFormProps = {
  initialEmail?: string;
  nextPath?: string;
};

export default function LoginForm({
  initialEmail = "",
  nextPath = "",
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, null);
  const [values, setValues] = useState({
    email: initialEmail,
    password: "",
    remember: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [didSubmit, setDidSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const validation = useMemo(() => validateLoginValues(values), [values]);
  const isSubmitDisabled =
    pending || !values.email.trim() || !values.password.trim();

  const getFieldError = (fieldName: "email" | "password") => {
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

  const handleRememberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, remember: event.target.checked }));
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

  const handleForgotPassword = () => {
    setSnackbar({
      open: true,
      message: "Tính năng quên mật khẩu đang được hoàn thiện.",
    });
  };

  const handleOAuthPlaceholder = () => {
    setSnackbar({
      open: true,
      message: "Đăng nhập mạng xã hội đang được hoàn thiện.",
    });
  };

  return (
    <>
      <form
        action={formAction}
        className="auth-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="next" value={nextPath} />
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="auth-title">Chào mừng bạn trở lại</h1>
            <p className="auth-description">
              Đăng nhập để tiếp tục khám phá món ngon quanh bạn.
            </p>
          </div>

          {state?.error ? <AlertBox severity="error">{state.error}</AlertBox> : null}

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
              placeholder="nhap@email.com"
              className="pl-10"
            />
          </div>

          <div>
            <div className="auth-field-row">
              <span className="auth-field-label">Mật khẩu</span>
              <button
                type="button"
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
                onClick={handleForgotPassword}
              >
                Quên mật khẩu?
              </button>
            </div>
            <PasswordField
              name="password"
              value={values.password}
              onChange={handleTextChange}
              onBlur={handleBlur}
              errorMessage={getFieldError("password")}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <FormControlLabel
            control={
              <Checkbox
                name="remember"
                checked={values.remember}
                onChange={handleRememberChange}
              />
            }
            label="Ghi nhớ đăng nhập"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitDisabled}
            startIcon={pending ? <Spinner size={18} /> : null}
          >
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="text-center text-sm">
            Chưa có tài khoản?{" "}
            <NextLink className="auth-text-link" href="/register">
              Đăng ký ngay
            </NextLink>
          </p>

          <div className="flex items-center gap-3">
            <UiDivider className="flex-1" />
            <span className="text-xs text-[var(--brand-text-soft)]">
              Hoặc đăng nhập với
            </span>
            <UiDivider className="flex-1" />
          </div>

          <OAuthButtons
            providers={["Google", "Apple"]}
            onPlaceholder={handleOAuthPlaceholder}
          />
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
