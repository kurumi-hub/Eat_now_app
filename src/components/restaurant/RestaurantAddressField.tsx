"use client";

import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { GoogleAddressSelection } from "@/components/account/GoogleAddressPicker";

const GoogleAddressPicker = dynamic(
  () => import("@/components/account/GoogleAddressPicker"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: 300, display: "grid", placeItems: "center" }}>Đang tải bản đồ...</div>,
  }
);

export type RestaurantAddressSelection = Pick<
  GoogleAddressSelection,
  "formattedAddress" | "placeId" | "lat" | "lon"
>;

type Props = {
  value: RestaurantAddressSelection | null;
  onChange: (selection: RestaurantAddressSelection) => void;
  disabled?: boolean;
};

export default function RestaurantAddressField({ value, onChange, disabled = false }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GoogleAddressSelection | null>(null);
  const [pickerVersion, setPickerVersion] = useState(0);

  const openPicker = () => {
    if (disabled) return;
    setDraft(null);
    setPickerVersion((current) => current + 1);
    setOpen(true);
  };

  const confirm = () => {
    if (!draft) return;
    onChange({
      formattedAddress: draft.formattedAddress,
      placeId: draft.placeId,
      lat: draft.lat,
      lon: draft.lon,
    });
    setOpen(false);
  };

  return <>
    <div className="restaurant-address-field">
      {value ? <Paper variant="outlined" className="restaurant-address-field__selection">
        <PlaceOutlinedIcon color="primary" />
        <div>
          <strong>Địa chỉ đã xác nhận trên Google Maps</strong>
          <span>{value.formattedAddress}</span>
          <small>{value.lat.toFixed(6)}, {value.lon.toFixed(6)}</small>
        </div>
      </Paper> : <Alert severity="warning">
        Hãy tìm và xác nhận vị trí nhà hàng trên Google Maps.
      </Alert>}
      {!disabled && <Button type="button" variant={value ? "outlined" : "contained"} startIcon={<PlaceOutlinedIcon />} onClick={openPicker}>
        {value ? "Thay đổi vị trí" : "Chọn vị trí nhà hàng"}
      </Button>}
    </div>

    <Dialog open={open} onClose={() => setOpen(false)} fullWidth fullScreen={fullScreen} maxWidth="sm" slotProps={{ paper: { sx: { minHeight: fullScreen ? "100%" : 640 } } }}>
      <DialogTitle>Chọn vị trí nhà hàng</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tìm địa chỉ, dùng vị trí hiện tại hoặc kéo bản đồ để ghim đúng cửa nhà hàng.
        </Typography>
        <GoogleAddressPicker key={pickerVersion} context="restaurant" onAddressSelect={setDraft} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button type="button" onClick={() => setOpen(false)}>Hủy</Button>
        <Button type="button" variant="contained" disabled={!draft} onClick={confirm}>Xác nhận vị trí</Button>
      </DialogActions>
    </Dialog>
  </>;
}
