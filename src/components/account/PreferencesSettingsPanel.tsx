"use client";

import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";

import {
  updatePreferencesAction,
  type PreferencesActionState,
} from "@/app/account/preferences/actions";
import type { AccountAppearance, AccountPreferences } from "@/types/account";
import {
  compactMutedClassName,
  compactStrongClassName,
  preferenceDisplayGridClassName,
  preferenceFieldClassName,
  preferenceSegmentClassName,
  preferenceToggleCardClassName,
  preferenceToggleIconClassName,
  preferencesGridClassName,
  profileFieldLabelClassName,
  settingsActionsRowClassName,
  settingsCardHeaderClassName,
  settingsCardIconClassName,
  settingsEyebrowClassName,
  settingsInputSx,
  settingsSectionCardClassName,
  settingsStackClassName,
  settingsTitleClassName,
} from "./tailwindClasses";

const initialActionState: PreferencesActionState = { status: "idle" };

const preferenceRows = [
  {
    key: "orderStatusNotifications",
    icon: NotificationsActiveOutlinedIcon,
    title: "Thông báo đơn hàng",
    description: "Nhận cập nhật khi đơn hàng đổi trạng thái.",
  },
  {
    key: "promotionalNotifications",
    icon: LocalOfferOutlinedIcon,
    title: "Ưu đãi và voucher",
    description: "Nhận mã giảm giá, flash sale và gợi ý món mới.",
  },
  {
    key: "ownerNotifications",
    icon: RestaurantMenuOutlinedIcon,
    title: "Thông báo người bán",
    description: "Nhận nhắc việc khi tài khoản có quyền quản lý nhà hàng.",
  },
] as const;

type FeedbackState = {
  severity: "success" | "error";
  message: string;
};

type PreferencesSettingsPanelProps = {
  initialPreferences: AccountPreferences;
};

export default function PreferencesSettingsPanel({
  initialPreferences,
}: PreferencesSettingsPanelProps) {
  const router = useRouter();
  const [actionState, setActionState] =
    useState<PreferencesActionState>(initialActionState);
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] =
    useState<AccountPreferences>(initialPreferences);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const isSaving = isPending;

  const handleNotificationChange =
    (key: (typeof preferenceRows)[number]["key"]) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setPreferences((current) => ({
        ...current,
        [key]: event.target.checked,
      }));
      setFeedback(null);
    };

  const handleAppearanceChange = (
    _event: MouseEvent<HTMLElement>,
    nextAppearance: AccountAppearance | null
  ) => {
    if (!nextAppearance) return;
    setPreferences((current) => ({
      ...current,
      appearance: nextAppearance,
    }));
    setFeedback(null);
  };

  const handleLanguageChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPreferences((current) => ({
      ...current,
      language: event.target.value as AccountPreferences["language"],
    }));
    setFeedback(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    startTransition(async () => {
      const result = await updatePreferencesAction(actionState, preferences);

      setActionState(result);

      if (result.status === "success") {
        if (result.preferences) {
          setPreferences(result.preferences);
        }

        setFeedback({
          severity: "success",
          message: result.message || "Đã lưu cài đặt tài khoản.",
        });
        router.refresh();
        return;
      }

      if (result.preferences) {
        setPreferences(result.preferences);
      }

      setFeedback({
        severity: "error",
        message:
          result.message ||
          "Không thể lưu cài đặt lúc này. Vui lòng thử lại sau.",
      });
    });
  };

  return (
    <form className={settingsStackClassName} onSubmit={handleSubmit}>
      {feedback ? (
        <Alert severity={feedback.severity}>{feedback.message}</Alert>
      ) : null}

      <section className={settingsSectionCardClassName}>
        <div className={settingsCardHeaderClassName}>
          <span className={settingsCardIconClassName} aria-hidden="true">
            <NotificationsActiveOutlinedIcon />
          </span>
          <div>
            <p className={settingsEyebrowClassName}>Thông báo</p>
            <Typography component="h2" variant="h3" className={settingsTitleClassName}>
              Cập nhật từ EatNow
            </Typography>
          </div>
        </div>

        <div className={preferencesGridClassName}>
          {preferenceRows.map((item) => {
            const Icon = item.icon;

            return (
              <article className={preferenceToggleCardClassName} key={item.key}>
                <span
                  className={preferenceToggleIconClassName}
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <div>
                  <strong className={compactStrongClassName}>{item.title}</strong>
                  <p className={`m-0 mt-1 ${compactMutedClassName}`}>
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={preferences[item.key]}
                  onChange={handleNotificationChange(item.key)}
                  disabled={isSaving}
                  slotProps={{ input: { "aria-label": item.title } }}
                />
              </article>
            );
          })}
        </div>
      </section>

      <section className={settingsSectionCardClassName}>
        <div className={settingsCardHeaderClassName}>
          <span className={settingsCardIconClassName} aria-hidden="true">
            <PaletteOutlinedIcon />
          </span>
          <div>
            <p className={settingsEyebrowClassName}>Giao diện</p>
            <Typography component="h2" variant="h3" className={settingsTitleClassName}>
              Hiển thị và ngôn ngữ
            </Typography>
          </div>
        </div>

        <div className={preferenceDisplayGridClassName}>
          <div className={preferenceFieldClassName}>
            <span className={profileFieldLabelClassName}>Chế độ màu</span>
            <ToggleButtonGroup
              exclusive
              className={preferenceSegmentClassName}
              value={preferences.appearance}
              onChange={handleAppearanceChange}
              aria-label="Chế độ màu"
              disabled={isSaving}
            >
              <ToggleButton value="light">Sáng</ToggleButton>
              <ToggleButton value="system">Theo máy</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <TextField
            select
            label="Ngôn ngữ"
            value={preferences.language}
            onChange={handleLanguageChange}
            disabled={isSaving}
            sx={settingsInputSx}
            slotProps={{
              input: {
                startAdornment: <LanguageOutlinedIcon color="action" />,
              },
            }}
          >
            <MenuItem value="Tiếng Việt">Tiếng Việt</MenuItem>
          </TextField>
        </div>
      </section>

      <div className={settingsActionsRowClassName}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving}
          startIcon={
            isSaving ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <SaveOutlinedIcon />
            )
          }
        >
          {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}
