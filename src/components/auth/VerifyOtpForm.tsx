"use client";

import { MailCheck } from "lucide-react";
import NextLink from "next/link";
import { useActionState, useState, type FormEvent } from "react";

import { resendSignupOtp, verifySignupOtp } from "@/app/auth/actions";
import AlertBox from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Primitives";
import SnackbarToast from "@/components/ui/Snackbar";

type VerifyOtpFormProps = {
  email: string;
};

const OTP_REGEX = /^\d{6}$/;

export default function VerifyOtpForm({ email }: VerifyOtpFormProps) {
  const [state, formAction, pending] = useActionState(verifySignupOtp, null);
  const [token, setToken] = useState("");
  const [didSubmit, setDidSubmit] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending">(
    "idle"
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const localTokenError =
    didSubmit && !OTP_REGEX.test(token.trim())
      ? "Vui lòng nhập mã xác nhận gồm 6 chữ số."
      : "";
  const tokenError = state?.fieldErrors?.token || localTokenError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setDidSubmit(true);

    if (pending || !email || !OTP_REGEX.test(token.trim())) {
      event.preventDefault();
    }
  };

  const handleResend = async () => {
    setResendStatus("sending");
    const result = await resendSignupOtp(email);
    setResendStatus("idle");
    setSnackbar({
      open: true,
      message:
        result?.error || result?.message || "Đã gửi lại mã xác nhận.",
      severity: result?.error ? "error" : "success",
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
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-5">
          {state?.error ? <AlertBox severity="error">{state.error}</AlertBox> : null}

          <div className="relative">
            <MailCheck className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-[var(--brand-text-soft)]" />
            <TextField
              label="Mã xác nhận"
              name="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              error={Boolean(tokenError)}
              helperText={tokenError || "Nhập mã 6 chữ số trong email của bạn."}
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]*"
              className="pl-10"
            />
          </div>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={pending || !email}
            startIcon={pending ? <Spinner size={18} /> : null}
          >
            {pending ? "Đang xác nhận..." : "Xác nhận"}
          </Button>

          <div className="auth-otp-actions">
            <Button
              type="button"
              variant="text"
              disabled={!email || resendStatus === "sending"}
              onClick={handleResend}
            >
              {resendStatus === "sending"
                ? "Đang gửi lại..."
                : "Chưa nhận được mã? Gửi lại"}
            </Button>
            <NextLink className="auth-text-link" href="/register">
              Dùng email khác
            </NextLink>
          </div>
        </div>
      </form>

      <SnackbarToast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        autoHideDuration={2600}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </>
  );
}
