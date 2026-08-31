"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import {
  useActionState,
  useMemo,
  useState,
  type FormEvent,
  type SyntheticEvent,
} from "react";

import { login } from "@/app/auth/actions";
import { validateLoginValues } from "@/utils/validation";

import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";
import {
  descriptionClassName,
  fieldLabelClassName,
  fieldRowClassName,
  formClassName,
  formSx,
  textLinkClassName,
  titleClassName,
} from "./tailwindClasses";

type LoginFormProps = {
  initialEmail?: string;
  nextPath?: string;
  passwordResetSuccess?: boolean;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

export default function LoginForm({
  initialEmail = "",
  nextPath = "",
  passwordResetSuccess = false,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, null);
  const [values, setValues] = useState({
    email: initialEmail,
    password: "",
    remember: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [didSubmit, setDidSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

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

  const handleOAuthPlaceholder = () => {
    setSnackbar({
      open: true,
      message: "Đăng nhập mạng xã hội đang được hoàn thiện.",
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
        <input type="hidden" name="next" value={nextPath} />
        <Stack spacing={2.5}>
          <Box>
            <Typography component="h1" className={titleClassName}>
              Chào mừng bạn trở lại
            </Typography>
            <Typography className={descriptionClassName}>
              Đăng nhập để tiếp tục khám phá món ngon quanh bạn.
            </Typography>
          </Box>

          {state?.error ? <Alert severity="error">{state.error}</Alert> : null}
          {passwordResetSuccess ? (
            <Alert severity="success">
              Mật khẩu đã được đặt lại. Vui lòng đăng nhập bằng mật khẩu mới.
            </Alert>
          ) : null}

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

          <Box>
            <Box className={fieldRowClassName}>
              <Typography component="span" className={fieldLabelClassName}>
                Mật khẩu
              </Typography>
              <NextLink className={textLinkClassName} href="/forgot-password">
                Quên mật khẩu?
              </NextLink>
            </Box>
            <PasswordField
              label=""
              name="password"
              value={values.password}
              onChange={handleTextChange}
              onBlur={handleBlur}
              errorMessage={getFieldError("password")}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
            />
          </Box>

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
            startIcon={pending ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Chưa có tài khoản?{" "}
            <NextLink className={textLinkClassName} href="/register">
              Đăng ký ngay
            </NextLink>
          </Typography>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Hoặc đăng nhập với
            </Typography>
          </Divider>

          <OAuthButtons
            providers={["Google", "Apple"]}
            onPlaceholder={handleOAuthPlaceholder}
          />
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
