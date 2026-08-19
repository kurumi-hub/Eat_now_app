"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useActionState, useMemo, useState, type FormEvent } from "react";

import { updatePassword } from "@/app/auth/actions";
import {
  validateResetPasswordValues,
  type ResetPasswordField,
} from "@/utils/validation";

import PasswordField from "./PasswordField";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, null);
  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [didSubmit, setDidSubmit] = useState(false);
  const validation = useMemo(
    () => validateResetPasswordValues(values),
    [values]
  );

  const getFieldError = (fieldName: ResetPasswordField) => {
    const localError =
      (touched[fieldName] || didSubmit) && validation.errors[fieldName]
        ? validation.errors[fieldName]
        : "";

    return state?.fieldErrors?.[fieldName] || localError || "";
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
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
            Tạo mật khẩu mới
          </Typography>
          <Typography className="auth-description">
            Sử dụng ít nhất 8 ký tự và tránh dùng lại mật khẩu cũ.
          </Typography>
        </Box>

        {state?.error ? <Alert severity="error">{state.error}</Alert> : null}

        <PasswordField
          label="Mật khẩu mới"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={getFieldError("password")}
          helperText="Mật khẩu cần có ít nhất 8 ký tự."
          autoComplete="new-password"
          autoFocus
          placeholder="Nhập mật khẩu mới"
        />

        <PasswordField
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={getFieldError("confirmPassword")}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={pending}
          startIcon={
            pending ? <CircularProgress color="inherit" size={18} /> : null
          }
        >
          {pending ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </Button>

        <NextLink className="auth-back-link" href="/login">
          <ArrowBackOutlinedIcon fontSize="small" />
          Quay lại đăng nhập
        </NextLink>
      </Stack>
    </Box>
  );
}
