"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
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

import { resetPassword } from "@/app/auth/actions";
import { validateResetPasswordValues } from "@/utils/validation";

import PasswordField from "./PasswordField";
import {
  centeredRecoveryActionsClassName,
  descriptionClassName,
  formSx,
  iconLinkClassName,
  recoveryFormClassName,
  recoveryNoteSx,
  titleClassName,
} from "./tailwindClasses";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

const initialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, null);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Record<keyof ResetPasswordValues, boolean>>({
    password: false,
    confirmPassword: false,
  });
  const [didSubmit, setDidSubmit] = useState(false);

  const validation = useMemo(() => validateResetPasswordValues(values), [values]);
  const isSubmitDisabled =
    pending || !values.password.trim() || !values.confirmPassword.trim();

  const getFieldError = (fieldName: keyof ResetPasswordValues) => {
    const localError =
      (touched[fieldName] || didSubmit) && validation.errors[fieldName]
        ? validation.errors[fieldName]
        : "";

    return state?.fieldErrors?.[fieldName] || localError || "";
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const fieldName = event.target.name as keyof ResetPasswordValues;

    setValues((current) => ({ ...current, [fieldName]: value }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as keyof ResetPasswordValues;

    setTouched((current) => ({
      ...current,
      [fieldName]: true,
    }));
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
      className={recoveryFormClassName}
      noValidate
      sx={formSx}
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h1" className={titleClassName}>
            Đặt lại mật khẩu
          </Typography>
          <Typography className={descriptionClassName}>
            Tạo mật khẩu mới sau khi bạn mở liên kết đặt lại mật khẩu từ email.
          </Typography>
        </Box>

        <Alert severity="info" sx={recoveryNoteSx}>
          Nếu liên kết đã hết hạn, hãy gửi lại yêu cầu quên mật khẩu để nhận liên kết mới.
        </Alert>
        {state?.status === "error" && state.error ? (
          <Alert severity="error">{state.error}</Alert>
        ) : null}

        <PasswordField
          label="Mật khẩu mới"
          name="password"
          value={values.password}
          onChange={handleTextChange}
          onBlur={handleBlur}
          errorMessage={getFieldError("password")}
          helperText="Mật khẩu cần có ít nhất 8 ký tự."
          autoComplete="new-password"
          placeholder="Nhập mật khẩu mới"
        />

        <PasswordField
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleTextChange}
          onBlur={handleBlur}
          errorMessage={getFieldError("confirmPassword")}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={pending ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {pending ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </Button>

        <Box className={centeredRecoveryActionsClassName}>
          <NextLink className={iconLinkClassName} href="/login">
            <ArrowBackRoundedIcon fontSize="small" />
            Quay lại đăng nhập
          </NextLink>
        </Box>
      </Stack>
    </Box>
  );
}
