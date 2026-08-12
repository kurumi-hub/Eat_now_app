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
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import { useCartStore, type CartLine } from "@/store/cartStore";

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
  const restaurantName = useCartStore((state) => state.restaurantName);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const totalPrice = useCartStore((state) => state.totalPrice());

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const showMessage = (message: string) =>
    setSnackbar({ open: true, message });

  // Việc chốt địa chỉ, voucher, phương thức thanh toán và tạo đơn thật sự
  // đều nằm ở trang /checkout (gọi RPC place_order) -- vì bảng orders chỉ
  // cho phép ghi qua RPC (RLS chặn insert trực tiếp từ client), không thể
  // tạo đơn ngay tại trang giỏ hàng này.
  const handleCheckoutClick = () => {
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }

    if (lines.length === 0) {
      showMessage("Giỏ hàng đang trống.");
      return;
    }

    router.push("/checkout");
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
        <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
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
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                      {line.foodName}
                    </Typography>
                    {lineDescription(line) && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {lineDescription(line)}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
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

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Tạm tính</Typography>
              <Typography>{formatCurrency(totalPrice)}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
              Phí giao hàng và mã giảm giá (nếu có) sẽ được tính chính xác ở bước tiếp theo.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckoutClick}
            >
              Tiến hành đặt hàng
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
