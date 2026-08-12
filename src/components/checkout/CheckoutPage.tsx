"use client";

import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
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
  const [isSyncing, startSyncing] = useTransition();
  const [isPlacing, startPlacing] = useTransition();

  // Đồng bộ giỏ hàng lên server 1 lần khi vào trang checkout, để lấy cart_id
  // dùng cho preview_order/place_order.
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
    // Chỉ chạy 1 lần khi vào trang, không refetch mỗi lần user gõ voucher.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Tính lại preview mỗi khi đổi địa chỉ/voucher, sau khi đã có cartId.
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

  const [snackbarMessage, setSnackbarMessage] = useState("");

  if (hydrated && lines.length === 0) {
    return (
      <>
        <CustomerHeader
          user={user}
          onPlaceholder={setSnackbarMessage}
          onSectionNavigate={(sectionId) => router.push(`/#${sectionId}`)}
        />
        <Box sx={{ maxWidth: 640, mx: "auto", p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Giỏ hàng đang trống
          </Typography>
          <Button variant="contained" onClick={() => router.push("/")}>
            Quay lại trang chủ
          </Button>
        </Box>
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
      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          p: { xs: 2, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Xác nhận đơn hàng
        </Typography>

        {restaurantName && (
          <Typography variant="body2" color="text.secondary">
            Nhà hàng: {restaurantName}
          </Typography>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            Địa chỉ giao hàng
          </Typography>

          {addresses.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Bạn chưa có địa chỉ giao hàng nào.{" "}
              <Button
                size="small"
                onClick={() => router.push("/account/addresses")}
              >
                Thêm địa chỉ
              </Button>
            </Alert>
          ) : (
            <FormControl fullWidth>
              <RadioGroup
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
              >
                {addresses.map((address) => (
                  <FormControlLabel
                    key={address.id}
                    value={address.id}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PlaceOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {address.line1}
                          {address.isDefault && " (Mặc định)"}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            Mã giảm giá
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập mã voucher (không bắt buộc)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.trim())}
          />
          {preview?.voucher && voucherCode && !preview.voucher.valid && (
            <Typography variant="caption" color="error">
              {preview.voucher.reason || "Voucher không hợp lệ"}
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            Phương thức thanh toán
          </Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "cod" | "vnpay")
            }
          >
            <FormControlLabel
              value="cod"
              control={<Radio />}
              label="Thanh toán khi nhận hàng (COD)"
            />
            <FormControlLabel
              value="vnpay"
              control={<Radio />}
              label="Thanh toán qua VNPay (quét QR / thẻ)"
            />
          </RadioGroup>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Ghi chú cho đơn hàng (không bắt buộc)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            Tổng thanh toán
          </Typography>

          {isSyncing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Đang chuẩn bị giỏ hàng...
              </Typography>
            </Box>
          )}

          {previewError && <Alert severity="error">{previewError}</Alert>}

          {preview && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
              <Divider sx={{ my: 1 }} />
              <Row
                label="Tổng cộng"
                value={formatCurrency(preview.total_price)}
                bold
              />
            </Box>
          )}
        </Paper>

        <Button
          variant="contained"
          size="large"
          disabled={
            !cartId ||
            !addressId ||
            !preview ||
            isSyncing ||
            isPlacing
          }
          onClick={handlePlaceOrder}
          startIcon={isPlacing ? <CircularProgress size={18} /> : undefined}
        >
          {paymentMethod === "vnpay" ? "Thanh toán qua VNPay" : "Đặt hàng"}
        </Button>
      </Box>
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
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography
        variant="body2"
        color={bold ? "text.primary" : "text.secondary"}
        sx={{ fontWeight: bold ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 500 }}>
        {value}
      </Typography>
    </Box>
  );
}
