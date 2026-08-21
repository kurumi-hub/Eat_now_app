"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useActionState, useMemo, useState, type FormEvent } from "react";

import { requestPasswordReset } from "@/app/auth/actions";
import { validatePasswordResetRequestValues } from "@/utils/validation";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    null
  );
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);

  const validation = useMemo(
    () => validatePasswordResetRequestValues({ email }),
    [email]
  );
  const emailError =
    state?.fieldErrors?.email ||
    ((touched || didSubmit) && validation.errors.email
      ? validation.errors.email
      : "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setDidSubmit(true);

    if (pending || !validation.isValid) {
      event.preventDefault();
    }
  };

  return (
    <Box
      component="form"
      action={formAction}
      className="auth-form auth-form--recovery"
      noValidate
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h1" className="auth-title">
            Quên mật khẩu?
          </Typography>
          <Typography className="auth-description">
            Nhập email đã đăng ký, EatNow sẽ gửi liên kết để bạn tạo mật khẩu mới.
          </Typography>
        </Box>

        {state?.status === "error" && state.error ? (
          <Alert severity="error">{state.error}</Alert>
        ) : null}
        {state?.status === "success" ? (
          <Alert
            severity="success"
            icon={<MarkEmailReadOutlinedIcon fontSize="inherit" />}
          >
            {state.message}
          </Alert>
        ) : null}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched(true)}
          error={Boolean(emailError)}
          helperText={
            emailError || "Dùng email bạn đã đăng ký tài khoản EatNow."
          }
          autoComplete="email"
          placeholder="nhap@email.com"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={pending || !email.trim()}
          startIcon={pending ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {pending ? "Đang gửi liên kết..." : "Gửi liên kết đặt lại"}
        </Button>

        <Box className="auth-recovery-actions">
          <NextLink className="auth-text-link auth-icon-link" href="/login">
            <ArrowBackRoundedIcon fontSize="small" />
            Quay lại đăng nhập
          </NextLink>
          <NextLink className="auth-text-link" href="/reset-password">
            Tôi đã có liên kết reset
          </NextLink>
        </Box>
      </Stack>
    </Box>
  );
}
