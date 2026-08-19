"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
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
import { validateForgotPasswordValues } from "@/utils/validation";

type ForgotPasswordFormProps = {
  initialEmail?: string;
  initialError?: string;
};

export default function ForgotPasswordForm({
  initialEmail = "",
  initialError = "",
}: ForgotPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    null
  );
  const [email, setEmail] = useState(initialEmail);
  const [didSubmit, setDidSubmit] = useState(false);
  const validation = useMemo(
    () => validateForgotPasswordValues({ email }),
    [email]
  );
  const emailError =
    state?.fieldErrors?.email ||
    (didSubmit ? validation.errors.email : "") ||
    "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setDidSubmit(true);

    if (pending || !validation.isValid) {
      event.preventDefault();
    }
  };

  if (state?.status === "success") {
    return (
      <Stack spacing={3} className="auth-result-panel">
        <Box className="auth-status-icon auth-status-icon--success">
          <MarkEmailReadOutlinedIcon />
        </Box>
        <Box className="auth-header auth-header--centered">
          <Typography component="h1" className="auth-title">
            Kiểm tra email của bạn
          </Typography>
          <Typography className="auth-description">
            {state.message}
          </Typography>
        </Box>
        <Alert severity="info">
          Liên kết có thời hạn. Nếu chưa thấy email, hãy kiểm tra thư mục spam.
        </Alert>
        <NextLink className="auth-button-link" href="/login">
          Quay lại đăng nhập
        </NextLink>
      </Stack>
    );
  }

  return (
    <Box
      component="form"
      action={formAction}
      className="auth-form"
      noValidate
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.5}>
        <Box className="auth-header">
          <Typography component="h1" className="auth-title">
            Quên mật khẩu?
          </Typography>
          <Typography className="auth-description">
            Nhập email đã đăng ký. EatNow sẽ gửi liên kết để bạn tạo mật khẩu
            mới.
          </Typography>
        </Box>

        {initialError ? (
          <Alert severity="warning">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
            cầu liên kết mới.
          </Alert>
        ) : null}
        {state?.error ? <Alert severity="error">{state.error}</Alert> : null}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(emailError)}
          helperText={emailError || "Email dùng để đăng nhập EatNow."}
          autoComplete="email"
          autoFocus
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
          startIcon={
            pending ? <CircularProgress color="inherit" size={18} /> : null
          }
        >
          {pending ? "Đang gửi liên kết..." : "Gửi liên kết đặt lại"}
        </Button>

        <NextLink className="auth-back-link" href="/login">
          <ArrowBackOutlinedIcon fontSize="small" />
          Quay lại đăng nhập
        </NextLink>
      </Stack>
    </Box>
  );
}
