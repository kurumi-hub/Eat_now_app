"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { RestaurantMenuItem } from "@/components/restaurant/restaurantDetailData";
import type {
  CartSizeSelection,
  CartToppingSelection,
} from "@/store/cartStore";
import Button from "@/components/ui/Button";
import Dialog, { DialogContent } from "@/components/ui/Dialog";
import { Checkbox, FormControlLabel, Radio, RadioGroup } from "@/components/ui/SelectionControls";
import { Divider, IconButton } from "@/components/ui/Primitives";

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

      const currentInGroup = [...next].filter((id) =>
        groupToppingIds.has(id)
      );
      if (maxSelect === 1 && currentInGroup.length >= 1) {
        currentInGroup.forEach((id) => next.delete(id));
      } else if (currentInGroup.length >= maxSelect) {
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
    <Dialog open={open} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-lg font-bold text-[var(--brand-text)]">{food.name}</h2>
        <IconButton onClick={onClose} className="min-h-9 min-w-9">
          <X className="h-5 w-5" />
        </IconButton>
      </div>

      <DialogContent>
        <p className="mb-2 text-sm text-[var(--brand-text-soft)]">
          {food.description}
        </p>

        {food.sizes && food.sizes.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 font-semibold text-[var(--brand-text)]">
              Chọn size
            </p>
            <RadioGroup>
              {food.sizes.map((size) => (
                <FormControlLabel
                  key={size.id}
                  className="w-full justify-between"
                  control={
                    <Radio
                      name="size"
                      value={size.id}
                      checked={selectedSizeId === size.id}
                      disabled={!size.isAvailable}
                      onChange={() => setSelectedSizeId(size.id)}
                    />
                  }
                  label={
                    <div className="flex w-full items-center justify-between gap-4">
                      <span>
                        {size.name}
                        {!size.isAvailable && " (hết hàng)"}
                      </span>
                      <span>{formatPrice(size.price)}</span>
                    </div>
                  }
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
            <div key={group.id} className="mb-6">
              <p className="font-semibold text-[var(--brand-text)]">
                {group.name}
                {group.minSelect > 0 && (
                  <span className="ml-2 text-xs text-[var(--brand-error)]">
                    Bắt buộc chọn {group.minSelect}
                  </span>
                )}
              </p>
              <p className="text-xs text-[var(--brand-text-soft)]">
                Chọn tối đa {group.maxSelect} ({selectedCount}/{group.maxSelect})
              </p>

              {group.toppings.map((topping) => (
                <FormControlLabel
                  key={topping.id}
                  className="w-full justify-between"
                  control={
                    <Checkbox
                      checked={selectedToppingIds.has(topping.id)}
                      disabled={!topping.isAvailable}
                      onChange={() =>
                        toggleTopping(group.id, topping.id, group.maxSelect)
                      }
                    />
                  }
                  label={
                    <div className="flex w-full items-center justify-between gap-4">
                      <span>
                        {topping.name}
                        {!topping.isAvailable && " (hết hàng)"}
                      </span>
                      <span>
                        {topping.price > 0 ? `+${formatPrice(topping.price)}` : "Miễn phí"}
                      </span>
                    </div>
                  }
                />
              ))}

              {isInvalid && (
                <p className="text-xs text-[var(--brand-error)]">
                  Vui lòng chọn từ {group.minSelect} đến {group.maxSelect} mục
                </p>
              )}
              <Divider className="mt-3" />
            </div>
          );
        })}

        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold leading-[18px] text-[var(--brand-text-soft)]">
            Ghi chú
          </label>
          <textarea
            placeholder="Ví dụ: ít cay, không hành..."
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-[#d9c9c0] bg-[#fffdfc] px-3.5 py-2.5 text-[15px] text-[var(--brand-text)] outline-none transition-shadow placeholder:text-[var(--brand-text-soft)]/60 focus:border-[var(--brand-primary)] focus:shadow-[var(--brand-focus-ring)]"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-semibold text-[var(--brand-text)]">Số lượng</p>
          <div className="flex items-center gap-3">
            <IconButton
              className="min-h-9 min-w-9"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </IconButton>
            <span className="min-w-6 text-center">{quantity}</span>
            <IconButton
              className="min-h-9 min-w-9"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="mt-6"
        >
          Thêm vào giỏ · {formatPrice(unitPrice * quantity)}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
