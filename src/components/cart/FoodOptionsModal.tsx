"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import type { RestaurantMenuItem } from "@/components/restaurant/restaurantDetailData";
import type {
  CartSizeSelection,
  CartToppingSelection,
} from "@/store/cartStore";

type FoodOptionsModalProps = {
  open: boolean;
  food: RestaurantMenuItem | null;
  onClose: () => void;
  onConfirm: (selection: {
    size?: CartSizeSelection;
    toppings: CartToppingSelection[];
    note?: string;
    quantity: number;
  }) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export default function FoodOptionsModal({
  open,
  food,
  onClose,
  onConfirm,
}: FoodOptionsModalProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>();
  const [selectedToppingIds, setSelectedToppingIds] = useState<Set<string>>(
    new Set()
  );
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reset lại state mỗi khi mở modal cho món khác
  useEffect(() => {
    if (open && food) {
      const availableSizes = food.sizes?.filter((s) => s.isAvailable) ?? [];
      setSelectedSizeId(availableSizes[0]?.id);
      setSelectedToppingIds(new Set());
      setNote("");
      setQuantity(1);
    }
  }, [open, food]);

  const toppingGroups = food?.toppingGroups ?? [];

  const selectedSize = useMemo(
    () => food?.sizes?.find((s) => s.id === selectedSizeId),
    [food, selectedSizeId]
  );

  const selectedToppings = useMemo(() => {
    const all = toppingGroups.flatMap((g) => g.toppings);
    return all.filter((t) => selectedToppingIds.has(t.id));
  }, [toppingGroups, selectedToppingIds]);

  const unitPrice = useMemo(() => {
    if (!food) return 0;
    const base = selectedSize ? selectedSize.price : food.price;
    const toppingsTotal = selectedToppings.reduce(
      (sum, t) => sum + t.price,
      0
    );
    return base + toppingsTotal;
  }, [food, selectedSize, selectedToppings]);

  // Validate từng group theo min_select / max_select trước khi cho confirm
  const invalidGroups = useMemo(() => {
    return toppingGroups.filter((group) => {
      const selectedCount = group.toppings.filter((t) =>
        selectedToppingIds.has(t.id)
      ).length;
      return (
        selectedCount < group.minSelect || selectedCount > group.maxSelect
      );
    });
  }, [toppingGroups, selectedToppingIds]);

  const canConfirm = food?.isAvailable && invalidGroups.length === 0;

  function toggleTopping(groupId: string, toppingId: string, maxSelect: number) {
    setSelectedToppingIds((prev) => {
      const next = new Set(prev);
      const group = toppingGroups.find((g) => g.id === groupId);
      const groupToppingIds = new Set(
        group?.toppings.map((t) => t.id) ?? []
      );

      if (next.has(toppingId)) {
        next.delete(toppingId);
        return next;
      }

      // maxSelect === 1 -> hành xử như radio: bỏ chọn cũ trong cùng group
      const currentInGroup = [...next].filter((id) =>
        groupToppingIds.has(id)
      );
      if (maxSelect === 1 && currentInGroup.length >= 1) {
        currentInGroup.forEach((id) => next.delete(id));
      } else if (currentInGroup.length >= maxSelect) {
        // đã đạt max, không cho chọn thêm
        return prev;
      }

      next.add(toppingId);
      return next;
    });
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm({
      size: selectedSize,
      toppings: selectedToppings,
      note: note.trim() || undefined,
      quantity,
    });
    onClose();
  }

  if (!food) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" component="span">
          {food.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {food.description}
        </Typography>

        {food.sizes && food.sizes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Chọn size
            </Typography>
            <RadioGroup
              value={selectedSizeId ?? ""}
              onChange={(e) => setSelectedSizeId(e.target.value)}
            >
              {food.sizes.map((size) => (
                <FormControlLabel
                  key={size.id}
                  value={size.id}
                  disabled={!size.isAvailable}
                  control={<Radio />}
                  label={
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 16 }}>
                      <span>
                        {size.name}
                        {!size.isAvailable && " (hết hàng)"}
                      </span>
                      <span>{formatPrice(size.price)}</span>
                    </div>
                  }
                  sx={{ width: "100%", mr: 0, justifyContent: "space-between" }}
                />
              ))}
            </RadioGroup>
          </div>
        )}

        {toppingGroups.map((group) => {
          const selectedCount = group.toppings.filter((t) =>
            selectedToppingIds.has(t.id)
          ).length;
          const isInvalid = invalidGroups.some((g) => g.id === group.id);

          return (
            <div key={group.id} style={{ marginBottom: 24 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {group.name}
                {group.minSelect > 0 && (
                  <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}>
                    Bắt buộc chọn {group.minSelect}
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chọn tối đa {group.maxSelect} ({selectedCount}/{group.maxSelect})
              </Typography>

              {group.toppings.map((topping) => (
                <FormControlLabel
                  key={topping.id}
                  disabled={!topping.isAvailable}
                  control={
                    <Checkbox
                      checked={selectedToppingIds.has(topping.id)}
                      onChange={() =>
                        toggleTopping(group.id, topping.id, group.maxSelect)
                      }
                    />
                  }
                  label={
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 16 }}>
                      <span>
                        {topping.name}
                        {!topping.isAvailable && " (hết hàng)"}
                      </span>
                      <span>
                        {topping.price > 0 ? `+${formatPrice(topping.price)}` : "Miễn phí"}
                      </span>
                    </div>
                  }
                  sx={{ width: "100%", mr: 0, justifyContent: "space-between" }}
                />
              ))}

              {isInvalid && (
                <Typography variant="caption" color="error">
                  Vui lòng chọn từ {group.minSelect} đến {group.maxSelect} mục
                </Typography>
              )}
              <Divider sx={{ mt: 1.5 }} />
            </div>
          );
        })}

        <TextField
          label="Ghi chú"
          placeholder="Ví dụ: ít cay, không hành..."
          fullWidth
          multiline
          minRows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Số lượng
          </Typography>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconButton
              size="small"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <RemoveOutlinedIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" sx={{ minWidth: 24, textAlign: "center" }}>
              {quantity}
            </Typography>
            <IconButton size="small" onClick={() => setQuantity((q) => q + 1)}>
              <AddOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!canConfirm}
          onClick={handleConfirm}
          sx={{ mt: 3 }}
        >
          Thêm vào giỏ · {formatPrice(unitPrice * quantity)}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
