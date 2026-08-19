"use client";

import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import CheckoutAddressDialog from "@/components/checkout/CheckoutAddressDialog";
import CustomerHeader from "@/components/home/CustomerHeader";
import type { AccountAddress } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { useCartStore } from "@/store/cartStore";
import { useCartSession } from "@/store/useCartSession";
import {
  listCheckoutVouchers,
  placeOrder,
  previewOrder,
  syncCartToServer,
  type CheckoutVoucher,
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
  tax_amount?: number;
  tax_added_amount?: number;
  customer_fee_amount?: number;
  voucher?: { valid: boolean; reason?: string };
} | null;

function voucherBenefit(voucher: CheckoutVoucher) {
  const target =
    voucher.discountScope === "shipping" ? "phí giao hàng" : "món ăn";
  if (voucher.discountType === "fixed") {
    return `Giảm ${formatCurrency(voucher.discountValue)} ${target}`;
  }

  const maximum = voucher.maxDiscount
    ? `, tối đa ${formatCurrency(voucher.maxDiscount)}`
    : "";
  return `Giảm ${voucher.discountValue}% ${target}${maximum}`;
}

export default function CheckoutPage({ user, addresses }: CheckoutPageProps) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartReady = useCartSession(user.id);

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0],
    [addresses]
  );

  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
  const [voucherCode, setVoucherCode] = useState("");
  const [vouchers, setVouchers] = useState<CheckoutVoucher[]>([]);
  const [voucherError, setVoucherError] = useState("");
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [note, setNote] = useState("");

  const [cartId, setCartId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [previewError, setPreviewError] = useState("");
  const [error, setError] = useState("");
  const [isSyncing, startSyncing] = useTransition();
  const [isPlacing, startPlacing] = useTransition();

  useEffect(() => {
    if (!addressId && defaultAddress) setAddressId(defaultAddress.id);
  }, [addressId, defaultAddress]);

  const handleAddressCreated = useCallback((newAddressId: string) => {
    setAddressId(newAddressId);
  }, []);

  const handleCloseAddressDialog = useCallback(() => {
    setAddressDialogOpen(false);
  }, []);

  // Đồng bộ giỏ hàng lên server 1 lần khi vào trang checkout, để lấy cart_id
  // dùng cho preview_order/place_order.
  useEffect(() => {
    if (!cartReady) return;
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
  }, [cartReady]);

  useEffect(() => {
    if (!cartId) {
      setVouchers([]);
      return;
    }

    let cancelled = false;
    setVoucherError("");
    setIsLoadingVouchers(true);

    (async () => {
      const result = await listCheckoutVouchers(cartId);
      if (cancelled) return;

      setIsLoadingVouchers(false);
      if (!result.ok) {
        setVoucherError(result.error);
        setVouchers([]);
        return;
      }

      setVouchers(result.vouchers);
      setVoucherCode((current) =>
        current && !result.vouchers.some((voucher) => voucher.code === current)
          ? ""
          : current
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [cartId]);

  // Tính lại preview mỗi khi đổi địa chỉ/voucher, sau khi đã có cartId.
  useEffect(() => {
    if (!cartId || !addressId) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setPreviewError("");
      const result = await previewOrder(
        cartId,
        addressId,
        paymentMethod,
        voucherCode
      );
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
  }, [cartId, addressId, paymentMethod, voucherCode]);

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

        // Chỉ xóa giỏ phía client sau khi đã có URL VNPay hợp lệ, tránh UI
        // nhảy sang "Giỏ hàng đang trống" trong lúc endpoint còn đang xử lý.
        clearCart();
        window.location.href = data.paymentUrl;
        return;
      }

      clearCart();
      router.push(`/orders/${result.orderId}`);
    });
  };

  const [snackbarMessage, setSnackbarMessage] = useState("");

  if (cartReady && lines.length === 0) {
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Địa chỉ giao hàng
            </Typography>
            <Button
              size="small"
              startIcon={<AddLocationAltOutlinedIcon />}
              onClick={() => setAddressDialogOpen(true)}
            >
              Thêm địa chỉ mới
            </Button>
          </Box>

          {addresses.length === 0 ? (
            <Alert severity="warning">
              Bạn chưa có địa chỉ giao hàng. Hãy thêm địa chỉ mới để tiếp tục.
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
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {address.recipientName || "Người nhận"}
                            {address.phone ? ` · ${address.phone}` : ""}
                            {address.isDefault && " (Mặc định)"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.line1}
                          </Typography>
                        </Box>
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
            Voucher
          </Typography>

          {isLoadingVouchers && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Đang tải voucher...
              </Typography>
            </Box>
          )}

          {voucherError && <Alert severity="error">{voucherError}</Alert>}

          {!isLoadingVouchers && !voucherError && (
            <RadioGroup
              value={voucherCode}
              onChange={(event) => setVoucherCode(event.target.value)}
            >
              <FormControlLabel
                value=""
                control={<Radio />}
                label="Không sử dụng voucher"
              />

              {vouchers.map((voucher) => (
                <FormControlLabel
                  key={voucher.id}
                  value={voucher.code}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1.25, py: 0.75 }}>
                      <LocalOfferOutlinedIcon color="primary" fontSize="small" />
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={voucher.code}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {voucher.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {voucherBenefit(voucher)}
                          {voucher.minOrderValue > 0 &&
                            ` · Đơn tối thiểu ${formatCurrency(
                              voucher.minOrderValue
                            )}`}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              ))}

              {vouchers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  Hiện chưa có voucher phù hợp với nhà hàng này.
                </Typography>
              )}
            </RadioGroup>
          )}

          {preview?.voucher && voucherCode && !preview.voucher.valid && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {preview.voucher.reason || "Voucher không hợp lệ"}
            </Alert>
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
              {(preview.customer_fee_amount ?? 0) > 0 && (
                <Row
                  label="Phí dịch vụ và phụ phí"
                  value={formatCurrency(preview.customer_fee_amount ?? 0)}
                />
              )}
              {(preview.tax_amount ?? 0) > 0 && (
                <Row
                  label={
                    (preview.tax_added_amount ?? 0) > 0
                      ? "Thuế"
                      : "Thuế đã bao gồm"
                  }
                  value={formatCurrency(preview.tax_amount ?? 0)}
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

      <CheckoutAddressDialog
        open={addressDialogOpen}
        onClose={handleCloseAddressDialog}
        onCreated={handleAddressCreated}
      />
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
