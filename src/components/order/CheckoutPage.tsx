"use client";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  cartRestaurant as temporaryCartRestaurant,
  mockCartItems,
  mockRestaurantNote,
} from "@/components/cart/cartData";
import CustomerHeader from "@/components/home/CustomerHeader";
import {
  calculateVoucherDiscount,
  type VoucherItem,
} from "@/components/voucher/voucherData";
import { useCart } from "@/contexts/CartContext";
import type { CartItem, CartRestaurant } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import VoucherPickerModal from "./VoucherPickerModal";
import {
  CheckoutField,
  CheckoutFormValues,
  PaymentMethod,
  formatOrderCurrency,
  getCheckoutItemCount,
  getCheckoutSubtotal,
  hasCheckoutChanged,
  mockDeliveryFee,
  validateCheckoutValues,
} from "./orderData";

type CheckoutPageProps = {
  user: PublicUser | null;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "info" | "success" | "error";
};

type DeliveryFormValues = Omit<
  CheckoutFormValues,
  "restaurantNote" | "paymentMethod"
>;

const SUBMISSION_LOADING_DELAY_MS = 3500;

type CheckoutCart = {
  restaurant: CartRestaurant | null;
  items: CartItem[];
  restaurantNote: string;
};

const temporaryCheckoutCart: CheckoutCart = {
  restaurant: {
    restaurantId: temporaryCartRestaurant.id,
    restaurantSlug: temporaryCartRestaurant.slug,
    restaurantName: temporaryCartRestaurant.name,
  },
  items: mockCartItems.map(({ foodId, image, name, price, quantity }) => ({
    foodId,
    image,
    name,
    price,
    quantity,
  })),
  restaurantNote: mockRestaurantNote,
};

function getInitialValues(user: PublicUser | null): DeliveryFormValues {
  return {
    recipientName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    deliveryNote: "",
  };
}

export default function CheckoutPage({ user }: CheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    cart,
    checkoutSnapshot,
    createOrder,
    prepareCheckout,
    updateRestaurantNote,
  } = useCart();
  const scenario = searchParams.get("scenario");
  const [values, setValues] = useState<DeliveryFormValues>(() =>
    getInitialValues(user)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>(
    {}
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [informationChangedOpen, setInformationChangedOpen] = useState(
    () => scenario === "information-changed"
  );
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherPickerOpen, setVoucherPickerOpen] = useState(false);

  const checkoutCart = useMemo<CheckoutCart>(() => {
    if (cart.items.length > 0) {
      return cart;
    }

    if (checkoutSnapshot) {
      return {
        restaurant: checkoutSnapshot.restaurant,
        items: checkoutSnapshot.items,
        restaurantNote: cart.restaurantNote || checkoutSnapshot.restaurantNote,
      };
    }

    return {
      ...temporaryCheckoutCart,
      restaurantNote:
        cart.restaurantNote || temporaryCheckoutCart.restaurantNote,
    };
  }, [cart, checkoutSnapshot]);

  const checkoutValues = useMemo<CheckoutFormValues>(
    () => ({
      ...values,
      restaurantNote: checkoutCart.restaurantNote,
      paymentMethod,
    }),
    [checkoutCart.restaurantNote, paymentMethod, values]
  );

  const subtotal = useMemo(
    () => getCheckoutSubtotal(checkoutCart.items),
    [checkoutCart.items]
  );
  const itemCount = useMemo(
    () => getCheckoutItemCount(checkoutCart.items),
    [checkoutCart.items]
  );
  const deliveryFee = checkoutCart.items.length > 0 ? mockDeliveryFee : 0;
  const discount = appliedVoucher?.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApplyVoucher = (codeOverride?: string) => {
    const targetCode = (codeOverride ?? voucherCode).trim();
    if (!targetCode) {
      setVoucherError("Vui lòng nhập mã ưu đãi.");
      return;
    }

    const result = calculateVoucherDiscount(targetCode, subtotal, deliveryFee);
    if (!result.isValid) {
      setVoucherError(result.errorMessage || "Mã ưu đãi không hợp lệ.");
      showSnackbar(result.errorMessage || "Mã ưu đãi không hợp lệ.", "error");
      return;
    }

    setAppliedVoucher({
      code: result.voucher?.code || targetCode.toUpperCase(),
      discount: result.discount,
      title: result.voucher?.title || "Giảm giá",
    });
    setVoucherError("");
    setVoucherCode("");
    showSnackbar(
      `Áp dụng mã ${result.voucher?.code || targetCode.toUpperCase()} thành công!`,
      "success"
    );
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
    showSnackbar("Đã gỡ bỏ mã ưu đãi.");
  };

  const handleSelectVoucherFromModal = (voucher: VoucherItem) => {
    setVoucherPickerOpen(false);
    handleApplyVoucher(voucher.code);
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const updateField = (field: keyof DeliveryFormValues, value: string) => {
    const nextValues: DeliveryFormValues = { ...values, [field]: value };

    setValues(nextValues);

    if (hasSubmitted) {
      setErrors(
        validateCheckoutValues({
          ...nextValues,
          restaurantNote: checkoutCart.restaurantNote,
          paymentMethod: "cod",
        }).errors
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    const result = validateCheckoutValues(checkoutValues);
    setErrors(result.errors);

    if (!result.isValid) {
      return;
    }

    if (
      scenario === "information-changed" ||
      (cart.items.length > 0 && hasCheckoutChanged(checkoutSnapshot, cart.items))
    ) {
      setInformationChangedOpen(true);
      return;
    }

    let hasStartedNavigation = false;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, SUBMISSION_LOADING_DELAY_MS)
      );

      if (scenario === "creation-error") {
        hasStartedNavigation = true;
        router.push("/orders/error");
        return;
      }

      const createdOrder = createOrder({
        ...result.normalized,
        paymentMethod,
        discount,
        appliedVoucherCode: appliedVoucher?.code || null,
      });
      hasStartedNavigation = true;
      router.push(`/orders/success?orderId=${createdOrder.id}`);
    } catch {
      hasStartedNavigation = true;
      router.push("/orders/error");
    } finally {
      if (!hasStartedNavigation) {
        setIsSubmitting(false);
      }
    }
  };

  const handleRefreshSnapshot = () => {
    if (cart.items.length > 0) {
      prepareCheckout(checkoutCart.restaurantNote);
    }

    setInformationChangedOpen(false);
    router.replace("/checkout", { scroll: false });
    showSnackbar("Đã cập nhật lại tóm tắt đơn hàng.", "success");
  };

  const hasValidationErrors = Object.values(errors).some(Boolean);

  return (
    <div className="order-checkout-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="order-checkout-main">
        <div className="order-checkout-title-row">
          <button
            className="order-back-button"
            type="button"
            aria-label="Quay lại giỏ hàng"
            onClick={() => router.push("/cart")}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <span>Thanh toán đơn hàng</span>
            <h1>Hoàn tất đơn hàng</h1>
          </div>
        </div>

        {checkoutCart.items.length === 0 ? (
          <section className="order-empty-card">
            <ReceiptLongOutlinedIcon aria-hidden="true" />
            <h2>Chưa có món nào để thanh toán</h2>
            <p>
              Giỏ hàng hiện đang trống. Hãy chọn món trước khi tạo đơn hàng mới.
            </p>
            <Button
              component={Link}
              href="/search"
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
            >
              Tìm món ngay
            </Button>
          </section>
        ) : (
          <form className="order-checkout-layout" onSubmit={handleSubmit}>
            {/* Left Column: Delivery, Notes & Payment */}
            <div className="flex flex-col gap-lg">
              <section
                className="order-checkout-panel"
                aria-labelledby="delivery-info-title"
              >
                <div className="order-panel-heading">
                  <HomeWorkOutlinedIcon aria-hidden="true" />
                  <div>
                    <span>Bước 1</span>
                    <h2 id="delivery-info-title">Thông tin giao hàng</h2>
                  </div>
                </div>

                {hasValidationErrors ? (
                  <Alert
                    severity="error"
                    className="order-checkout-validation-summary"
                    icon={<ErrorOutlineOutlinedIcon />}
                  >
                    Vui lòng kiểm tra lại thông tin giao hàng trước khi đặt món.
                  </Alert>
                ) : null}

                <div className="order-form-grid">
                  <div className="order-form-field">
                    <label htmlFor="recipientName">Người nhận</label>
                    <input
                      id="recipientName"
                      name="recipientName"
                      type="text"
                      value={values.recipientName}
                      aria-invalid={Boolean(errors.recipientName)}
                      className={errors.recipientName ? "is-invalid" : ""}
                      onChange={(event) =>
                        updateField("recipientName", event.target.value)
                      }
                      placeholder="Nhập họ và tên người nhận"
                    />
                    {errors.recipientName ? (
                      <p>{errors.recipientName}</p>
                    ) : null}
                  </div>

                  <div className="order-form-field">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={values.phone}
                      aria-invalid={Boolean(errors.phone)}
                      className={errors.phone ? "is-invalid" : ""}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="0901234567"
                    />
                    {errors.phone ? <p>{errors.phone}</p> : null}
                  </div>
                </div>

                <div className="order-form-field">
                  <label htmlFor="address">Địa chỉ giao hàng</label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={values.address}
                    aria-invalid={Boolean(errors.address)}
                    className={errors.address ? "is-invalid" : ""}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  />
                  {errors.address ? <p>{errors.address}</p> : null}
                </div>

                <div className="order-form-field">
                  <label htmlFor="deliveryNote">Ghi chú giao hàng</label>
                  <input
                    id="deliveryNote"
                    name="deliveryNote"
                    type="text"
                    value={values.deliveryNote}
                    onChange={(event) =>
                      updateField("deliveryNote", event.target.value)
                    }
                    placeholder="Ví dụ: Gọi khi đến nơi..."
                  />
                </div>
              </section>

              <section
                className="order-checkout-panel"
                aria-labelledby="note-title"
              >
                <div className="order-panel-heading">
                  <NotesOutlinedIcon aria-hidden="true" />
                  <div>
                    <span>Bước 2</span>
                    <h2 id="note-title">Ghi chú cho nhà hàng</h2>
                  </div>
                </div>
                <div className="order-form-field">
                  <label htmlFor="restaurantNote">Yêu cầu chế biến</label>
                  <textarea
                    id="restaurantNote"
                    name="restaurantNote"
                    rows={2}
                    value={checkoutCart.restaurantNote}
                    onChange={(event) =>
                      updateRestaurantNote(event.target.value)
                    }
                    placeholder="Ví dụ: Không hành, thêm ớt..."
                  />
                </div>
              </section>

              {/* Payment Methods */}
              <section
                className="order-checkout-panel"
                aria-labelledby="payment-title"
              >
                <div className="order-panel-heading">
                  <PaymentsOutlinedIcon aria-hidden="true" />
                  <div>
                    <span>Bước 3</span>
                    <h2 id="payment-title">Phương thức thanh toán</h2>
                  </div>
                </div>

                <div className="order-payment-options">
                  <label
                    className={`order-payment-option ${
                      paymentMethod === "cod" ? "is-selected" : ""
                    }`}
                    id="payment-cod"
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className="order-payment-option__icon">
                      <LocalShippingOutlinedIcon />
                    </div>
                    <div className="order-payment-option__info">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <small>Thanh toán tiền mặt cho tài xế</small>
                    </div>
                    <div className="order-payment-option__radio">
                      {paymentMethod === "cod" ? (
                        <RadioButtonCheckedIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )}
                    </div>
                  </label>

                  <label
                    className={`order-payment-option ${
                      paymentMethod === "vnpay" ? "is-selected" : ""
                    }`}
                    id="payment-vnpay"
                    onClick={() => setPaymentMethod("vnpay")}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                    />
                    <div className="order-payment-option__icon">
                      <AccountBalanceWalletOutlinedIcon />
                    </div>
                    <div className="order-payment-option__info">
                      <strong>Thanh toán qua VNPAY</strong>
                      <small>
                        Thanh toán an toàn qua ứng dụng ngân hàng hoặc thẻ
                      </small>
                    </div>
                    <div className="order-payment-option__radio">
                      {paymentMethod === "vnpay" ? (
                        <RadioButtonCheckedIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )}
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <aside
              className="order-summary-card"
              aria-label="Tóm tắt đơn hàng"
            >
              <div className="order-summary-heading">
                <ReceiptLongOutlinedIcon aria-hidden="true" />
                <h2>Tóm tắt đơn hàng</h2>
              </div>

              {checkoutCart.restaurant ? (
                <Link
                  className="order-summary-restaurant"
                  href={`/restaurants/${checkoutCart.restaurant.restaurantSlug}`}
                >
                  <StorefrontOutlinedIcon fontSize="small" />
                  {checkoutCart.restaurant.restaurantName}
                </Link>
              ) : null}

              <div className="order-summary-list">
                {checkoutCart.items.map((item) => (
                  <article className="order-summary-item" key={item.foodId}>
                    <div className="order-summary-item__media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <span>x{item.quantity}</span>
                    </div>
                    <strong>
                      {formatOrderCurrency(item.price * item.quantity)}
                    </strong>
                  </article>
                ))}
              </div>

              <div className="order-summary-rows">
                <div>
                  <span>Tạm tính ({itemCount} món)</span>
                  <strong>{formatOrderCurrency(subtotal)}</strong>
                </div>
                <div>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(deliveryFee)}</strong>
                </div>
                {discount > 0 && appliedVoucher ? (
                  <div className="order-summary-row--discount">
                    <span>Ưu đãi ({appliedVoucher.code})</span>
                    <strong className="order-discount-text">
                      -{formatOrderCurrency(discount)}
                    </strong>
                  </div>
                ) : null}
              </div>

              {/* Voucher Section */}
              <div className="order-voucher-section">
                <div className="order-voucher-header">
                  <LocalOfferOutlinedIcon fontSize="small" />
                  <span>Ưu đãi &amp; Voucher</span>
                </div>

                {appliedVoucher ? (
                  <div className="order-voucher-applied">
                    <div className="order-voucher-applied__info">
                      <ConfirmationNumberOutlinedIcon fontSize="small" />
                      <div>
                        <strong>{appliedVoucher.code}</strong>
                        <span>
                          {appliedVoucher.title} (-{formatOrderCurrency(discount)})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="order-voucher-applied__remove"
                      onClick={handleRemoveVoucher}
                      aria-label="Gỡ mã ưu đãi"
                    >
                      <CloseOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div className="order-voucher-form">
                    <div className="order-voucher-input-row">
                      <input
                        type="text"
                        className={`order-voucher-input ${
                          voucherError ? "is-invalid" : ""
                        }`}
                        placeholder="Nhập mã ưu đãi"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value);
                          if (voucherError) setVoucherError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyVoucher();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="order-voucher-apply-btn"
                        onClick={() => handleApplyVoucher()}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError ? (
                      <p className="order-voucher-error-msg">{voucherError}</p>
                    ) : null}
                    <button
                      type="button"
                      className="order-voucher-picker-link"
                      onClick={() => setVoucherPickerOpen(true)}
                    >
                      Chọn hoặc nhập mã &gt;
                    </button>
                  </div>
                )}
              </div>

              <div className="order-summary-total">
                <span>Tổng cộng</span>
                <strong>{formatOrderCurrency(total)}</strong>
              </div>

              <Button
                type="submit"
                variant="contained"
                size="large"
                className="order-submit-button"
                disabled={isSubmitting || checkoutCart.items.length === 0}
                endIcon={<ArrowForwardOutlinedIcon />}
                id="submit-order-btn"
              >
                {paymentMethod === "vnpay"
                  ? "Thanh toán qua VNPAY"
                  : "Xác nhận đặt hàng"}
              </Button>
              <p className="order-checkout-terms">
                {paymentMethod === "vnpay"
                  ? "Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch."
                  : "Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của EatNow."}
              </p>
            </aside>
          </form>
        )}
      </main>

      {informationChangedOpen ? (
        <div
          className="order-information-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="order-information-card">
            <div className="order-information-icon">
              <ReceiptLongOutlinedIcon aria-hidden="true" />
            </div>
            <h2>Thông tin đơn hàng đã thay đổi</h2>
            <p>
              Một vài thông tin trong giỏ hàng đã được cập nhật. Vui lòng làm
              mới tóm tắt đơn trước khi tiếp tục đặt món.
            </p>
            <Button
              variant="contained"
              className="order-information-primary"
              onClick={handleRefreshSnapshot}
            >
              Cập nhật lại đơn hàng
            </Button>
            <Button
              variant="text"
              className="order-information-secondary"
              onClick={() => router.push("/cart")}
            >
              Quay lại giỏ hàng
            </Button>
          </div>
        </div>
      ) : null}

      {isSubmitting ? (
        <div
          className="order-submission-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="order-submission-card">
            <div className="order-submission-spinner" aria-hidden="true">
              <span className="order-submission-spinner-ring" />
            </div>
            <h2>
              {paymentMethod === "vnpay"
                ? "Đang chuyển đến VNPAY..."
                : "Đang tạo đơn hàng..."}
            </h2>
            <p>
              {paymentMethod === "vnpay"
                ? "Vui lòng không đóng hoặc tải lại trang"
                : "Vui lòng không đóng hoặc tải lại trang"}
            </p>
            <div className="order-submission-progress" aria-hidden="true">
              <span className="order-submission-progress-bar" />
            </div>
          </div>
        </div>
      ) : null}

      <VoucherPickerModal
        open={voucherPickerOpen}
        onClose={() => setVoucherPickerOpen(false)}
        onSelect={handleSelectVoucherFromModal}
        appliedCode={appliedVoucher?.code}
      />

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
