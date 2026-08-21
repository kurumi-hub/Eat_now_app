"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import NextLink from "next/link";
import {
  useActionState,
  useEffect,
  useState,
  type FormEvent,
  type SyntheticEvent,
} from "react";

import { resendSignupOtp, verifySignupOtp } from "@/app/auth/actions";

import OtpCodeInput, { OTP_LENGTH } from "./OtpCodeInput";

type VerifyOtpFormProps = {
  email: string;
  nextPath?: string;
};

const OTP_REGEX = /^\d{8}$/;

export default function VerifyOtpForm({
  email,
  nextPath = "",
}: VerifyOtpFormProps) {
  const [state, formAction, pending] = useActionState(verifySignupOtp, null);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => "")
  );
  const [didSubmit, setDidSubmit] = useState(false);
  const [lastSubmittedToken, setLastSubmittedToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending">(
    "idle"
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const token = digits.join("");

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const localTokenError =
    didSubmit && !OTP_REGEX.test(token.trim())
      ? "Vui lòng nhập đủ mã xác nhận gồm 8 chữ số."
      : "";
  const serverTokenError =
    token === lastSubmittedToken ? state?.fieldErrors?.token : "";
  const tokenError = localTokenError || serverTokenError || "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setDidSubmit(true);
    setLastSubmittedToken(token);

    if (pending || !email || !OTP_REGEX.test(token.trim())) {
      event.preventDefault();
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || resendStatus === "sending") {
      return;
    }

    setResendStatus("sending");
    const result = await resendSignupOtp(email);
    setResendStatus("idle");
    if (!result?.error) {
      setResendCooldown(60);
    }
    setSnackbar({
      open: true,
      message:
        result?.error || result?.message || "Đã gửi lại mã xác nhận.",
      severity: result?.error ? "error" : "success",
    });
  };

  const handleSnackbarClose = (
    _event?: SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbar((current) => ({ ...current, open: false }));
  };

  return (
    <>
      <Box
        component="form"
        action={formAction}
        className="auth-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="next" value={nextPath} />
        <Stack spacing={2.5}>
          {state?.error ? <Alert severity="error">{state.error}</Alert> : null}

          <OtpCodeInput
            digits={digits}
            disabled={pending}
            error={tokenError}
            onChange={setDigits}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={pending || !email}
            startIcon={pending ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pending ? "Đang xác nhận..." : "Xác nhận"}
          </Button>

          <Box className="auth-otp-actions">
            <Button
              type="button"
              variant="text"
              disabled={
                !email || resendStatus === "sending" || resendCooldown > 0
              }
              onClick={handleResend}
            >
              {resendStatus === "sending"
                ? "Đang gửi lại..."
                : resendCooldown > 0
                  ? `Gửi lại sau ${resendCooldown}s`
                  : "Chưa nhận được mã? Gửi lại"}
            </Button>
            <NextLink className="auth-text-link" href="/register">
              Dùng email khác
            </NextLink>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
