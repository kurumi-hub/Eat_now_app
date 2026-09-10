"use client";

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState, useTransition } from "react";

import {
  changePasswordAction,
  type SecurityPasswordActionState,
} from "@/app/account/security/actions";
import PasswordField from "@/components/auth/PasswordField";

const initialPasswordState: SecurityPasswordActionState = { status: "idle" };

export default function SecuritySettings() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [passwordState, setPasswordState] = useState(initialPasswordState);
  const [passwordPending, startPasswordTransition] = useTransition();

  const passwordFormAction = (formData: FormData) => {
    startPasswordTransition(async () => {
      const result = await changePasswordAction(initialPasswordState, formData);
      setPasswordState(result);
      if (result.status === "success") setPasswordDialogOpen(false);
    });
  };

  return (
    <div className="settings-stack">
      <section className="settings-card" aria-labelledby="change-password-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><KeyOutlinedIcon /></span>
          <div><h2 id="change-password-title">Đặt lại mật khẩu</h2><p>Dùng mật khẩu mạnh và không trùng với mật khẩu ở dịch vụ khác.</p></div>
        </div>
        {passwordState.status === "success" && passwordState.message ? <Alert severity="success" className="settings-section-notice">{passwordState.message}</Alert> : null}
        <div className="settings-actions"><Button variant="contained" onClick={() => setPasswordDialogOpen(true)}>Đặt lại mật khẩu</Button></div>
      </section>

      <section className="settings-card settings-card--danger" aria-labelledby="delete-account-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon settings-card__icon--danger"><DeleteForeverOutlinedIcon /></span>
          <div><h2 id="delete-account-title">Xóa tài khoản</h2><p>Xóa hồ sơ và quyền truy cập EatNow. Thao tác này không thể hoàn tác.</p></div>
        </div>
        <div className="settings-actions"><Button color="error" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>Xóa tài khoản</Button></div>
      </section>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle className="settings-dialog-title"><WarningAmberRoundedIcon color="error" /> Xóa tài khoản?</DialogTitle>
        <DialogContent>
          <p className="settings-dialog-copy">Dữ liệu tài khoản sẽ không thể khôi phục. Nhập <strong>XÓA</strong> để xác nhận.</p>
          <TextField autoFocus label="Nhập XÓA" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button color="error" variant="contained" disabled={deleteConfirmation.trim().toUpperCase() !== "XÓA"}>Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="sm">
        <form action={passwordFormAction}>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogContent className="security-password-dialog">
            <p className="settings-dialog-copy">Nhập mật khẩu hiện tại trước khi tạo mật khẩu mới.</p>
            {passwordState.status === "error" && passwordState.error ? <Alert severity="error">{passwordState.error}</Alert> : null}
            <PasswordField name="currentPassword" label="Mật khẩu hiện tại" autoComplete="current-password" required disabled={passwordPending} errorMessage={passwordState.fieldErrors?.currentPassword} />
            <PasswordField name="newPassword" label="Mật khẩu mới" autoComplete="new-password" required disabled={passwordPending} helperText="Tối thiểu 8 ký tự" errorMessage={passwordState.fieldErrors?.newPassword} />
            <PasswordField name="confirmNewPassword" label="Xác nhận mật khẩu mới" autoComplete="new-password" required disabled={passwordPending} errorMessage={passwordState.fieldErrors?.confirmNewPassword} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)} disabled={passwordPending}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={passwordPending}>{passwordPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
