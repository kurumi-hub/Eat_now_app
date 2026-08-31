"use client";

import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import NextLink from "next/link";
import {
  useActionState,
  useState,
  type FormEvent,
  type SyntheticEvent,
} from "react";

import { resendSignupOtp, verifySignupOtp } from "@/app/auth/actions";

import {
  formClassName,
  formSx,
  otpActionsClassName,
  textLinkClassName,
} from "./tailwindClasses";

type VerifyOtpFormProps = {
  email: string;
};

const OTP_REGEX = /^\d{8}$/;

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
      ? "Vui lòng nhập mã xác nhận gồm 8 chữ số."
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
        className={formClassName}
        noValidate
        sx={formSx}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="email" value={email} />
        <Stack spacing={2.5}>
          {state?.error ? <Alert severity="error">{state.error}</Alert> : null}

          <TextField
            label="Mã xác nhận"
            name="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            error={Boolean(tokenError)}
            helperText={tokenError || "Nhập mã 8 chữ số trong email của bạn."}
            autoComplete="one-time-code"
            inputMode="numeric"
            placeholder="00000000"
            slotProps={{
              htmlInput: {
                maxLength: 8,
                pattern: "[0-9]*",
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MarkEmailReadOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
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

          <Box className={otpActionsClassName}>
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
            <NextLink className={textLinkClassName} href="/register">
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
