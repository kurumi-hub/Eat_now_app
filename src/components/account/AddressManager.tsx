"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/actions";
import type { AccountAddress } from "@/types/account";

type AddressManagerProps = {
  addresses: AccountAddress[];
};

const initialState: AddressActionState = { status: "idle" };

export default function AddressManager({ addresses }: AddressManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, isSubmitting] = useActionState(
    createAddressAction,
    initialState
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      setDialogOpen(false);
      router.refresh();
    }
  }, [state.status, router]);

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAddressAction(id);
      router.refresh();
    });
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      await setDefaultAddressAction(id);
      router.refresh();
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Thêm địa chỉ mới
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Alert severity="info">
          Bạn chưa có địa chỉ giao hàng nào. Thêm địa chỉ để đặt hàng nhanh
          hơn.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {addresses.map((address) => (
            <Box
              key={address.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <PlaceOutlinedIcon color="action" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {address.line1}
                  {address.isDefault && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      Mặc định
                    </Typography>
                  )}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleSetDefault(address.id)}
                disabled={isPending || address.isDefault}
                title="Đặt làm mặc định"
              >
                {address.isDefault ? (
                  <CheckCircleOutlinedIcon fontSize="small" color="primary" />
                ) : (
                  <RadioButtonUncheckedOutlinedIcon fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(address.id)}
                disabled={isPending}
                title="Xoá địa chỉ"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <form action={formAction}>
          <DialogTitle>Thêm địa chỉ giao hàng</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            {state.status === "error" && state.message && (
              <Alert severity="error">{state.message}</Alert>
            )}
            {state.status === "success" && (
              <Alert severity="success">{state.message}</Alert>
            )}

            <TextField
              name="label"
              label="Tên gợi nhớ (VD: Nhà, Công ty)"
              fullWidth
              size="small"
            />
            <TextField
              name="recipientName"
              label="Tên người nhận"
              fullWidth
              required
              size="small"
              error={Boolean(state.fieldErrors?.recipientName)}
              helperText={state.fieldErrors?.recipientName}
            />
            <TextField
              name="phone"
              label="Số điện thoại"
              fullWidth
              required
              size="small"
              error={Boolean(state.fieldErrors?.phone)}
              helperText={state.fieldErrors?.phone}
            />
            <TextField
              name="line1"
              label="Số nhà, tên đường"
              fullWidth
              required
              size="small"
              error={Boolean(state.fieldErrors?.line1)}
              helperText={state.fieldErrors?.line1}
            />
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                name="ward"
                label="Phường/Xã"
                fullWidth
                required
                size="small"
                error={Boolean(state.fieldErrors?.ward)}
                helperText={state.fieldErrors?.ward}
              />
              <TextField
                name="district"
                label="Quận/Huyện"
                fullWidth
                required
                size="small"
                error={Boolean(state.fieldErrors?.district)}
                helperText={state.fieldErrors?.district}
              />
            </Box>
            <TextField
              name="city"
              label="Tỉnh/Thành phố"
              fullWidth
              required
              size="small"
              error={Boolean(state.fieldErrors?.city)}
              helperText={state.fieldErrors?.city}
            />
            <TextField
              name="note"
              label="Ghi chú (không bắt buộc)"
              fullWidth
              size="small"
            />
            <FormControlLabel
              control={<Checkbox name="isDefault" />}
              label="Đặt làm địa chỉ mặc định"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={16} /> : undefined
              }
            >
              Lưu địa chỉ
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
