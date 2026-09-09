"use client";

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";

import PasswordField from "@/components/auth/PasswordField";

export default function SecuritySettings() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextPassword = String(form.get("newPassword") || "");
    const confirmation = String(form.get("confirmPassword") || "");
    setPasswordNotice("");

    if (nextPassword.length < 8) {
      setPasswordError("Mật khẩu mới cần có ít nhất 8 ký tự.");
      return;
    }
    if (nextPassword !== confirmation) {
      setPasswordError("Mật khẩu xác nhận chưa trùng khớp.");
      return;
    }

    setPasswordError("");
    setPasswordNotice("Biểu mẫu đã hợp lệ và sẵn sàng kết nối API đổi mật khẩu.");
    setPasswordDialogOpen(false);
  };

  return (
    <div className="settings-stack">
      <section className="settings-card" aria-labelledby="change-password-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><KeyOutlinedIcon /></span>
          <div><h2 id="change-password-title">Đặt lại mật khẩu</h2><p>Dùng mật khẩu mạnh và không trùng với mật khẩu ở dịch vụ khác.</p></div>
        </div>
        {passwordNotice ? <Alert severity="success" className="settings-section-notice">{passwordNotice}</Alert> : null}
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
        <form onSubmit={handlePasswordSubmit}>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogContent className="security-password-dialog">
            <p className="settings-dialog-copy">Nhập mật khẩu hiện tại trước khi tạo mật khẩu mới.</p>
            {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
            <PasswordField name="currentPassword" label="Mật khẩu hiện tại" autoComplete="current-password" required />
            <PasswordField name="newPassword" label="Mật khẩu mới" autoComplete="new-password" required helperText="Tối thiểu 8 ký tự" />
            <PasswordField name="confirmPassword" label="Xác nhận mật khẩu mới" autoComplete="new-password" required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setPasswordDialogOpen(false); setPasswordError(""); }}>Hủy</Button>
            <Button type="submit" variant="contained">Cập nhật mật khẩu</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
