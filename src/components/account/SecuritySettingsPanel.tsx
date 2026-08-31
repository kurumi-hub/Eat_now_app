"use client";

import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { Alert, Button, Chip, LinearProgress, Typography } from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";

import PasswordField from "@/components/auth/PasswordField";
import type { SecurityPasswordFormValues } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import {
  validateSecurityPasswordValues,
  type SecurityPasswordField,
  type ValidationErrors,
} from "@/utils/validation";
import {
  compactMutedClassName,
  compactStrongClassName,
  securityActionsClassName,
  securityChecklistClassName,
  securityChecklistItemClassName,
  securityFormGridClassName,
  securitySessionCardClassName,
  securitySessionListClassName,
  securityStrengthCardClassName,
  securityStrengthHeadingClassName,
  securityStrengthMeterClassName,
  settingsCardHeaderClassName,
  settingsCardIconClassName,
  settingsEyebrowClassName,
  settingsInputSx,
  settingsSectionCardClassName,
  settingsSoftChipClassName,
  settingsStackClassName,
  settingsTitleClassName,
} from "./tailwindClasses";

type FeedbackState = {
  severity: "success" | "error";
  message: string;
};

type SecuritySettingsPanelProps = {
  user: PublicUser;
};

const initialValues: SecurityPasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

function getPasswordChecks(password: string) {
  return [
    { label: "Ít nhất 8 ký tự", done: password.length >= 8 },
    {
      label: "Có chữ hoa và chữ thường",
      done: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    { label: "Có chữ số", done: /\d/.test(password) },
    { label: "Có ký tự đặc biệt", done: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getStrengthLabel(score: number) {
  if (score >= 4) return "Mạnh";
  if (score >= 3) return "Ổn";
  if (score >= 2) return "Trung bình";
  return "Yếu";
}

export default function SecuritySettingsPanel({
  user,
}: SecuritySettingsPanelProps) {
  const [values, setValues] =
    useState<SecurityPasswordFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] =
    useState<ValidationErrors<SecurityPasswordField>>({});
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const passwordChecks = useMemo(
    () => getPasswordChecks(values.newPassword),
    [values.newPassword]
  );
  const strengthScore = passwordChecks.filter((item) => item.done).length;
  const strengthPercent = Math.max(
    8,
    (strengthScore / passwordChecks.length) * 100
  );

  const handleFieldChange = (field: SecurityPasswordField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setFeedback(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateSecurityPasswordValues(values);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFeedback({
        severity: "error",
        message:
          Object.values(validation.errors).find(Boolean) ||
          "Vui lòng kiểm tra lại mật khẩu.",
      });
      return;
    }

    setValues(initialValues);
    setFieldErrors({});
    setFeedback({
      severity: "success",
      message: "Đã kiểm tra dữ liệu đổi mật khẩu trên giao diện.",
    });
  };

  return (
    <div className={settingsStackClassName}>
      {feedback ? (
        <Alert
          severity={feedback.severity}
          iconMapping={{
            success: <CheckCircleOutlineOutlinedIcon fontSize="inherit" />,
          }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <section className={settingsSectionCardClassName}>
        <div className={settingsCardHeaderClassName}>
          <span className={settingsCardIconClassName} aria-hidden="true">
            <LockResetOutlinedIcon />
          </span>
          <div>
            <p className={settingsEyebrowClassName}>Mật khẩu</p>
            <Typography component="h2" variant="h3" className={settingsTitleClassName}>
              Đổi mật khẩu
            </Typography>
          </div>
        </div>

        <form className={securityFormGridClassName} onSubmit={handleSubmit} noValidate>
          <PasswordField
            fullWidth
            label="Mật khẩu hiện tại"
            name="currentPassword"
            value={values.currentPassword}
            errorMessage={fieldErrors.currentPassword}
            onChange={(event) =>
              handleFieldChange("currentPassword", event.target.value)
            }
            sx={settingsInputSx}
          />
          <PasswordField
            fullWidth
            label="Mật khẩu mới"
            name="newPassword"
            value={values.newPassword}
            errorMessage={fieldErrors.newPassword}
            onChange={(event) =>
              handleFieldChange("newPassword", event.target.value)
            }
            sx={settingsInputSx}
          />
          <PasswordField
            fullWidth
            label="Nhập lại mật khẩu mới"
            name="confirmNewPassword"
            value={values.confirmNewPassword}
            errorMessage={fieldErrors.confirmNewPassword}
            onChange={(event) =>
              handleFieldChange("confirmNewPassword", event.target.value)
            }
            sx={settingsInputSx}
          />

          <div className={securityStrengthCardClassName}>
            <div className={securityStrengthHeadingClassName}>
              <span>Độ mạnh mật khẩu</span>
              <strong>{getStrengthLabel(strengthScore)}</strong>
            </div>
            <LinearProgress
              className={securityStrengthMeterClassName}
              variant="determinate"
              value={strengthPercent}
            />
            <ul className={securityChecklistClassName}>
              {passwordChecks.map((item) => (
                <li
                  key={item.label}
                  className={securityChecklistItemClassName(item.done)}
                >
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={securityActionsClassName}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<ShieldOutlinedIcon />}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </section>

      <section className={settingsSectionCardClassName}>
        <div className={settingsCardHeaderClassName}>
          <span className={settingsCardIconClassName} aria-hidden="true">
            <DevicesOutlinedIcon />
          </span>
          <div>
            <p className={settingsEyebrowClassName}>Thiết bị</p>
            <Typography component="h2" variant="h3" className={settingsTitleClassName}>
              Phiên đăng nhập hiện tại
            </Typography>
          </div>
          <Chip className={settingsSoftChipClassName} label="Đang hoạt động" />
        </div>

        <div className={securitySessionListClassName}>
          <article className={securitySessionCardClassName}>
            <div>
              <strong className={compactStrongClassName}>Trình duyệt hiện tại</strong>
              <span className={compactMutedClassName}>{user.email}</span>
            </div>
            <span className={compactMutedClassName}>Việt Nam · Vừa truy cập</span>
          </article>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            startIcon={<LogoutOutlinedIcon />}
          >
            Đăng xuất khỏi thiết bị khác
          </Button>
        </div>
      </section>
    </div>
  );
}
