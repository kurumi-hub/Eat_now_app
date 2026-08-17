"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/actions";
import GoogleAddressPicker, {
  type GoogleAddressSelection,
} from "@/components/account/GoogleAddressPicker";
import type { AccountAddress } from "@/types/account";

type AddressManagerProps = {
  addresses: AccountAddress[];
};

type EditorStep = "location" | "details";
type AddressLabel = "Nhà" | "Công ty" | "Khác";

const initialState: AddressActionState = { status: "idle" };

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const labelOptions: Array<{
  value: AddressLabel;
  icon: ReactNode;
}> = [
  { value: "Nhà", icon: <HomeOutlinedIcon fontSize="small" /> },
  { value: "Công ty", icon: <BusinessOutlinedIcon fontSize="small" /> },
  { value: "Khác", icon: <MoreHorizOutlinedIcon fontSize="small" /> },
];

export default function AddressManager({ addresses }: AddressManagerProps) {
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editorStep, setEditorStep] = useState<EditorStep>("location");
  const [selection, setSelection] = useState<GoogleAddressSelection | null>(
    null
  );
  const [label, setLabel] = useState<AddressLabel>("Nhà");
  const [pickerVersion, setPickerVersion] = useState(0);
  const [requestId, setRequestId] = useState("");
  const [state, formAction, isSubmitting] = useActionState(
    createAddressAction,
    initialState
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (
      state.status === "success" &&
      Boolean(requestId) &&
      state.requestId === requestId
    ) {
      setDialogOpen(false);
      setEditorStep("location");
      setSelection(null);
      router.refresh();
    }
  }, [requestId, router, state.requestId, state.status]);

  const handleOpen = () => {
    setSelection(null);
    setLabel("Nhà");
    setEditorStep("location");
    setRequestId(createRequestId());
    setPickerVersion((current) => current + 1);
    setDialogOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
  };

  const handleChangeLocation = () => {
    setSelection(null);
    setPickerVersion((current) => current + 1);
    setEditorStep("location");
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

  const currentActionState =
    state.requestId === requestId ? state : initialState;

  return (
    <Box>
      {addresses.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={handleOpen}
          >
            Thêm địa chỉ
          </Button>
        </Box>
      )}
      {addresses.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 4, textAlign: "center", borderStyle: "dashed" }}
        >
          <PlaceOutlinedIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6">Chưa có địa chỉ giao hàng</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Thêm một địa chỉ để hệ thống tính phí và thời gian giao hàng.
          </Typography>
          <Button variant="contained" onClick={handleOpen}>
            Chọn vị trí giao hàng
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {addresses.map((address) => (
            <Paper
              key={address.id}
              variant="outlined"
              sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0,
                }}
              >
                <PlaceOutlinedIcon color="primary" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="subtitle2">
                    {address.recipientName || "Người nhận"}
                  </Typography>
                  {address.isDefault && (
                    <Chip label="Mặc định" size="small" color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {address.phone}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {address.line1}
                </Typography>
                {address.note && (
                  <Typography variant="caption" color="text.secondary">
                    Ghi chú: {address.note}
                  </Typography>
                )}
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
                color="error"
                onClick={() => handleDelete(address.id)}
                disabled={isPending}
                title="Xóa địa chỉ"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        fullWidth
        fullScreen={fullScreen}
        maxWidth="sm"
        slotProps={{ paper: { sx: { minHeight: fullScreen ? "100%" : 640 } } }}
      >
        {editorStep === "location" ? (
          <>
            <DialogTitle>Chọn vị trí giao hàng</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tìm địa chỉ, dùng vị trí hiện tại hoặc kéo bản đồ để đặt ghim
                giữa đúng cổng giao hàng.
              </Typography>
              <GoogleAddressPicker
                key={pickerVersion}
                onAddressSelect={setSelection}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose}>Hủy</Button>
              <Button
                variant="contained"
                disabled={!selection}
                onClick={() => setEditorStep("details")}
              >
                Xác nhận vị trí
              </Button>
            </DialogActions>
          </>
        ) : (
          <form action={formAction}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                edge="start"
                onClick={handleChangeLocation}
                disabled={isSubmitting}
                aria-label="Quay lại chọn vị trí"
              >
                <ArrowBackOutlinedIcon />
              </IconButton>
              Thông tin giao hàng
            </DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              {currentActionState.status === "error" &&
                currentActionState.message && (
                  <Alert severity="error">{currentActionState.message}</Alert>
                )}

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 1.25 }}>
                  <PlaceOutlinedIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Địa chỉ đã chọn</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selection?.formattedAddress}
                    </Typography>
                  </Box>
                  <Button size="small" onClick={handleChangeLocation}>
                    Thay đổi
                  </Button>
                </Box>
              </Paper>

              <input type="hidden" name="label" value={label} />
              <input type="hidden" name="requestId" value={requestId} />
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
                autoFocus
                helperText="Thông tin giúp tài xế tìm đúng cửa giao hàng."
              />

              <Divider />

              <Typography variant="subtitle2">Thông tin người nhận</Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  name="recipientName"
                  label="Tên người nhận"
                  fullWidth
                  required
                  error={Boolean(currentActionState.fieldErrors?.recipientName)}
                  helperText={currentActionState.fieldErrors?.recipientName}
                />
                <TextField
                  name="phone"
                  label="Số điện thoại"
                  fullWidth
                  required
                  inputMode="tel"
                  error={Boolean(currentActionState.fieldErrors?.phone)}
                  helperText={currentActionState.fieldErrors?.phone}
                />
              </Box>

              <TextField
                name="note"
                label="Ghi chú cho tài xế"
                placeholder="Ví dụ: Gọi khi đến, để đồ tại lễ tân"
                fullWidth
                multiline
                minRows={2}
              />

              <Typography variant="subtitle2">Lưu địa chỉ là</Typography>
              <ToggleButtonGroup
                exclusive
                value={label}
                onChange={(_event, value: AddressLabel | null) => {
                  if (value) setLabel(value);
                }}
                fullWidth
                size="small"
              >
                {labelOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    {option.icon}
                    <Box component="span" sx={{ ml: 0.75 }}>
                      {option.value}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    defaultChecked={addresses.length === 0}
                  />
                }
                label="Đặt làm địa chỉ mặc định"
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !selection}
                startIcon={
                  isSubmitting ? <CircularProgress size={16} /> : undefined
                }
              >
                Lưu địa chỉ
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Box>
  );
}
