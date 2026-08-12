"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import { useCartStore, type CartLine } from "@/store/cartStore";
import { createOrder } from "@/app/cart/actions";

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

  // Thông tin giao hàng -- chỉ hỏi khi người dùng thật sự bấm đặt đơn.
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [receiverName, setReceiverName] = useState(user?.fullName ?? "");
  const [receiverPhone, setReceiverPhone] = useState(user?.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, startSubmitting] = useTransition();

  const handleCheckoutClick = () => {
    // Chỉ check đăng nhập ở bước xác nhận đặt đơn, không phải khi thêm món.
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

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 96px" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Giỏ hàng của bạn
        </Typography>

        {!hydrated ? null : isEmpty ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 8,
              color: "text.secondary",
            }}
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 56 }} />
            <Typography>Giỏ hàng của bạn đang trống.</Typography>
            <Button component={Link} href="/" variant="contained">
              Khám phá nhà hàng
            </Button>
          </Box>
        ) : (
          <>
            {restaurantName && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Đặt món từ <strong>{restaurantName}</strong>
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {lines.map((line) => (
                <Box
                  key={line.lineId}
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 72,
                      height: 72,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: "hidden",
                    }}
                  >
                    <Image src={line.foodImage} alt={line.foodName} fill sizes="72px" />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {line.foodName}
                    </Typography>
                    {lineDescription(line) && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {lineDescription(line)}
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formatCurrency(line.unitPrice)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label={`Xoá ${line.foodName}`}
                      onClick={() => removeLine(line.lineId)}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                      >
                        <RemoveOutlinedIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, textAlign: "center" }}>
                        {line.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                      >
                        <AddOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {showCheckoutForm && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Thông tin giao hàng
                </Typography>
                <TextField
                  label="Tên người nhận"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  error={Boolean(formErrors.receiverName)}
                  helperText={formErrors.receiverName}
                  fullWidth
                />
                <TextField
                  label="Số điện thoại"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  error={Boolean(formErrors.receiverPhone)}
                  helperText={formErrors.receiverPhone}
                  fullWidth
                />
                <TextField
                  label="Địa chỉ giao hàng"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  error={Boolean(formErrors.deliveryAddress)}
                  helperText={formErrors.deliveryAddress}
                  fullWidth
                />
                <TextField
                  label="Ghi chú cho đơn hàng (tuỳ chọn)"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Tạm tính</Typography>
              <Typography>{formatCurrency(totalPrice)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6">Tổng cộng (tạm tính + phí ship)</Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(totalPrice + 15000)}
              </Typography>
            </Box>

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
