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
import { getCartItemKey, useCart } from "@/contexts/CartContext";
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
import * as orderStyles from "./tailwindClasses";

type CheckoutPageProps = {
  user: PublicUser | null;
  deliveryLocationLabel?: string;
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

type CheckoutRestaurantGroup = CartRestaurant & {
  items: CartItem[];
};

const temporaryCheckoutRestaurant: CartRestaurant = {
  restaurantId: temporaryCartRestaurant.id,
  restaurantSlug: temporaryCartRestaurant.slug,
  restaurantName: temporaryCartRestaurant.name,
};

const temporaryCheckoutCart: CheckoutCart = {
  restaurant: temporaryCheckoutRestaurant,
  items: mockCartItems.map(({ foodId, image, name, price, quantity }) => ({
    foodId,
    image,
    name,
    price,
    quantity,
    restaurantId: temporaryCheckoutRestaurant.restaurantId,
    restaurantSlug: temporaryCheckoutRestaurant.restaurantSlug,
    restaurantName: temporaryCheckoutRestaurant.restaurantName,
  })),
  restaurantNote: mockRestaurantNote,
};

function groupCartItemsByRestaurant(items: CartItem[]) {
  return items.reduce<CheckoutRestaurantGroup[]>((groups, item) => {
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

function getInitialValues(user: PublicUser | null): DeliveryFormValues {
  return {
    recipientName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    deliveryNote: "",
  };
}

export default function CheckoutPage({
  user,
  deliveryLocationLabel,
}: CheckoutPageProps) {
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
  const checkoutRestaurantGroups = useMemo(
    () => groupCartItemsByRestaurant(checkoutCart.items),
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
    <div className={orderStyles.orderPageClassName()}>
      <CustomerHeader
        user={user}
        onPlaceholder={showSnackbar}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={orderStyles.orderCheckoutMainClassName}>
        <div className={orderStyles.orderCheckoutTitleRowClassName}>
          <button
            className={orderStyles.orderBackButtonClassName}
            type="button"
            aria-label="Quay lại giỏ hàng"
            onClick={() => router.push("/cart")}
          >
            <ArrowBackOutlinedIcon />
          </button>
          <div>
            <span className={orderStyles.orderTitleEyebrowClassName}>
              Thanh toán đơn hàng
            </span>
            <h1 className={orderStyles.orderCheckoutTitleClassName}>
              Hoàn tất đơn hàng
            </h1>
          </div>
        </div>

        {checkoutCart.items.length === 0 ? (
          <section className={orderStyles.orderEmptyCardClassName}>
            <ReceiptLongOutlinedIcon
              aria-hidden="true"
              className={orderStyles.orderEmptyIconClassName}
            />
            <h2 className={orderStyles.orderEmptyTitleClassName}>
              Chưa có món nào để thanh toán
            </h2>
            <p className={orderStyles.orderEmptyTextClassName}>
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
          <form
            className={orderStyles.orderCheckoutLayoutClassName}
            onSubmit={handleSubmit}
          >
            {/* Left Column: Delivery, Notes & Payment */}
            <div className={orderStyles.orderCheckoutColumnClassName}>
              <section
                className={orderStyles.orderCheckoutPanelClassName}
                aria-labelledby="delivery-info-title"
              >
                <div className={orderStyles.orderPanelHeadingClassName}>
                  <HomeWorkOutlinedIcon
                    aria-hidden="true"
                    className={orderStyles.orderPanelIconClassName}
                  />
                  <div>
                    <span className={orderStyles.orderPanelStepClassName}>
                      Bước 1
                    </span>
                    <h2
                      id="delivery-info-title"
                      className={orderStyles.orderPanelTitleClassName}
                    >
                      Thông tin giao hàng
                    </h2>
                  </div>
                </div>

                {hasValidationErrors ? (
                  <Alert
                    severity="error"
                    className={orderStyles.orderCheckoutValidationSummaryClassName}
                    icon={<ErrorOutlineOutlinedIcon />}
                  >
                    Vui lòng kiểm tra lại thông tin giao hàng trước khi đặt món.
                  </Alert>
                ) : null}

                <div className={orderStyles.orderFormGridClassName}>
                  <div className={orderStyles.orderFormFieldClassName}>
                    <label
                      className={orderStyles.orderFormLabelClassName}
                      htmlFor="recipientName"
                    >
                      Người nhận
                    </label>
                    <input
                      id="recipientName"
                      name="recipientName"
                      type="text"
                      value={values.recipientName}
                      aria-invalid={Boolean(errors.recipientName)}
                      data-invalid={Boolean(errors.recipientName)}
                      className={orderStyles.orderFormInputClassName(
                        Boolean(errors.recipientName)
                      )}
                      onChange={(event) =>
                        updateField("recipientName", event.target.value)
                      }
                      placeholder="Nhập họ và tên người nhận"
                    />
                    {errors.recipientName ? (
                      <p className={orderStyles.orderFormErrorClassName}>
                        {errors.recipientName}
                      </p>
                    ) : null}
                  </div>

                  <div className={orderStyles.orderFormFieldClassName}>
                    <label
                      className={orderStyles.orderFormLabelClassName}
                      htmlFor="phone"
                    >
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={values.phone}
                      aria-invalid={Boolean(errors.phone)}
                      data-invalid={Boolean(errors.phone)}
                      className={orderStyles.orderFormInputClassName(
                        Boolean(errors.phone)
                      )}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="0901234567"
                    />
                    {errors.phone ? (
                      <p className={orderStyles.orderFormErrorClassName}>
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={orderStyles.orderFormFieldClassName}>
                  <label
                    className={orderStyles.orderFormLabelClassName}
                    htmlFor="address"
                  >
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={values.address}
                    aria-invalid={Boolean(errors.address)}
                    data-invalid={Boolean(errors.address)}
                    className={orderStyles.orderFormTextareaClassName(
                      Boolean(errors.address)
                    )}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  />
                  {errors.address ? (
                    <p className={orderStyles.orderFormErrorClassName}>
                      {errors.address}
                    </p>
                  ) : null}
                </div>

                <div className={orderStyles.orderFormFieldClassName}>
                  <label
                    className={orderStyles.orderFormLabelClassName}
                    htmlFor="deliveryNote"
                  >
                    Ghi chú giao hàng
                  </label>
                  <input
                    id="deliveryNote"
                    name="deliveryNote"
                    type="text"
                    value={values.deliveryNote}
                    className={orderStyles.orderFormInputClassName()}
                    onChange={(event) =>
                      updateField("deliveryNote", event.target.value)
                    }
                    placeholder="Ví dụ: Gọi khi đến nơi..."
                  />
                </div>
              </section>

              <section
                className={orderStyles.orderCheckoutPanelClassName}
                aria-labelledby="note-title"
              >
                <div className={orderStyles.orderPanelHeadingClassName}>
                  <NotesOutlinedIcon
                    aria-hidden="true"
                    className={orderStyles.orderPanelIconClassName}
                  />
                  <div>
                    <span className={orderStyles.orderPanelStepClassName}>
                      Bước 2
                    </span>
                    <h2
                      id="note-title"
                      className={orderStyles.orderPanelTitleClassName}
                    >
                      Ghi chú cho nhà hàng
                    </h2>
                  </div>
                </div>
                <div className={orderStyles.orderFormFieldClassName}>
                  <label
                    className={orderStyles.orderFormLabelClassName}
                    htmlFor="restaurantNote"
                  >
                    Yêu cầu chế biến
                  </label>
                  <textarea
                    id="restaurantNote"
                    name="restaurantNote"
                    rows={2}
                    value={checkoutCart.restaurantNote}
                    className={orderStyles.orderFormTextareaClassName()}
                    onChange={(event) =>
                      updateRestaurantNote(event.target.value)
                    }
                    placeholder="Ví dụ: Không hành, thêm ớt..."
                  />
                </div>
              </section>

              {/* Payment Methods */}
              <section
                className={orderStyles.orderCheckoutPanelClassName}
                aria-labelledby="payment-title"
              >
                <div className={orderStyles.orderPanelHeadingClassName}>
                  <PaymentsOutlinedIcon
                    aria-hidden="true"
                    className={orderStyles.orderPanelIconClassName}
                  />
                  <div>
                    <span className={orderStyles.orderPanelStepClassName}>
                      Bước 3
                    </span>
                    <h2
                      id="payment-title"
                      className={orderStyles.orderPanelTitleClassName}
                    >
                      Phương thức thanh toán
                    </h2>
                  </div>
                </div>

                <div className={orderStyles.orderPaymentOptionsClassName}>
                  <label
                    className={orderStyles.orderPaymentOptionClassName(
                      paymentMethod === "cod"
                    )}
                    data-selected={paymentMethod === "cod"}
                    id="payment-cod"
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <input
                      className={orderStyles.orderPaymentInputClassName}
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div
                      className={orderStyles.orderPaymentIconClassName(
                        paymentMethod === "cod"
                      )}
                    >
                      <LocalShippingOutlinedIcon />
                    </div>
                    <div className={orderStyles.orderPaymentInfoClassName}>
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <small>Thanh toán tiền mặt cho tài xế</small>
                    </div>
                    <div
                      className={orderStyles.orderPaymentRadioClassName(
                        paymentMethod === "cod"
                      )}
                    >
                      {paymentMethod === "cod" ? (
                        <RadioButtonCheckedIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )}
                    </div>
                  </label>

                  <label
                    className={orderStyles.orderPaymentOptionClassName(
                      paymentMethod === "vnpay"
                    )}
                    data-selected={paymentMethod === "vnpay"}
                    id="payment-vnpay"
                    onClick={() => setPaymentMethod("vnpay")}
                  >
                    <input
                      className={orderStyles.orderPaymentInputClassName}
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                    />
                    <div
                      className={orderStyles.orderPaymentIconClassName(
                        paymentMethod === "vnpay"
                      )}
                    >
                      <AccountBalanceWalletOutlinedIcon />
                    </div>
                    <div className={orderStyles.orderPaymentInfoClassName}>
                      <strong>Thanh toán qua VNPAY</strong>
                      <small>
                        Thanh toán an toàn qua ứng dụng ngân hàng hoặc thẻ
                      </small>
                    </div>
                    <div
                      className={orderStyles.orderPaymentRadioClassName(
                        paymentMethod === "vnpay"
                      )}
                    >
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
              className={orderStyles.orderSummaryCardClassName}
              aria-label="Tóm tắt đơn hàng"
            >
              <div className={orderStyles.orderSummaryHeadingClassName}>
                <ReceiptLongOutlinedIcon
                  aria-hidden="true"
                  className={orderStyles.orderPanelIconClassName}
                />
                <h2 className={orderStyles.orderPanelTitleClassName}>
                  Tóm tắt đơn hàng
                </h2>
              </div>

              <div className={orderStyles.orderSummaryListClassName}>
                {checkoutRestaurantGroups.map((group) => (
                  <section
                    className={orderStyles.orderSummaryGroupClassName}
                    key={group.restaurantId}
                    aria-label={group.restaurantName}
                  >
                    <Link
                      className={orderStyles.orderSummaryRestaurantClassName}
                      href={`/restaurants/${group.restaurantSlug}`}
                    >
                      <StorefrontOutlinedIcon fontSize="small" />
                      {group.restaurantName}
                    </Link>

                    <div className={orderStyles.orderSummaryGroupItemsClassName}>
                      {group.items.map((item) => (
                        <article
                          className={orderStyles.orderSummaryItemClassName}
                          key={getCartItemKey(item)}
                        >
                          <div className={orderStyles.orderSummaryItemMediaClassName}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className={orderStyles.orderSummaryItemImageClassName}
                            />
                          </div>
                          <div>
                            <h3 className={orderStyles.orderSummaryItemTitleClassName}>
                              {item.name}
                            </h3>
                            <span className={orderStyles.orderSummaryItemMetaClassName}>
                              {item.restaurantName} - x{item.quantity}
                            </span>
                            {item.optionSummary?.length ? (
                              <small
                                className={orderStyles.orderSummaryItemOptionsClassName}
                              >
                                {item.optionSummary.join(", ")}
                              </small>
                            ) : null}
                            {item.note ? (
                              <small
                                className={orderStyles.orderSummaryItemNoteClassName}
                              >
                                Ghi chú: {item.note}
                              </small>
                            ) : null}
                          </div>
                          <strong className={orderStyles.orderSummaryItemPriceClassName}>
                            {formatOrderCurrency(item.price * item.quantity)}
                          </strong>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className={orderStyles.orderSummaryRowsClassName}>
                <div className={orderStyles.orderSummaryRowClassName}>
                  <span>Tạm tính ({itemCount} món)</span>
                  <strong>{formatOrderCurrency(subtotal)}</strong>
                </div>
                <div className={orderStyles.orderSummaryRowClassName}>
                  <span>Phí giao hàng</span>
                  <strong>{formatOrderCurrency(deliveryFee)}</strong>
                </div>
                {discount > 0 && appliedVoucher ? (
                  <div className={orderStyles.orderSummaryDiscountRowClassName}>
                    <span>Ưu đãi ({appliedVoucher.code})</span>
                    <strong className={orderStyles.orderDiscountTextClassName}>
                      -{formatOrderCurrency(discount)}
                    </strong>
                  </div>
                ) : null}
              </div>

              {/* Voucher Section */}
              <div className={orderStyles.orderVoucherSectionClassName}>
                <div className={orderStyles.orderVoucherHeaderClassName}>
                  <LocalOfferOutlinedIcon fontSize="small" />
                  <span>Ưu đãi &amp; Voucher</span>
                </div>

                {appliedVoucher ? (
                  <div className={orderStyles.orderVoucherAppliedClassName}>
                    <div className={orderStyles.orderVoucherAppliedInfoClassName}>
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
                      className={orderStyles.orderVoucherRemoveButtonClassName}
                      onClick={handleRemoveVoucher}
                      aria-label="Gỡ mã ưu đãi"
                    >
                      <CloseOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div className={orderStyles.orderVoucherFormClassName}>
                    <div className={orderStyles.orderVoucherInputRowClassName}>
                      <input
                        type="text"
                        data-invalid={Boolean(voucherError)}
                        className={orderStyles.orderVoucherInputClassName(
                          Boolean(voucherError)
                        )}
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
                        className={orderStyles.orderVoucherApplyButtonClassName}
                        onClick={() => handleApplyVoucher()}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError ? (
                      <p className={orderStyles.orderVoucherErrorClassName}>
                        {voucherError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className={orderStyles.orderVoucherPickerLinkClassName}
                      onClick={() => setVoucherPickerOpen(true)}
                    >
                      Chọn hoặc nhập mã &gt;
                    </button>
                  </div>
                )}
              </div>

              <div className={orderStyles.orderSummaryTotalClassName}>
                <span className={orderStyles.orderSummaryTotalLabelClassName}>
                  Tổng cộng
                </span>
                <strong className={orderStyles.orderSummaryTotalValueClassName}>
                  {formatOrderCurrency(total)}
                </strong>
              </div>

              <Button
                type="submit"
                variant="contained"
                size="large"
                className={orderStyles.orderSubmitButtonClassName}
                disabled={isSubmitting || checkoutCart.items.length === 0}
                endIcon={<ArrowForwardOutlinedIcon />}
                id="submit-order-btn"
              >
                {paymentMethod === "vnpay"
                  ? "Thanh toán qua VNPAY"
                  : "Xác nhận đặt hàng"}
              </Button>
              <p className={orderStyles.orderCheckoutTermsClassName}>
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
          className={orderStyles.orderInformationModalClassName}
          role="dialog"
          aria-modal="true"
        >
          <div className={orderStyles.orderInformationCardClassName}>
            <div className={orderStyles.orderInformationIconClassName}>
              <ReceiptLongOutlinedIcon aria-hidden="true" />
            </div>
            <h2 className={orderStyles.orderInformationTitleClassName}>
              Thông tin đơn hàng đã thay đổi
            </h2>
            <p className={orderStyles.orderInformationTextClassName}>
              Một vài thông tin trong giỏ hàng đã được cập nhật. Vui lòng làm
              mới tóm tắt đơn trước khi tiếp tục đặt món.
            </p>
            <Button
              variant="contained"
              className={orderStyles.orderInformationPrimaryClassName}
              onClick={handleRefreshSnapshot}
            >
              Cập nhật lại đơn hàng
            </Button>
            <Button
              variant="text"
              className={orderStyles.orderInformationSecondaryClassName}
              onClick={() => router.push("/cart")}
            >
              Quay lại giỏ hàng
            </Button>
          </div>
        </div>
      ) : null}

      {isSubmitting ? (
        <div
          className={orderStyles.orderSubmissionOverlayClassName}
          role="status"
          aria-live="polite"
        >
          <div className={orderStyles.orderSubmissionCardClassName}>
            <div
              className={orderStyles.orderSubmissionSpinnerClassName}
              aria-hidden="true"
            >
              <span className={orderStyles.orderSubmissionSpinnerRingClassName} />
            </div>
            <h2 className={orderStyles.orderSubmissionTitleClassName}>
              {paymentMethod === "vnpay"
                ? "Đang chuyển đến VNPAY..."
                : "Đang tạo đơn hàng..."}
            </h2>
            <p className={orderStyles.orderSubmissionTextClassName}>
              {paymentMethod === "vnpay"
                ? "Vui lòng không đóng hoặc tải lại trang"
                : "Vui lòng không đóng hoặc tải lại trang"}
            </p>
            <div
              className={orderStyles.orderSubmissionProgressClassName}
              aria-hidden="true"
            >
              <span className={orderStyles.orderSubmissionProgressBarClassName} />
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
