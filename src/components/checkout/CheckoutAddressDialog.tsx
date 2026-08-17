"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import {
  createAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/actions";
import GoogleAddressPicker, {
  type GoogleAddressSelection,
} from "@/components/account/GoogleAddressPicker";

type CheckoutAddressDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (addressId: string) => void;
};

const initialState: AddressActionState = { status: "idle" };

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutAddressDialog({
  open,
  onClose,
  onCreated,
}: CheckoutAddressDialogProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<GoogleAddressSelection | null>(
    null
  );
  const [requestId, setRequestId] = useState("");
  const [pickerVersion, setPickerVersion] = useState(0);
  const [state, formAction, isSubmitting] = useActionState(
    createAddressAction,
    initialState
  );

  useEffect(() => {
    if (!open) return;
    setSelection(null);
    setRequestId(createRequestId());
    setPickerVersion((current) => current + 1);
  }, [open]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !requestId ||
      state.requestId !== requestId
    ) {
      return;
    }

    if (state.addressId) onCreated(state.addressId);
    router.refresh();
    onClose();
  }, [onClose, onCreated, requestId, router, state]);

  const currentState = state.requestId === requestId ? state : initialState;

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
      <form action={formAction}>
        <DialogTitle>Thêm địa chỉ giao hàng</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Tìm địa chỉ hoặc kéo ghim đến đúng vị trí nhận hàng.
          </Typography>

          {currentState.status === "error" && currentState.message && (
            <Alert severity="error">{currentState.message}</Alert>
          )}

          <GoogleAddressPicker
            key={pickerVersion}
            onAddressSelect={setSelection}
          />

          {selection && (
            <Alert severity="success">
              Đã chọn: {selection.formattedAddress}
            </Alert>
          )}

          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="label" value="Khác" />
          <input
            type="hidden"
            name="formattedAddress"
            value={selection?.formattedAddress ?? ""}
          />
          <input
            type="hidden"
            name="googlePlaceId"
            value={selection?.placeId ?? ""}
          />
          <input type="hidden" name="lat" value={selection?.lat ?? ""} />
          <input type="hidden" name="lon" value={selection?.lon ?? ""} />
          <input
            type="hidden"
            name="line1"
            value={selection?.formattedAddress ?? ""}
          />
          <input type="hidden" name="ward" value={selection?.ward ?? ""} />
          <input
            type="hidden"
            name="district"
            value={selection?.district ?? ""}
          />
          <input type="hidden" name="city" value={selection?.city ?? ""} />

          <TextField
            name="addressDetail"
            label="Số nhà, tòa nhà, tầng, căn hộ"
            placeholder="Ví dụ: Căn 1205, tầng 12, tòa A"
            fullWidth
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              name="recipientName"
              label="Tên người nhận"
              required
              error={Boolean(currentState.fieldErrors?.recipientName)}
              helperText={currentState.fieldErrors?.recipientName}
            />
            <TextField
              name="phone"
              label="Số điện thoại"
              required
              inputMode="tel"
              error={Boolean(currentState.fieldErrors?.phone)}
              helperText={currentState.fieldErrors?.phone}
            />
          </Box>

          <TextField
            name="note"
            label="Ghi chú cho tài xế"
            placeholder="Ví dụ: Gọi khi đến, để đồ tại lễ tân"
            multiline
            minRows={2}
          />

          <FormControlLabel
            control={<Checkbox name="isDefault" />}
            label="Đặt làm địa chỉ mặc định"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selection || isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu và sử dụng địa chỉ"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
