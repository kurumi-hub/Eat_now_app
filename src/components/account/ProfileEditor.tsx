"use client";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  updateProfileAction,
  type ProfileActionState,
} from "@/app/account/profile/actions";
import type { ProfileFormValues } from "@/types/account";
import type { PublicUser, UserStatus } from "@/types/auth";
import { formatRole, getUserRoles } from "@/utils/roles";
import type { ProfileField, ValidationErrors } from "@/utils/validation";
import { validateProfileValues } from "@/utils/validation";
import {
  hiddenInputClassName,
  profileActionsFooterClassName,
  profileAvatarActionsClassName,
  profileAvatarButtonsClassName,
  profileAvatarPreviewClassName,
  profileAvatarSectionClassName,
  profileCardClassName,
  profileFeedbackClassName,
  profileFieldClassName,
  profileFieldLabelClassName,
  profileFieldSx,
  profileFormGridClassName,
  profileInfoSectionClassName,
  profileReadonlyValueClassName,
  profileSectionTitleClassName,
  profileStatusDotClassName,
} from "./tailwindClasses";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp";
const initialActionState: ProfileActionState = { status: "idle" };

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  PENDING_VERIFICATION: "Chờ xác minh",
  SUSPENDED: "Tạm khóa",
};

function getInitials(fullName = "EatNow") {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getInitialValues(user: PublicUser): ProfileFormValues {
  return {
    fullName: user.fullName,
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
    avatarFile: null,
  };
}

function formatDate(value: string) {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không thể đọc ảnh."));
    reader.readAsDataURL(file);
  });
}

type FeedbackState = {
  severity: "success" | "error";
  message: string;
};

type ProfileEditorProps = {
  user: PublicUser;
};

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [actionState, setActionState] =
    useState<ProfileActionState>(initialActionState);
  const [isTransitionPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<ProfileFormValues>(() =>
    getInitialValues(user)
  );
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<ProfileField>>(
    {}
  );
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isSaving = isTransitionPending;
  const roles = useMemo(() => getUserRoles(user).map(formatRole), [user]);
  const avatarSource = values.avatarUrl || user.avatarUrl || "";
  const displayUser = actionState.user || user;

  const handleEdit = () => {
    setIsEditing(true);
    setFeedback(null);
    setFieldErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValues(getInitialValues(displayUser));
    setFieldErrors({});
    setFeedback(null);
    setIsDeleteDialogOpen(false);
  };

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name as ProfileField]: "",
    }));
  };

  const handleAvatarClick = () => {
    if (!isEditing || isSaving) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!AVATAR_ACCEPT.split(",").includes(file.type)) {
      setFeedback({
        severity: "error",
        message: "Ảnh đại diện cần là JPG, PNG hoặc WebP.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setFeedback({
        severity: "error",
        message: "Ảnh đại diện không được vượt quá 2MB.",
      });
      event.target.value = "";
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);

      setValues((currentValues) => ({
        ...currentValues,
        avatarUrl: previewUrl,
        avatarFile: file,
      }));
      setFeedback(null);
    } catch {
      setFeedback({
        severity: "error",
        message: "Không thể đọc ảnh đại diện. Vui lòng chọn ảnh khác.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteAvatar = () => {
    setValues((currentValues) => ({
      ...currentValues,
      avatarUrl: "",
      avatarFile: null,
    }));
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const validation = validateProfileValues(values);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFeedback({
        severity: "error",
        message: Object.values(validation.errors).find(Boolean) || "",
      });
      return;
    }

    const formData = new FormData();
    formData.set("fullName", validation.normalized.fullName);
    formData.set("phone", validation.normalized.phone);
    formData.set(
      "avatarUrl",
      values.avatarUrl?.startsWith("data:")
        ? user.avatarUrl || ""
        : values.avatarUrl || ""
    );

    startTransition(async () => {
      const result = await updateProfileAction(actionState, formData);

      setActionState(result);

      if (result.status === "success") {
        setIsEditing(false);
        setFieldErrors({});
        setFeedback({
          severity: "success",
          message: result.message || "Cập nhật hồ sơ thành công.",
        });

        if (result.user) {
          setValues((currentValues) => ({
            ...getInitialValues(result.user as PublicUser),
            avatarUrl: currentValues.avatarUrl || result.user?.avatarUrl || "",
          }));
        }

        router.refresh();
        return;
      }

      setFieldErrors(result.fieldErrors || {});
      setFeedback({
        severity: "error",
        message:
          result.error ||
          "Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại sau.",
      });
    });
  };

  return (
    <form className={profileCardClassName} onSubmit={handleSubmit} noValidate>
      {feedback ? (
        <Alert
          className={profileFeedbackClassName}
          severity={feedback.severity}
          iconMapping={{
            success: <CheckCircleOutlineOutlinedIcon fontSize="inherit" />,
          }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <section className={profileAvatarSectionClassName} aria-labelledby="avatar-title">
        <Typography
          id="avatar-title"
          variant="h2"
          component="h2"
          className={profileSectionTitleClassName}
        >
          Ảnh đại diện
        </Typography>

        <div className={profileAvatarActionsClassName}>
          <Avatar className={profileAvatarPreviewClassName} src={avatarSource}>
            {getInitials(values.fullName || user.fullName)}
          </Avatar>

          <div className={profileAvatarButtonsClassName}>
            <input
              ref={fileInputRef}
              className={hiddenInputClassName}
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              aria-label="Chọn ảnh đại diện"
            />
            <Button
              variant="contained"
              startIcon={<CameraAltOutlinedIcon />}
              onClick={handleAvatarClick}
              disabled={!isEditing || isSaving}
            >
              Thay đổi ảnh
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!isEditing || isSaving || !avatarSource}
              aria-label="Xóa ảnh đại diện"
            >
              Xóa ảnh
            </Button>
          </div>
        </div>
      </section>

      <section className={profileInfoSectionClassName} aria-label="Thông tin hồ sơ">
        <div className={profileFormGridClassName}>
          <div className={profileFieldClassName}>
            <label
              className={profileFieldLabelClassName}
              htmlFor="profile-fullName"
            >
              Họ và tên
            </label>
            {isEditing ? (
              <TextField
                id="profile-fullName"
                name="fullName"
                value={values.fullName}
                onChange={handleFieldChange}
                error={Boolean(fieldErrors.fullName)}
                helperText={fieldErrors.fullName || ""}
                autoComplete="name"
                disabled={isSaving}
                sx={profileFieldSx}
                slotProps={{ htmlInput: { "aria-label": "Họ và tên" } }}
              />
            ) : (
              <div className={profileReadonlyValueClassName}>
                {displayUser.fullName}
              </div>
            )}
          </div>

          <ReadonlyField label="Email" value={displayUser.email} />

          <div className={profileFieldClassName}>
            <label
              className={profileFieldLabelClassName}
              htmlFor="profile-phone"
            >
              Số điện thoại
            </label>
            {isEditing ? (
              <TextField
                id="profile-phone"
                name="phone"
                value={values.phone}
                onChange={handleFieldChange}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone || ""}
                autoComplete="tel"
                disabled={isSaving}
                sx={profileFieldSx}
                slotProps={{ htmlInput: { "aria-label": "Số điện thoại" } }}
              />
            ) : (
              <div className={profileReadonlyValueClassName}>
                {displayUser.phone || "Chưa cập nhật"}
              </div>
            )}
          </div>

          <ReadonlyField label="Vai trò" value={roles.join(", ")} />

          <ReadonlyField
            label="Trạng thái"
            value={statusLabels[displayUser.status]}
            leading={<span className={profileStatusDotClassName} aria-hidden="true" />}
          />

          <ReadonlyField
            label="Ngày tham gia"
            value={formatDate(displayUser.createdAt)}
            leading={<CalendarMonthOutlinedIcon />}
          />
        </div>

        <div className={profileActionsFooterClassName}>
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                startIcon={<CloseOutlinedIcon />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isSaving ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <SaveOutlinedIcon />
                  )
                }
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={handleEdit}
            >
              Chỉnh sửa hồ sơ
            </Button>
          )}
        </div>
      </section>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        aria-labelledby="delete-avatar-title"
      >
        <DialogTitle id="delete-avatar-title">Xóa ảnh đại diện?</DialogTitle>
        <DialogContent>
          Ảnh đại diện sẽ được gỡ khỏi phần xem trước hồ sơ của bạn.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteAvatar}
          >
            Xóa ảnh
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}

type ReadonlyFieldProps = {
  label: string;
  value: string;
  leading?: ReactNode;
};

function ReadonlyField({ label, value, leading }: ReadonlyFieldProps) {
  return (
    <div className={profileFieldClassName}>
      <span className={profileFieldLabelClassName}>{label}</span>
      <div className={profileReadonlyValueClassName}>
        {leading}
        <span>{value}</span>
      </div>
    </div>
  );
}
