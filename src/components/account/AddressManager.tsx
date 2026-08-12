"use client";

import { CheckCircle2, Circle, MapPin, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/actions";
import type { AccountAddress } from "@/types/account";
import AlertBox from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Checkbox, FormControlLabel } from "@/components/ui/SelectionControls";
import Dialog, { DialogActions, DialogContent } from "@/components/ui/Dialog";
import { IconButton, Spinner } from "@/components/ui/Primitives";

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
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDialogOpen(true)} startIcon={<Plus className="h-4 w-4" />}>
          Thêm địa chỉ mới
        </Button>
      </div>

      {addresses.length === 0 ? (
        <AlertBox severity="info">
          Bạn chưa có địa chỉ giao hàng nào. Thêm địa chỉ để đặt hàng nhanh
          hơn.
        </AlertBox>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start gap-3 rounded-2xl border border-[var(--brand-border)] p-4"
            >
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[var(--brand-text-soft)]" />
              <div className="flex-1">
                <p className="font-semibold text-[var(--brand-text)]">
                  {address.line1}
                  {address.isDefault && (
                    <span className="ml-2 text-xs font-medium text-[var(--brand-primary)]">
                      Mặc định
                    </span>
                  )}
                </p>
              </div>
              <IconButton
                onClick={() => handleSetDefault(address.id)}
                disabled={isPending || address.isDefault}
                title="Đặt làm mặc định"
                className="min-h-9 min-w-9"
              >
                {address.isDefault ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </IconButton>
              <IconButton
                onClick={() => handleDelete(address.id)}
                disabled={isPending}
                title="Xoá địa chỉ"
                className="min-h-9 min-w-9"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} title="Thêm địa chỉ giao hàng" maxWidthClassName="max-w-lg">
        <form action={formAction}>
          <DialogContent>
            {state.status === "error" && state.message && (
              <AlertBox severity="error">{state.message}</AlertBox>
            )}
            {state.status === "success" && (
              <AlertBox severity="success">{state.message}</AlertBox>
            )}

            <TextField name="label" label="Tên gợi nhớ (VD: Nhà, Công ty)" />
            <TextField
              name="recipientName"
              label="Tên người nhận"
              required
              error={Boolean(state.fieldErrors?.recipientName)}
              helperText={state.fieldErrors?.recipientName}
            />
            <TextField
              name="phone"
              label="Số điện thoại"
              required
              error={Boolean(state.fieldErrors?.phone)}
              helperText={state.fieldErrors?.phone}
            />
            <TextField
              name="line1"
              label="Số nhà, tên đường"
              required
              error={Boolean(state.fieldErrors?.line1)}
              helperText={state.fieldErrors?.line1}
            />
            <div className="flex gap-3">
              <TextField
                name="ward"
                label="Phường/Xã"
                required
                error={Boolean(state.fieldErrors?.ward)}
                helperText={state.fieldErrors?.ward}
              />
              <TextField
                name="district"
                label="Quận/Huyện"
                required
                error={Boolean(state.fieldErrors?.district)}
                helperText={state.fieldErrors?.district}
              />
            </div>
            <TextField
              name="city"
              label="Tỉnh/Thành phố"
              required
              error={Boolean(state.fieldErrors?.city)}
              helperText={state.fieldErrors?.city}
            />
            <TextField name="note" label="Ghi chú (không bắt buộc)" />
            <FormControlLabel
              control={<Checkbox name="isDefault" />}
              label="Đặt làm địa chỉ mặc định"
            />
          </DialogContent>
          <DialogActions>
            <Button variant="text" type="button" onClick={handleClose} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <Spinner size={16} /> : undefined}
            >
              Lưu địa chỉ
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
