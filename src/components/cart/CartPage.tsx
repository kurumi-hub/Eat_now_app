"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import { useCartStore, type CartLine } from "@/store/cartStore";
import { createOrder } from "@/app/cart/actions";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Divider, IconButton } from "@/components/ui/Primitives";
import SnackbarToast from "@/components/ui/Snackbar";

type CartPageProps = {
  user: PublicUser | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function lineDescription(line: CartLine) {
  const parts: string[] = [];
  if (line.size) parts.push(line.size.name);
  if (line.toppings.length > 0) {
    parts.push(line.toppings.map((t) => t.name).join(", "));
  }
  if (line.note) parts.push(`Ghi chú: ${line.note}`);
  return parts.join(" · ");
}

export default function CartPage({ user }: CartPageProps) {
  const router = useRouter();

  const lines = useCartStore((state) => state.lines);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice());

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const showMessage = (message: string) =>
    setSnackbar({ open: true, message });

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [receiverName, setReceiverName] = useState(user?.fullName ?? "");
  const [receiverPhone, setReceiverPhone] = useState(user?.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, startSubmitting] = useTransition();

  const handleCheckoutClick = () => {
    if (!user) {
      router.push("/login?next=/cart");
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = () => {
    const errors: Record<string, string> = {};
    if (!receiverName.trim()) errors.receiverName = "Vui lòng nhập tên người nhận.";
    if (!/^0(?:3|5|7|8|9)\d{8}$/.test(receiverPhone.trim())) {
      errors.receiverPhone = "Số điện thoại không hợp lệ.";
    }
    if (!deliveryAddress.trim()) errors.deliveryAddress = "Vui lòng nhập địa chỉ giao hàng.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!restaurantId) {
      showMessage("Giỏ hàng đang trống.");
      return;
    }

    startSubmitting(async () => {
      const result = await createOrder({
        restaurantId,
        lines: lines.map((line) => ({
          foodId: line.foodId,
          foodName: line.foodName,
          sizeId: line.size?.id,
          sizeName: line.size?.name,
          toppings: line.toppings.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
          })),
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          note: line.note,
        })),
        deliveryAddress,
        receiverName,
        receiverPhone,
        note: orderNote,
      });

      if (!result.ok) {
        showMessage(result.error);
        return;
      }

      clearCart();
      router.push(`/orders/${result.orderId}`);
    });
  };

  const isEmpty = hydrated && lines.length === 0;

  return (
    <div className="restaurant-detail-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showMessage}
        onSectionNavigate={(sectionId) => router.push(`/#${sectionId}`)}
      />

      <main className="mx-auto max-w-[720px] px-4 pb-24 pt-8">
        <h1 className="mb-4 text-2xl font-bold">Giỏ hàng của bạn</h1>

        {!hydrated ? null : isEmpty ? (
          <div className="flex flex-col items-center gap-4 py-16 text-[var(--brand-text-soft)]">
            <ShoppingCart className="h-14 w-14" />
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link href="/">
              <Button variant="contained">Khám phá nhà hàng</Button>
            </Link>
          </div>
        ) : (
          <>
            {restaurantName && (
              <p className="mb-4 text-[var(--brand-text-soft)]">
                Đặt món từ <strong className="text-[var(--brand-text)]">{restaurantName}</strong>
              </p>
            )}

            <div className="flex flex-col gap-4">
              {lines.map((line) => (
                <div
                  key={line.lineId}
                  className="flex gap-4 rounded-2xl border border-[var(--brand-border)] p-4"
                >
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
                    <Image src={line.foodImage} alt={line.foodName} fill sizes="72px" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{line.foodName}</p>
                    {lineDescription(line) && (
                      <p className="truncate text-sm text-[var(--brand-text-soft)]">
                        {lineDescription(line)}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(line.unitPrice)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <IconButton
                      aria-label={`Xoá ${line.foodName}`}
                      onClick={() => removeLine(line.lineId)}
                      className="min-h-9 min-w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>

                    <div className="flex items-center gap-2">
                      <IconButton
                        className="min-h-9 min-w-9"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </IconButton>
                      <span className="min-w-5 text-center">{line.quantity}</span>
                      <IconButton
                        className="min-h-9 min-w-9"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Divider className="my-6" />

            {showCheckoutForm && (
              <div className="mb-6 flex flex-col gap-4">
                <p className="font-semibold">Thông tin giao hàng</p>
                <TextField
                  label="Tên người nhận"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  error={Boolean(formErrors.receiverName)}
                  helperText={formErrors.receiverName}
                />
                <TextField
                  label="Số điện thoại"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  error={Boolean(formErrors.receiverPhone)}
                  helperText={formErrors.receiverPhone}
                />
                <TextField
                  label="Địa chỉ giao hàng"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  error={Boolean(formErrors.deliveryAddress)}
                  helperText={formErrors.deliveryAddress}
                />
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold leading-[18px] text-[var(--brand-text-soft)]">
                    Ghi chú cho đơn hàng (tuỳ chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full rounded-xl border border-[#d9c9c0] bg-[#fffdfc] px-3.5 py-2.5 text-[15px] outline-none focus:border-[var(--brand-primary)] focus:shadow-[var(--brand-focus-ring)]"
                  />
                </div>
              </div>
            )}

            <div className="mb-1 flex justify-between">
              <span className="text-[var(--brand-text-soft)]">Tạm tính</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="mb-6 flex justify-between">
              <span className="text-lg font-semibold">
                Tổng cộng (tạm tính + phí ship)
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(totalPrice + 15000)}
              </span>
            </div>

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
              onClick={showCheckoutForm ? handleSubmitOrder : handleCheckoutClick}
            >
              {isSubmitting
                ? "Đang đặt đơn..."
                : showCheckoutForm
                  ? "Xác nhận đặt đơn"
                  : "Đặt đơn"}
            </Button>
          </>
        )}
      </main>

      <SnackbarToast
        open={snackbar.open}
        message={snackbar.message}
        severity="info"
        autoHideDuration={2600}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
