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
import * as cartStyles from "./tailwindClasses";

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
    <div className={cartStyles.cartPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={cartStyles.cartMainClassName}>
        <div className={cartStyles.cartTitleRowClassName}>
          <button
            className={cartStyles.cartBackButtonClassName}
            type="button"
            aria-label="Quay lại trang trước"
            onClick={() => router.back()}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <h1 className={cartStyles.cartTitleClassName}>Giỏ hàng của bạn</h1>
        </div>

        <div className={cartStyles.cartLayoutClassName}>
          <section
            className={cartStyles.cartItemsCardClassName}
            aria-labelledby="cart-items-title"
          >
            {cart.items.length > 0 ? (
              <>
                <div className={cartStyles.cartSectionHeadingClassName}>
                  <h2
                    id="cart-items-title"
                    className={cartStyles.cartSectionTitleClassName}
                  >
                    Món đã chọn
                  </h2>
                  <span className={cartStyles.cartRestaurantCountClassName}>
                    {cartRestaurantGroups.length} nhà hàng
                  </span>
                </div>

                <div className={cartStyles.cartRestaurantGroupListClassName}>
                  {cartRestaurantGroups.map((group) => (
                    <section
                      className={cartStyles.cartRestaurantGroupClassName}
                      key={group.restaurantId}
                      aria-label={group.restaurantName}
                    >
                      <div className={cartStyles.cartRestaurantRowClassName}>
                        <StorefrontOutlinedIcon
                          aria-hidden="true"
                          className={cartStyles.cartRestaurantIconClassName}
                        />
                        <Link
                          className={cartStyles.cartRestaurantLinkClassName}
                          href={`/restaurants/${group.restaurantSlug}`}
                        >
                          <h3 className={cartStyles.cartRestaurantNameClassName}>
                            {group.restaurantName}
                          </h3>
                        </Link>
                        <span className={cartStyles.cartRestaurantQuantityClassName}>
                          {group.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          món
                        </span>
                      </div>

                      <div className={cartStyles.cartItemListClassName}>
                        {group.items.map((item) => (
                          <article
                            className={cartStyles.cartItemRowClassName}
                            key={getCartItemKey(item)}
                          >
                            <div className={cartStyles.cartItemMediaClassName}>
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className={cartStyles.cartItemImageClassName}
                              />
                            </div>

                            <div className={cartStyles.cartItemBodyClassName}>
                              <div className={cartStyles.cartItemTopClassName}>
                                <div>
                                  <h3 className={cartStyles.cartItemNameClassName}>
                                    {item.name}
                                  </h3>
                                  <span className={cartStyles.cartItemRestaurantClassName}>
                                    {item.restaurantName}
                                  </span>
                                  {item.optionSummary?.length ? (
                                    <ul className={cartStyles.cartItemOptionsClassName}>
                                      {item.optionSummary.map((option) => (
                                        <li
                                          key={option}
                                          className={cartStyles.cartItemOptionClassName}
                                        >
                                          {option}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                  {item.note ? (
                                    <p className={cartStyles.cartItemNoteClassName}>
                                      Ghi chú: {item.note}
                                    </p>
                                  ) : null}
                                </div>
                                <strong className={cartStyles.cartItemPriceClassName}>
                                  {formatCurrency(item.price)}
                                </strong>
                              </div>

                              <div className={cartStyles.cartItemActionsClassName}>
                                <IconButton
                                  aria-label={`Xóa ${item.name}`}
                                  className={cartStyles.cartRemoveItemButtonClassName}
                                  onClick={() => handleRemoveItem(item)}
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>

                                <div
                                  className={cartStyles.cartQuantityControlClassName}
                                  aria-label={`Số lượng ${item.name}`}
                                >
                                  <IconButton
                                    aria-label={`Giảm số lượng ${item.name}`}
                                    onClick={() => handleDecreaseQuantity(item)}
                                  >
                                    <RemoveOutlinedIcon fontSize="small" />
                                  </IconButton>
                                  <span className={cartStyles.cartQuantityValueClassName}>
                                    {item.quantity}
                                  </span>
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

                <div className={cartStyles.cartNoteFieldClassName}>
                  <label
                    className={cartStyles.cartNoteLabelClassName}
                    htmlFor="restaurant-note"
                  >
                    Ghi chú cho nhà hàng
                  </label>
                  <textarea
                    id="restaurant-note"
                    rows={3}
                    className={cartStyles.cartNoteTextareaClassName}
                    value={cart.restaurantNote}
                    onChange={(event) =>
                      updateRestaurantNote(event.target.value)
                    }
                    placeholder="VD: Không hành, thêm cay..."
                  />
                </div>
              </>
            ) : (
              <div className={cartStyles.cartEmptyStateClassName}>
                <ShoppingCartCheckoutOutlinedIcon
                  aria-hidden="true"
                  className={cartStyles.cartEmptyIconClassName}
                />
                <h2 className={cartStyles.cartEmptyTitleClassName}>
                  Giỏ hàng đang trống
                </h2>
                <p className={cartStyles.cartEmptyTextClassName}>
                  Khám phá nhà hàng và thêm món ngon vào giỏ hàng của bạn.
                </p>
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

          <aside
            className={cartStyles.cartSummaryCardClassName}
            aria-label="Tổng cộng giỏ hàng"
          >
            <h2 className={cartStyles.cartSummaryTitleClassName}>Tổng cộng</h2>
            <div className={cartStyles.cartSummaryRowsClassName}>
              <div className={cartStyles.cartSummaryRowClassName}>
                <span className={cartStyles.cartSummaryLabelClassName}>
                  Tạm tính ({cartItemCount} món)
                </span>
                <strong className={cartStyles.cartSummaryValueClassName}>
                  {formatCurrency(cartSubtotal)}
                </strong>
              </div>
              <div className={cartStyles.cartSummaryRowClassName}>
                <span className={cartStyles.cartSummaryLabelClassName}>
                  Phí giao hàng
                </span>
                <strong className={cartStyles.cartSummaryValueClassName}>
                  {formatCurrency(deliveryFee)}
                </strong>
              </div>
            </div>
            <div className={cartStyles.cartSummaryTotalClassName}>
              <span className={cartStyles.cartSummaryTotalLabelClassName}>
                Tổng thanh toán
              </span>
              <strong className={cartStyles.cartSummaryTotalValueClassName}>
                {formatCurrency(cartTotal)}
              </strong>
            </div>
            <Button
              variant="contained"
              size="large"
              className={cartStyles.cartCheckoutButtonClassName}
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
