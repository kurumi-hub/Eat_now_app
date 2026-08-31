"use client";

import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/account/addresses/actions";
import type { AccountAddress, AddressFormValues } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import {
  getAddressLineLabel,
  getDefaultAddress,
} from "@/utils/addressDisplay";
import {
  validateAddressValues,
  type AddressField,
  type ValidationErrors,
} from "@/utils/validation";
import {
  addressActionsClassName,
  addressBodyClassName,
  addressBookLayoutClassName,
  addressCardClassName,
  addressCardListClassName,
  addressDefaultChipClassName,
  addressDefaultToggleClassName,
  addressEmptyStateClassName,
  addressFormGridClassName,
  addressNoteClassName,
  addressPhoneClassName,
  addressTextClassName,
  addressToplineClassName,
  compactStrongClassName,
  settingsActionsRowClassName,
  settingsCardHeaderCenterClassName,
  settingsCardHeaderClassName,
  settingsCardIconClassName,
  settingsEyebrowClassName,
  settingsInputSx,
  settingsSectionCardClassName,
  settingsSoftChipClassName,
  settingsStackClassName,
  settingsTitleClassName,
  wideFieldClassName,
} from "./tailwindClasses";

type FeedbackState = {
  severity: "success" | "error";
  message: string;
};

type AddressBookPanelProps = {
  user: PublicUser;
  initialAddresses: AccountAddress[];
};

function createEmptyValues(
  user: PublicUser,
  fallbackAddress: AccountAddress | null
): AddressFormValues {
  return {
    recipientName: user.fullName,
    phone: user.phone || "",
    line1: "",
    ward: fallbackAddress?.ward || "",
    district: fallbackAddress?.district || "",
    city: fallbackAddress?.city || "",
    note: "",
    isDefault: false,
  };
}

function makeLocalAddress(values: AddressFormValues, isFirstAddress: boolean) {
  return {
    ...values,
    id: `local-address-${Date.now()}`,
    isDefault: values.isDefault || isFirstAddress,
    createdAt: new Date().toISOString(),
  };
}

export default function AddressBookPanel({
  user,
  initialAddresses,
}: AddressBookPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAddressAction, setPendingAddressAction] = useState("");
  const initialDefaultAddress = useMemo(
    () => getDefaultAddress(initialAddresses),
    [initialAddresses]
  );
  const [addresses, setAddresses] = useState<AccountAddress[]>(initialAddresses);
  const [values, setValues] = useState<AddressFormValues>(() =>
    createEmptyValues(user, initialDefaultAddress)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<ValidationErrors<AddressField>>({});
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const isAddressBusy = Boolean(pendingAddressAction) || isPending;

  const defaultAddress = useMemo(
    () => getDefaultAddress(addresses),
    [addresses]
  );

  const resetForm = () => {
    setValues(createEmptyValues(user, defaultAddress));
    setEditingId(null);
    setFieldErrors({});
  };

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name as AddressField]: "" }));
    setFeedback(null);
  };

  const handleDefaultChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, isDefault: event.target.checked }));
    setFeedback(null);
  };

  const handleEdit = (address: AccountAddress) => {
    setEditingId(address.id);
    setValues({
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      city: address.city,
      note: address.note || "",
      isDefault: address.isDefault,
    });
    setFieldErrors({});
    setFeedback(null);
  };

  const handleSetDefault = (addressId: string) => {
    if (isAddressBusy) return;

    setAddresses((current) =>
      current.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      }))
    );

    if (addressId.startsWith("local-address-")) {
      setFeedback({ severity: "success", message: "Đã đặt địa chỉ mặc định." });
      return;
    }

    setPendingAddressAction(`default-${addressId}`);
    startTransition(async () => {
      try {
        await setDefaultAddressAction(addressId);
        setFeedback({
          severity: "success",
          message: "Đã đồng bộ địa chỉ mặc định với backend.",
        });
        router.refresh();
      } catch {
        setFeedback({
          severity: "error",
          message: "Không thể đồng bộ địa chỉ mặc định. Vui lòng thử lại.",
        });
      } finally {
        setPendingAddressAction("");
      }
    });
  };

  const handleDelete = (addressId: string) => {
    if (isAddressBusy) return;

    setAddresses((current) => {
      const remaining = current.filter((address) => address.id !== addressId);
      if (
        remaining.length === 0 ||
        remaining.some((address) => address.isDefault)
      ) {
        return remaining;
      }

      return remaining.map((address, index) => ({
        ...address,
        isDefault: index === 0,
      }));
    });
    if (editingId === addressId) resetForm();

    if (addressId.startsWith("local-address-")) {
      setFeedback({
        severity: "success",
        message: "Đã xóa địa chỉ khỏi giao diện.",
      });
      return;
    }

    setPendingAddressAction(`delete-${addressId}`);
    startTransition(async () => {
      try {
        await deleteAddressAction(addressId);
        setFeedback({
          severity: "success",
          message: "Đã xóa địa chỉ và đồng bộ với backend.",
        });
        router.refresh();
      } catch {
        setFeedback({
          severity: "error",
          message: "Không thể xóa địa chỉ trên backend. Vui lòng thử lại.",
        });
      } finally {
        setPendingAddressAction("");
      }
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateAddressValues(values);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFeedback({
        severity: "error",
        message:
          Object.values(validation.errors).find(Boolean) ||
          "Vui lòng kiểm tra lại địa chỉ.",
      });
      return;
    }

    const normalizedValues = validation.normalized;
    setAddresses((current) => {
      const shouldBeDefault = normalizedValues.isDefault || current.length === 0;
      const nextAddresses = editingId
        ? current.map((address) =>
            address.id === editingId
              ? { ...address, ...normalizedValues, isDefault: shouldBeDefault }
              : address
          )
        : [...current, makeLocalAddress(normalizedValues, current.length === 0)];

      if (!shouldBeDefault) {
        return nextAddresses;
      }

      const activeId =
        editingId || nextAddresses[nextAddresses.length - 1]?.id || "";
      return nextAddresses.map((address) => ({
        ...address,
        isDefault: address.id === activeId,
      }));
    });

    setFeedback({
      severity: "success",
      message: editingId ? "Đã cập nhật địa chỉ." : "Đã lưu địa chỉ.",
    });
    resetForm();
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

      <div className={addressBookLayoutClassName}>
        <section className={settingsSectionCardClassName}>
          <div className={settingsCardHeaderCenterClassName}>
            <span className={settingsCardIconClassName} aria-hidden="true">
              <HomeWorkOutlinedIcon />
            </span>
            <div>
              <p className={settingsEyebrowClassName}>Sổ địa chỉ</p>
              <Typography component="h2" variant="h3" className={settingsTitleClassName}>
                Địa chỉ đã lưu
              </Typography>
            </div>
            <Chip
              className={settingsSoftChipClassName}
              label={`${addresses.length} địa chỉ`}
            />
          </div>

          {addresses.length > 0 ? (
            <div className={addressCardListClassName}>
              {addresses.map((address) => (
                <article
                  className={addressCardClassName(address.isDefault)}
                  data-default={address.isDefault}
                  key={address.id}
                >
                  <div className={addressBodyClassName}>
                    <div className={addressToplineClassName}>
                      <strong className={compactStrongClassName}>
                        {address.recipientName}
                      </strong>
                      {address.isDefault ? (
                        <Chip
                          className={addressDefaultChipClassName}
                          label="Mặc định"
                        />
                      ) : null}
                    </div>
                    <p className={addressTextClassName}>
                      {getAddressLineLabel(address)}
                    </p>
                    <span className={addressPhoneClassName}>{address.phone}</span>
                    {address.note ? (
                      <small className={addressNoteClassName}>{address.note}</small>
                    ) : null}
                  </div>
                  <div className={addressActionsClassName}>
                    <Button
                      type="button"
                      variant="text"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => handleEdit(address)}
                      disabled={isAddressBusy}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      startIcon={<StarOutlineOutlinedIcon />}
                      onClick={() => handleSetDefault(address.id)}
                      disabled={address.isDefault || isAddressBusy}
                    >
                      {pendingAddressAction === `default-${address.id}` ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : (
                        "Đặt làm mặc định"
                      )}
                    </Button>
                    <Button
                      type="button"
                      color="error"
                      variant="text"
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      onClick={() => handleDelete(address.id)}
                      aria-label="Xóa địa chỉ"
                      disabled={isAddressBusy}
                    >
                      {pendingAddressAction === `delete-${address.id}` ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : (
                        "Xóa"
                      )}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={addressEmptyStateClassName}>
              <AddLocationAltOutlinedIcon aria-hidden="true" />
              <strong className={compactStrongClassName}>
                Chưa có địa chỉ giao hàng
              </strong>
              <p>Thêm địa chỉ đầu tiên để dùng nhanh trong bước thanh toán.</p>
            </div>
          )}

        </section>

        <form
          className={settingsSectionCardClassName}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={settingsCardHeaderClassName}>
            <span className={settingsCardIconClassName} aria-hidden="true">
              <AddLocationAltOutlinedIcon />
            </span>
            <div>
              <p className={settingsEyebrowClassName}>
                {editingId ? "Cập nhật" : "Thêm mới"}
              </p>
              <Typography component="h2" variant="h3" className={settingsTitleClassName}>
                {editingId ? "Sửa địa chỉ" : "Địa chỉ giao hàng"}
              </Typography>
            </div>
          </div>

          <div className={addressFormGridClassName}>
            <TextField
              required
              label="Người nhận"
              name="recipientName"
              value={values.recipientName}
              error={Boolean(fieldErrors.recipientName)}
              helperText={fieldErrors.recipientName || ""}
              onChange={handleFieldChange}
              autoComplete="name"
              sx={settingsInputSx}
            />
            <TextField
              required
              label="Số điện thoại"
              name="phone"
              value={values.phone}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone || ""}
              onChange={handleFieldChange}
              autoComplete="tel"
              sx={settingsInputSx}
            />
            <TextField
              required
              className={wideFieldClassName}
              label="Địa chỉ"
              name="line1"
              value={values.line1}
              error={Boolean(fieldErrors.line1)}
              helperText={fieldErrors.line1 || ""}
              onChange={handleFieldChange}
              autoComplete="street-address"
              sx={settingsInputSx}
            />
            <TextField
              label="Phường/Xã"
              name="ward"
              value={values.ward}
              onChange={handleFieldChange}
              sx={settingsInputSx}
            />
            <TextField
              label="Quận/Huyện"
              name="district"
              value={values.district}
              onChange={handleFieldChange}
              sx={settingsInputSx}
            />
            <TextField
              label="Tỉnh/Thành phố"
              name="city"
              value={values.city}
              onChange={handleFieldChange}
              sx={settingsInputSx}
            />
            <TextField
              className={wideFieldClassName}
              label="Ghi chú giao hàng"
              name="note"
              value={values.note}
              onChange={handleFieldChange}
              multiline
              minRows={3}
              sx={settingsInputSx}
            />
          </div>

          <FormControlLabel
            className={addressDefaultToggleClassName}
            control={
              <Switch
                checked={values.isDefault}
                onChange={handleDefaultChange}
              />
            }
            label="Đặt làm mặc định"
          />

          <div className={settingsActionsRowClassName}>
            {editingId ? (
              <Button type="button" variant="outlined" onClick={resetForm}>
                Hủy
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
            >
              Lưu địa chỉ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
