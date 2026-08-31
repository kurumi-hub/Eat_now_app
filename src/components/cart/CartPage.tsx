"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import CustomerHeader from "@/components/home/CustomerHeader";
import { getCartItemKey, useCart } from "@/contexts/CartContext";
import type { CartItem, CartRestaurant } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import { mockDeliveryFee } from "./cartData";

type CartPageProps = {
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "info" | "success";
};

type CartRestaurantGroup = CartRestaurant & {
  items: CartItem[];
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

function groupCartItemsByRestaurant(items: CartItem[]) {
  return items.reduce<CartRestaurantGroup[]>((groups, item) => {
    const group = groups.find(
      (currentGroup) => currentGroup.restaurantId === item.restaurantId
    );

    if (group) {
      group.items.push(item);
      return groups;
    }

    return [
      ...groups,
      {
        restaurantId: item.restaurantId,
        restaurantSlug: item.restaurantSlug,
        restaurantName: item.restaurantName,
        items: [item],
      },
    ];
  }, []);
}

export default function CartPage({
  user,
  deliveryLocationLabel,
}: CartPageProps) {
  const router = useRouter();
  const {
    cart,
    decrementQuantity,
    incrementQuantity,
    prepareCheckout,
    removeItem,
    updateRestaurantNote,
  } = useCart();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const cartSubtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart.items]
  );
  const cartItemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );
  const cartRestaurantGroups = useMemo(
    () => groupCartItemsByRestaurant(cart.items),
    [cart.items]
  );
  const deliveryFee = cart.items.length > 0 ? mockDeliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const handleIncreaseQuantity = (item: CartItem) => {
    incrementQuantity(item.foodId, item.restaurantId, item.customizationKey);
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    decrementQuantity(item.foodId, item.restaurantId, item.customizationKey);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.foodId, item.restaurantId, item.customizationKey);
    showSnackbar("Đã xóa món khỏi giỏ hàng.", "success");
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showSnackbar("Giỏ hàng đang trống.");
      return;
    }

    const snapshot = prepareCheckout(cart.restaurantNote);

    if (!snapshot) {
      showSnackbar("Không thể chuẩn bị đơn hàng. Vui lòng thử lại.");
      return;
    }

    router.push("/checkout");
  };

  return (
    <div className="cart-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className="cart-main">
        <div className="cart-title-row">
          <button
            className="cart-back-button"
            type="button"
            aria-label="Quay lại trang trước"
            onClick={() => router.back()}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <h1>Giỏ hàng của bạn</h1>
        </div>

        <div className="cart-layout">
          <section className="cart-items-card" aria-labelledby="cart-items-title">
            {cart.items.length > 0 ? (
              <>
                <div className="cart-section-heading">
                  <h2 id="cart-items-title">Món đã chọn</h2>
                  <span>{cartRestaurantGroups.length} nhà hàng</span>
                </div>

                <div className="cart-restaurant-group-list">
                  {cartRestaurantGroups.map((group) => (
                    <section
                      className="cart-restaurant-group"
                      key={group.restaurantId}
                      aria-label={group.restaurantName}
                    >
                      <div className="cart-restaurant-row">
                        <StorefrontOutlinedIcon aria-hidden="true" />
                        <Link href={`/restaurants/${group.restaurantSlug}`}>
                          <h3>{group.restaurantName}</h3>
                        </Link>
                        <span>
                          {group.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          món
                        </span>
                      </div>

                      <div className="cart-item-list">
                        {group.items.map((item) => (
                          <article
                            className="cart-item-row"
                            key={getCartItemKey(item)}
                          >
                            <div className="cart-item-row__media">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="80px"
                              />
                            </div>

                            <div className="cart-item-row__body">
                              <div className="cart-item-row__top">
                                <div>
                                  <h3>{item.name}</h3>
                                  <span className="cart-item-row__restaurant">
                                    {item.restaurantName}
                                  </span>
                                  {item.optionSummary?.length ? (
                                    <ul className="cart-item-row__options">
                                      {item.optionSummary.map((option) => (
                                        <li key={option}>{option}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                  {item.note ? (
                                    <p className="cart-item-row__note">
                                      Ghi chú: {item.note}
                                    </p>
                                  ) : null}
                                </div>
                                <strong>{formatCurrency(item.price)}</strong>
                              </div>

                              <div className="cart-item-row__actions">
                                <IconButton
                                  aria-label={`Xóa ${item.name}`}
                                  className="cart-remove-item-button"
                                  onClick={() => handleRemoveItem(item)}
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>

                                <div
                                  className="cart-quantity-control"
                                  aria-label={`Số lượng ${item.name}`}
                                >
                                  <IconButton
                                    aria-label={`Giảm số lượng ${item.name}`}
                                    onClick={() => handleDecreaseQuantity(item)}
                                  >
                                    <RemoveOutlinedIcon fontSize="small" />
                                  </IconButton>
                                  <span>{item.quantity}</span>
                                  <IconButton
                                    aria-label={`Tăng số lượng ${item.name}`}
                                    onClick={() => handleIncreaseQuantity(item)}
                                  >
                                    <AddOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="cart-note-field">
                  <label htmlFor="restaurant-note">Ghi chú cho nhà hàng</label>
                  <textarea
                    id="restaurant-note"
                    rows={3}
                    value={cart.restaurantNote}
                    onChange={(event) =>
                      updateRestaurantNote(event.target.value)
                    }
                    placeholder="VD: Không hành, thêm cay..."
                  />
                </div>
              </>
            ) : (
              <div className="cart-empty-state">
                <ShoppingCartCheckoutOutlinedIcon aria-hidden="true" />
                <h2>Giỏ hàng đang trống</h2>
                <p>Khám phá nhà hàng và thêm món ngon vào giỏ hàng của bạn.</p>
                <Button
                  component={Link}
                  href="/search"
                  variant="contained"
                  endIcon={<ArrowForwardOutlinedIcon />}
                >
                  Tìm món ngay
                </Button>
              </div>
            )}
          </section>

          <aside className="cart-summary-card" aria-label="Tổng cộng giỏ hàng">
            <h2>Tổng cộng</h2>
            <div className="cart-summary-card__rows">
              <div>
                <span>Tạm tính ({cartItemCount} món)</span>
                <strong>{formatCurrency(cartSubtotal)}</strong>
              </div>
              <div>
                <span>Phí giao hàng</span>
                <strong>{formatCurrency(deliveryFee)}</strong>
              </div>
            </div>
            <div className="cart-summary-card__total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
            <Button
              variant="contained"
              size="large"
              className="cart-checkout-button"
              endIcon={<ArrowForwardOutlinedIcon />}
              disabled={cart.items.length === 0}
              onClick={handleCheckout}
            >
              Thanh toán
            </Button>
          </aside>
        </div>
      </main>

      <CustomerFooter onPlaceholder={showSnackbar} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
