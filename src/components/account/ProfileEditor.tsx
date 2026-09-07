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
  createAvatarUploadTicketAction,
  discardAvatarUploadAction,
  updateAvatarAction,
  updateProfileAction,
  type ProfileActionState,
} from "@/app/account/profile/actions";
import type { ProfileFormValues } from "@/types/account";
import type { PublicUser, UserStatus } from "@/types/auth";
import { formatRole, getUserRoles } from "@/utils/roles";
import { createClient } from "@/utils/supabase/client";
import type { ProfileField, ValidationErrors } from "@/utils/validation";
import { validateProfileValues } from "@/utils/validation";

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

function storageUploadError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Không có chi tiết từ Supabase.";
  }
  const value = error as Record<string, unknown>;
  const message = typeof value.message === "string" && value.message.trim()
    ? value.message.trim()
    : "Lỗi không xác định từ Supabase.";
  const code = [value.statusCode, value.status, value.code]
    .find((item) => typeof item === "string" || typeof item === "number");
  return `${message}${code ? ` (mã ${String(code)})` : ""}`;
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
  const [isAvatarTransitionPending, startAvatarTransition] = useTransition();
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
  const isAvatarSaving = isAvatarTransitionPending;
  const roles = useMemo(() => getUserRoles(user).map(formatRole), [user]);
  const displayUser = actionState.user || user;
  const [avatarSource, setAvatarSource] = useState(user.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
    if (isAvatarSaving) {
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

      setAvatarSource(previewUrl);
      setAvatarFile(file);
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

  const handleSaveAvatar = () => {
    if (!avatarFile || isAvatarSaving) return;

    startAvatarTransition(async () => {
      const ticket = await createAvatarUploadTicketAction(avatarFile.type);
      if (!ticket.ok) {
        setFeedback({ severity: "error", message: ticket.message });
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .uploadToSignedUrl(
          ticket.objectPath,
          ticket.token,
          avatarFile,
          {
            cacheControl: "3600",
            contentType: avatarFile.type,
            upsert: false,
          }
        );

      if (uploadError) {
        await discardAvatarUploadAction(ticket.objectPath);
        setFeedback({
          severity: "error",
          message: `Đã tạo vé upload nhưng không thể gửi file lên Storage. Chi tiết: ${storageUploadError(uploadError)}`,
        });
        return;
      }

      const formData = new FormData();
      formData.set("avatarObjectPath", ticket.objectPath);
      const result = await updateAvatarAction(formData);

      if (result.status !== "success") {
        await discardAvatarUploadAction(ticket.objectPath);
        setFeedback({
          severity: "error",
          message: result.error || "Không thể cập nhật ảnh đại diện.",
        });
        return;
      }

      setActionState(result);
      setAvatarFile(null);
      setAvatarSource(result.user?.avatarUrl || "");
      setFeedback({
        severity: "success",
        message: result.message || "Đã cập nhật ảnh đại diện.",
      });
      router.refresh();
    });
  };

  const handleDeleteAvatar = () => {
    if (isAvatarSaving) return;

    startAvatarTransition(async () => {
      const formData = new FormData();
      formData.set("removeAvatar", "true");
      const result = await updateAvatarAction(formData);
      setIsDeleteDialogOpen(false);

      if (result.status !== "success") {
        setFeedback({
          severity: "error",
          message: result.error || "Không thể xóa ảnh đại diện.",
        });
        return;
      }

      setActionState(result);
      setAvatarFile(null);
      setAvatarSource("");
      setFeedback({
        severity: "success",
        message: result.message || "Đã xóa ảnh đại diện.",
      });
      router.refresh();
    });
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

        if (result.user) setValues(getInitialValues(result.user));
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
    <form className="profile-design-card" onSubmit={handleSubmit} noValidate>
      {feedback ? (
        <Alert
          className="profile-feedback"
          severity={feedback.severity}
          iconMapping={{
            success: <CheckCircleOutlineOutlinedIcon fontSize="inherit" />,
          }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <section className="profile-avatar-section" aria-labelledby="avatar-title">
        <Typography id="avatar-title" variant="h2" component="h2">
          Ảnh đại diện
        </Typography>

        <div className="profile-avatar-actions">
          <Avatar className="profile-avatar-preview" src={avatarSource}>
            {getInitials(values.fullName || user.fullName)}
          </Avatar>

          <div className="profile-avatar-buttons">
            <input
              ref={fileInputRef}
              className="account-avatar-input"
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              aria-label="Chọn ảnh đại diện"
            />
            <Button
              variant="contained"
              startIcon={<CameraAltOutlinedIcon />}
              onClick={handleAvatarClick}
              disabled={isAvatarSaving}
            >
              Chọn ảnh
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                isAvatarSaving ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <SaveOutlinedIcon />
                )
              }
              onClick={handleSaveAvatar}
              disabled={!avatarFile || isAvatarSaving}
            >
              {isAvatarSaving ? "Đang lưu..." : "Lưu ảnh"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isAvatarSaving || !displayUser.avatarUrl}
              aria-label="Xóa ảnh đại diện"
            >
              Xóa ảnh
            </Button>
          </div>
        </div>
      </section>

      <section className="profile-info-section" aria-label="Thông tin hồ sơ">
        <div className="profile-form-grid">
          <div className="profile-edit-field">
            <label className="profile-field-label" htmlFor="profile-fullName">
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
                slotProps={{ htmlInput: { "aria-label": "Họ và tên" } }}
              />
            ) : (
              <div className="profile-readonly-value">{displayUser.fullName}</div>
            )}
          </div>

          <ReadonlyField label="Email" value={displayUser.email} />

          <div className="profile-edit-field">
            <label className="profile-field-label" htmlFor="profile-phone">
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
                slotProps={{ htmlInput: { "aria-label": "Số điện thoại" } }}
              />
            ) : (
              <div className="profile-readonly-value">
                {displayUser.phone || "Chưa cập nhật"}
              </div>
            )}
          </div>

          <ReadonlyField label="Vai trò" value={roles.join(", ")} />

          <ReadonlyField
            label="Trạng thái"
            value={statusLabels[displayUser.status]}
            leading={<span className="profile-status-dot" aria-hidden="true" />}
          />

          <ReadonlyField
            label="Ngày tham gia"
            value={formatDate(displayUser.createdAt)}
            leading={<CalendarMonthOutlinedIcon />}
          />
        </div>

        <div className="profile-actions-footer">
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
          Ảnh đại diện sẽ được xóa ngay khỏi hồ sơ và Storage.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isAvatarSaving}
          >
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteAvatar}
            disabled={isAvatarSaving}
          >
            {isAvatarSaving ? "Đang xóa..." : "Xóa ảnh"}
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
    <div className="profile-readonly-field">
      <span className="profile-field-label">{label}</span>
      <div className="profile-readonly-value">
        {leading}
        <span>{value}</span>
      </div>
    </div>
  );
}
