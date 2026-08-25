"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadCartFoodImagesAction } from "@/app/cart/actions";
import type { PublicUser } from "@/types/auth";
import { useCartStore, type CartLine } from "@/store/cartStore";
import { useCartSession } from "@/store/useCartSession";
import { signalNavigationStart } from "@/utils/navigationFeedback";
import { isRealFoodImage } from "@/utils/foodImage";

type CartPageProps = { user: PublicUser | null };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function lineDescription(line: CartLine) {
  const parts: string[] = [];
  if (line.size) parts.push(`Size ${line.size.name}`);
  if (line.toppings.length > 0) parts.push(line.toppings.map((t) => t.name).join(", "));
  if (line.note) parts.push(`Ghi chú: ${line.note}`);
  return parts.join(" · ");
}

export default function CartPage({ user }: CartPageProps) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const updateFoodImages = useCartStore((state) => state.updateFoodImages);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const cartReady = useCartSession(user?.id ?? null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const foodIdsKey = useMemo(
    () => [...new Set(lines.map((line) => line.foodId))].sort().join(","),
    [lines]
  );

  useEffect(() => {
    if (!cartReady || !foodIdsKey) return;
    let cancelled = false;
    loadCartFoodImagesAction(foodIdsKey.split(",")).then((result) => {
      if (!cancelled && result.ok) updateFoodImages(result.images);
    });
    return () => { cancelled = true; };
  }, [cartReady, foodIdsKey, updateFoodImages]);

  const handleCheckoutClick = () => {
    if (!user) {
      signalNavigationStart();
      router.push("/login?next=/checkout");
      return;
    }
    if (lines.length === 0) {
      setSnackbar({ open: true, message: "Giỏ hàng đang trống." });
      return;
    }
    signalNavigationStart();
    router.push("/checkout");
  };

  const isEmpty = cartReady && lines.length === 0;

  return (
    <div className="cart-page">
      <main className="cart-main">
        <div className="cart-title-row">
          <Link className="cart-back-button" href="/" aria-label="Quay lại trang chủ"><ArrowBackOutlinedIcon /></Link>
          <div><span>Đơn hàng của bạn</span><h1>Giỏ hàng</h1></div>
        </div>

        {!cartReady ? (
          <div className="cart-loading-card" aria-label="Đang tải giỏ hàng" />
        ) : isEmpty ? (
          <section className="cart-empty-state">
            <ShoppingCartOutlinedIcon />
            <h2>Giỏ hàng đang trống</h2>
            <p>Khám phá các nhà hàng và thêm món bạn yêu thích vào giỏ nhé.</p>
            <Button className="cart-checkout-button" component={Link} href="/" variant="contained">Khám phá nhà hàng</Button>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-card">
              <div className="cart-restaurant-row">
                <StorefrontOutlinedIcon />
                <div><span>Đặt món tại</span><h2>{restaurantName || "Nhà hàng"}</h2></div>
              </div>
              <div className="cart-item-list">
                {lines.map((line) => (
                  <article className="cart-item-row" key={line.lineId}>
                    <div className="cart-item-row__media">
                      {isRealFoodImage(line.foodImage) ? (
                        <Image src={line.foodImage} alt={line.foodName} fill unoptimized sizes="88px" />
                      ) : (
                        <span className="cart-item-row__image-placeholder"><RestaurantMenuOutlinedIcon /></span>
                      )}
                    </div>
                    <div className="cart-item-row__body">
                      <div className="cart-item-row__top">
                        <div>
                          <h3>{line.foodName}</h3>
                          {lineDescription(line) && <p>{lineDescription(line)}</p>}
                          <small>{formatCurrency(line.unitPrice)} / phần</small>
                        </div>
                        <strong>{formatCurrency(line.unitPrice * line.quantity)}</strong>
                      </div>
                      <div className="cart-item-row__actions">
                        <div className="cart-quantity-control" aria-label={`Số lượng ${line.foodName}`}>
                          <IconButton aria-label="Giảm số lượng" onClick={() => updateQuantity(line.lineId, line.quantity - 1)}><RemoveOutlinedIcon fontSize="small" /></IconButton>
                          <span>{line.quantity}</span>
                          <IconButton aria-label="Tăng số lượng" onClick={() => updateQuantity(line.lineId, line.quantity + 1)}><AddOutlinedIcon fontSize="small" /></IconButton>
                        </div>
                        <IconButton className="cart-remove-item-button" aria-label={`Xóa ${line.foodName}`} onClick={() => removeLine(line.lineId)}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="cart-summary-card">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="cart-summary-card__rows">
                <div><span>{lines.length} món</span><strong>{formatCurrency(totalPrice)}</strong></div>
                <div><span>Phí giao hàng</span><small>Tính ở bước tiếp theo</small></div>
                <div><span>Voucher</span><small>Chọn khi xác nhận đơn</small></div>
              </div>
              <div className="cart-summary-card__total"><span>Tạm tính</span><strong>{formatCurrency(totalPrice)}</strong></div>
              <Button className="cart-checkout-button" variant="contained" fullWidth onClick={handleCheckoutClick}>Tiến hành đặt hàng</Button>
              <p className="cart-summary-note">Tổng tiền cuối cùng sẽ được cập nhật theo địa chỉ giao hàng và voucher.</p>
            </aside>
          </div>
        )}
      </main>

      <Snackbar open={snackbar.open} autoHideDuration={2600} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="info" variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
