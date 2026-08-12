"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { AccountAddress } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { useCartStore } from "@/store/cartStore";
import {
  placeOrder,
  previewOrder,
  syncCartToServer,
} from "@/app/checkout/actions";
import AlertBox from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { Radio, RadioGroup, FormControlLabel } from "@/components/ui/SelectionControls";
import { Divider, Spinner } from "@/components/ui/Primitives";

type CheckoutPageProps = {
  user: PublicUser;
  addresses: AccountAddress[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

type PreviewState = {
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_price: number;
  distance_km: number;
  voucher?: { valid: boolean; reason?: string };
} | null;

export default function CheckoutPage({ user, addresses }: CheckoutPageProps) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const clearCart = useCartStore((state) => state.clearCart);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0],
    [addresses]
  );

  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [note, setNote] = useState("");

  const [cartId, setCartId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [previewError, setPreviewError] = useState("");
  const [error, setError] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSyncing, startSyncing] = useTransition();
  const [isPlacing, startPlacing] = useTransition();

  useEffect(() => {
    if (!hydrated) return;
    if (lines.length === 0) return;

    startSyncing(async () => {
      const result = await syncCartToServer(lines);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCartId(result.cartId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!cartId || !addressId) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setPreviewError("");
      const result = await previewOrder(cartId, addressId, voucherCode);
      if (cancelled) return;
      if (!result.ok) {
        setPreviewError(result.error);
        setPreview(null);
        return;
      }
      setPreview(result.preview as PreviewState);
    })();

    return () => {
      cancelled = true;
    };
  }, [cartId, addressId, voucherCode]);

  const handlePlaceOrder = () => {
    if (!cartId || !addressId) return;
    setError("");

    startPlacing(async () => {
      const result = await placeOrder(
        cartId,
        addressId,
        paymentMethod,
        note || undefined,
        voucherCode || undefined
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clearCart();

      if (paymentMethod === "vnpay") {
        const res = await fetch("/api/vnpay/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.orderId }),
        });
        const data = await res.json();

        if (!res.ok || !data.paymentUrl) {
          setError(
            "Đơn hàng đã được tạo nhưng không thể khởi tạo thanh toán VNPay. Vui lòng liên hệ hỗ trợ."
          );
          return;
        }

        window.location.href = data.paymentUrl;
        return;
      }

      router.push(`/orders/${result.orderId}`);
    });
  };

  if (hydrated && lines.length === 0) {
    return (
      <>
        <CustomerHeader
          user={user}
          onPlaceholder={setSnackbarMessage}
          onSectionNavigate={(sectionId) => router.push(`/#${sectionId}`)}
        />
        <div className="mx-auto max-w-[640px] p-8 text-center">
          <p className="mb-4 text-lg font-semibold">Giỏ hàng đang trống</p>
          <Button variant="contained" onClick={() => router.push("/")}>
            Quay lại trang chủ
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerHeader
        user={user}
        onPlaceholder={setSnackbarMessage}
        onSectionNavigate={(sectionId) => router.push(`/#${sectionId}`)}
      />
      <div className="mx-auto flex max-w-[720px] flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>

        {restaurantName && (
          <p className="text-sm text-[var(--brand-text-soft)]">
            Nhà hàng: {restaurantName}
          </p>
        )}

        {error && <AlertBox severity="error">{error}</AlertBox>}

        <div className="rounded-2xl border border-[var(--brand-border)] p-5">
          <p className="mb-3 font-semibold">Địa chỉ giao hàng</p>

          {addresses.length === 0 ? (
            <AlertBox severity="warning">
              <span className="flex flex-wrap items-center gap-2">
                Bạn chưa có địa chỉ giao hàng nào.
                <Button
                  size="small"
                  variant="text"
                  onClick={() => router.push("/account/addresses")}
                >
                  Thêm địa chỉ
                </Button>
              </span>
            </AlertBox>
          ) : (
            <RadioGroup>
              {addresses.map((address) => (
                <FormControlLabel
                  key={address.id}
                  control={
                    <Radio
                      name="address"
                      checked={addressId === address.id}
                      onChange={() => setAddressId(address.id)}
                    />
                  }
                  label={
                    <span className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-[var(--brand-text-soft)]" />
                      {address.line1}
                      {address.isDefault && " (Mặc định)"}
                    </span>
                  }
                />
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] p-5">
          <p className="mb-3 font-semibold">Mã giảm giá</p>
          <TextField
            placeholder="Nhập mã voucher (không bắt buộc)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.trim())}
          />
          {preview?.voucher && voucherCode && !preview.voucher.valid && (
            <p className="mt-1 text-xs text-[var(--brand-error)]">
              {preview.voucher.reason || "Voucher không hợp lệ"}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] p-5">
          <p className="mb-3 font-semibold">Phương thức thanh toán</p>
          <RadioGroup>
            <FormControlLabel
              control={
                <Radio
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
              }
              label="Thanh toán khi nhận hàng (COD)"
            />
            <FormControlLabel
              control={
                <Radio
                  name="payment"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                />
              }
              label="Thanh toán qua VNPay (quét QR / thẻ)"
            />
          </RadioGroup>
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] p-5">
          <TextField
            label="Ghi chú cho đơn hàng (không bắt buộc)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] p-5">
          <p className="mb-3 font-semibold">Tổng thanh toán</p>

          {isSyncing && (
            <div className="flex items-center gap-2 py-1 text-sm text-[var(--brand-text-soft)]">
              <Spinner size={16} />
              Đang chuẩn bị giỏ hàng...
            </div>
          )}

          {previewError && <AlertBox severity="error">{previewError}</AlertBox>}

          {preview && (
            <div className="flex flex-col gap-1">
              <Row label="Tạm tính" value={formatCurrency(preview.subtotal)} />
              <Row
                label="Phí giao hàng"
                value={formatCurrency(preview.shipping_fee)}
              />
              {preview.discount_amount > 0 && (
                <Row
                  label="Giảm giá"
                  value={`-${formatCurrency(preview.discount_amount)}`}
                />
              )}
              <Divider className="my-2" />
              <Row
                label="Tổng cộng"
                value={formatCurrency(preview.total_price)}
                bold
              />
            </div>
          )}
        </div>

        <Button
          variant="contained"
          size="large"
          disabled={!cartId || !addressId || !preview || isSyncing || isPlacing}
          onClick={handlePlaceOrder}
          startIcon={isPlacing ? <Spinner size={18} /> : undefined}
        >
          {paymentMethod === "vnpay" ? "Thanh toán qua VNPay" : "Đặt hàng"}
        </Button>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span
        className={
          bold
            ? "font-bold text-[var(--brand-text)]"
            : "text-[var(--brand-text-soft)]"
        }
      >
        {label}
      </span>
      <span className={bold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
