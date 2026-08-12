"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
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

import { signup } from "@/app/auth/actions";
import { validateRegisterValues, type RegisterField } from "@/utils/validation";

import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

type SnackbarState = {
  open: boolean;
  message: string;
};

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
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

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
        className="auth-form auth-form--register"
        noValidate
        onSubmit={handleSubmit}
      >
        <Stack spacing={2}>
          <Box>
            <Typography component="h1" className="auth-title">
              Tạo tài khoản EatNow
            </Typography>
            <Typography className="auth-description">
              Đăng ký để đặt món và theo dõi đơn hàng dễ dàng hơn.
            </Typography>
          </Box>

          <OAuthButtons
            providers={["Google", "Facebook"]}
            onPlaceholder={handleOAuthPlaceholder}
          />

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Hoặc đăng ký bằng email
            </Typography>
          </Divider>

          {state?.error ? <Alert severity="error">{state.error}</Alert> : null}

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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

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

          <FormControl error={Boolean(getFieldError("termsAccepted"))}>
            <FormControlLabel
              control={
                <Checkbox
                  name="termsAccepted"
                  checked={values.termsAccepted}
                  onChange={handleTermsChange}
                />
              }
              label={
                <Typography variant="body2">
                  Tôi đồng ý với{" "}
                  <span className="auth-inline-link">Điều khoản Dịch vụ</span>{" "}
                  và{" "}
                  <span className="auth-inline-link">Chính sách Bảo mật</span>{" "}
                  của EatNow.
                </Typography>
              }
            />
            {getFieldError("termsAccepted") ? (
              <FormHelperText>{getFieldError("termsAccepted")}</FormHelperText>
            ) : null}
          </FormControl>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={pending}
            startIcon={pending ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <NextLink className="auth-text-link" href="/login">
              Đăng nhập
            </NextLink>
          </Typography>
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
