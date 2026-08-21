"use client";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import type { AccountAddress } from "@/types/account";
import type { PublicUser } from "@/types/auth";
import { useCartStore, type CartLine } from "@/store/cartStore";
import { useCartSession } from "@/store/useCartSession";
import { initializeCheckout, placeOrder, previewOrder, type CheckoutVoucher } from "@/app/checkout/actions";
import { signalNavigationStart } from "@/utils/navigationFeedback";

const CheckoutAddressDialog = dynamic(() => import("@/components/checkout/CheckoutAddressDialog"), { ssr: false });

type CheckoutPageProps = { user: PublicUser; addresses: AccountAddress[] };
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function voucherBenefit(voucher: CheckoutVoucher) {
  const target = voucher.discountScope === "shipping" ? "phí giao hàng" : "món ăn";
  if (voucher.discountType === "fixed") return `Giảm ${formatCurrency(voucher.discountValue)} ${target}`;
  return `Giảm ${voucher.discountValue}% ${target}${voucher.maxDiscount ? `, tối đa ${formatCurrency(voucher.maxDiscount)}` : ""}`;
}

function lineDescription(line: CartLine) {
  const parts: string[] = [];
  if (line.size) parts.push(`Size ${line.size.name}`);
  if (line.toppings.length) parts.push(line.toppings.map((t) => t.name).join(", "));
  return parts.join(" · ");
}

export default function CheckoutPage({ user, addresses }: CheckoutPageProps) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartReady = useCartSession(user.id);
  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault) ?? addresses[0], [addresses]);
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
  const initializedRef = useRef(false);
  const skipNextPreviewRef = useRef(false);

  useEffect(() => { if (!addressId && defaultAddress) setAddressId(defaultAddress.id); }, [addressId, defaultAddress]);
  const handleAddressCreated = useCallback((newAddressId: string) => setAddressId(newAddressId), []);
  const handleCloseAddressDialog = useCallback(() => setAddressDialogOpen(false), []);

  useEffect(() => {
    if (!cartReady || lines.length === 0 || initializedRef.current) return;
    initializedRef.current = true;
    setVoucherError("");
    setPreviewError("");
    setIsLoadingVouchers(true);
    startSyncing(async () => {
      const result = await initializeCheckout(lines, addressId || null, paymentMethod);
      setIsLoadingVouchers(false);
      if (!result.ok) { setError(result.error); return; }
      skipNextPreviewRef.current = Boolean(addressId);
      setCartId(result.cartId);
      setVouchers(result.vouchers);
      setVoucherError(result.voucherError ?? "");
      setPreview(result.preview as PreviewState);
      setPreviewError(result.previewError ?? "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartReady]);

  useEffect(() => {
    if (!cartId || !addressId) { setPreview(null); return; }
    if (skipNextPreviewRef.current) { skipNextPreviewRef.current = false; return; }
    let cancelled = false;
    (async () => {
      setPreviewError("");
      const result = await previewOrder(cartId, addressId, paymentMethod, voucherCode);
      if (cancelled) return;
      if (!result.ok) { setPreviewError(result.error); setPreview(null); return; }
      setPreview(result.preview as PreviewState);
    })();
    return () => { cancelled = true; };
  }, [cartId, addressId, paymentMethod, voucherCode]);

  const handlePlaceOrder = () => {
    if (!cartId || !addressId) return;
    setError("");
    startPlacing(async () => {
      const result = await placeOrder(cartId, addressId, paymentMethod, note || undefined, voucherCode || undefined);
      if (!result.ok) { setError(result.error); return; }
      if (paymentMethod === "vnpay") {
        const res = await fetch("/api/vnpay/create-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: result.orderId }) });
        const data = await res.json();
        if (!res.ok || !data.paymentUrl) {
          setError("Đơn hàng đã được tạo nhưng không thể khởi tạo thanh toán VNPay. Vui lòng liên hệ hỗ trợ.");
          return;
        }
        clearCart();
        window.location.href = data.paymentUrl;
        return;
      }
      clearCart();
      signalNavigationStart();
      router.push(`/orders/success?orderId=${result.orderId}`);
    });
  };

  if (cartReady && lines.length === 0) {
    return <div className="order-checkout-page"><main className="order-checkout-main"><section className="order-empty-card"><ReceiptLongOutlinedIcon /><h2>Giỏ hàng đang trống</h2><p>Hãy chọn món trước khi chuyển sang bước xác nhận đơn hàng.</p><Button className="order-submit-button" variant="contained" component={Link} href="/">Khám phá nhà hàng</Button></section></main></div>;
  }

  return (
    <div className="order-checkout-page">
      <main className="order-checkout-main">
        <div className="order-checkout-title-row">
          <Link className="order-back-button" href="/cart" aria-label="Quay lại giỏ hàng"><ArrowBackOutlinedIcon /></Link>
          <div><span>Kiểm tra lần cuối</span><h1>Xác nhận đơn hàng</h1></div>
        </div>

        {error && <Alert className="order-checkout-validation-summary" severity="error">{error}</Alert>}

        <div className="order-checkout-layout">
          <div>
            <section className="order-checkout-panel">
              <PanelHeading icon={<PlaceOutlinedIcon />} step="Bước 1" title="Địa chỉ giao hàng" />
              <div className="order-section-toolbar"><p>Chọn địa chỉ đã lưu hoặc thêm địa chỉ bằng Google Maps.</p><Button startIcon={<AddLocationAltOutlinedIcon />} onClick={() => setAddressDialogOpen(true)}>Thêm địa chỉ</Button></div>
              {addresses.length === 0 ? <Alert severity="warning">Bạn chưa có địa chỉ giao hàng. Hãy thêm địa chỉ để tiếp tục.</Alert> : (
                <div className="order-address-list">
                  {addresses.map((address) => (
                    <label className={`order-select-card ${addressId === address.id ? "is-selected" : ""}`} key={address.id}>
                      <input type="radio" name="address" value={address.id} checked={addressId === address.id} onChange={(e) => setAddressId(e.target.value)} />
                      <PlaceOutlinedIcon className="order-select-card__icon" />
                      <span><strong>{address.recipientName || "Người nhận"}{address.phone ? ` · ${address.phone}` : ""}</strong><small>{address.line1}</small></span>
                      {address.isDefault && <em>Mặc định</em>}
                      {addressId === address.id ? <CheckCircleRoundedIcon className="order-select-card__check" /> : <RadioButtonUncheckedRoundedIcon className="order-select-card__check" />}
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="order-checkout-panel">
              <PanelHeading icon={<LocalOfferOutlinedIcon />} step="Bước 2" title="Voucher" />
              {isLoadingVouchers && <div className="order-inline-loading"><CircularProgress size={18} /> Đang tải voucher phù hợp...</div>}
              {voucherError && <Alert severity="error">{voucherError}</Alert>}
              {!isLoadingVouchers && !voucherError && (
                <div className="order-voucher-list">
                  <label className={`order-voucher-card ${voucherCode === "" ? "is-selected" : ""}`}>
                    <input type="radio" name="voucher" value="" checked={voucherCode === ""} onChange={() => setVoucherCode("")} />
                    <span className="order-voucher-card__ticket"><LocalOfferOutlinedIcon /></span>
                    <span><strong>Không dùng voucher</strong><small>Giữ nguyên giá trị đơn hàng</small></span>
                    {voucherCode === "" ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
                  </label>
                  {vouchers.map((voucher) => (
                    <label className={`order-voucher-card ${voucherCode === voucher.code ? "is-selected" : ""}`} key={voucher.id}>
                      <input type="radio" name="voucher" value={voucher.code} checked={voucherCode === voucher.code} onChange={(e) => setVoucherCode(e.target.value)} />
                      <span className="order-voucher-card__ticket"><LocalOfferOutlinedIcon /></span>
                      <span><b>{voucher.code}</b><strong>{voucher.name}</strong><small>{voucherBenefit(voucher)}{voucher.minOrderValue > 0 ? ` · Đơn tối thiểu ${formatCurrency(voucher.minOrderValue)}` : ""}</small></span>
                      {voucherCode === voucher.code ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
                    </label>
                  ))}
                  {vouchers.length === 0 && <p className="order-muted-message">Hiện chưa có voucher phù hợp với nhà hàng này.</p>}
                </div>
              )}
              {preview?.voucher && voucherCode && !preview.voucher.valid && <Alert severity="warning">{preview.voucher.reason || "Voucher không hợp lệ"}</Alert>}
            </section>

            <section className="order-checkout-panel">
              <PanelHeading icon={<NotesOutlinedIcon />} step="Bước 3" title="Ghi chú cho nhà hàng" />
              <div className="order-note-field"><textarea rows={4} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Ít cay, không lấy dụng cụ ăn uống..." /><small>{note.length}/500 · Không bắt buộc</small></div>
            </section>

            <section className="order-checkout-panel">
              <PanelHeading icon={<AccountBalanceWalletOutlinedIcon />} step="Bước 4" title="Phương thức thanh toán" />
              <div className="order-payment-options">
                <PaymentOption value="cod" selected={paymentMethod === "cod"} title="Thanh toán khi nhận hàng" description="Thanh toán bằng tiền mặt cho tài xế" icon={<PaymentsOutlinedIcon />} onSelect={() => setPaymentMethod("cod")} />
                <PaymentOption value="vnpay" selected={paymentMethod === "vnpay"} title="Thanh toán qua VNPay" description="Quét QR hoặc thanh toán bằng thẻ ngân hàng" icon={<AccountBalanceWalletOutlinedIcon />} onSelect={() => setPaymentMethod("vnpay")} />
              </div>
            </section>
          </div>

          <aside className="order-summary-card">
            <div className="order-summary-heading"><ReceiptLongOutlinedIcon /><h2>Đơn hàng của bạn</h2></div>
            <div className="order-summary-restaurant"><StorefrontOutlinedIcon fontSize="small" /> {restaurantName || "Nhà hàng"}</div>
            <div className="order-summary-list">
              {lines.map((line) => (
                <div className="order-summary-item" key={line.lineId}>
                  <div className="order-summary-item__media"><Image src={line.foodImage} alt={line.foodName} fill sizes="56px" /></div>
                  <div><h3>{line.quantity} × {line.foodName}</h3>{lineDescription(line) && <span>{lineDescription(line)}</span>}</div>
                  <strong>{formatCurrency(line.unitPrice * line.quantity)}</strong>
                </div>
              ))}
            </div>
            {isSyncing && <div className="order-inline-loading"><CircularProgress size={18} /> Đang tính tổng tiền...</div>}
            {previewError && <Alert severity="error">{previewError}</Alert>}
            {preview && <OrderPricing preview={preview} />}
            {!addressId && <p className="order-summary-hint"><PlaceOutlinedIcon fontSize="small" /> Chọn địa chỉ để tính phí giao hàng.</p>}
            <Button className="order-submit-button" variant="contained" disabled={!cartId || !addressId || !preview || isSyncing || isPlacing} onClick={handlePlaceOrder} startIcon={isPlacing ? <CircularProgress color="inherit" size={18} /> : undefined}>{paymentMethod === "vnpay" ? "Thanh toán qua VNPay" : "Đặt hàng"}</Button>
            <p className="order-summary-policy">Bằng việc đặt hàng, bạn xác nhận thông tin giao nhận và giá trị đơn ở trên.</p>
          </aside>
        </div>
      </main>

      <CheckoutAddressDialog open={addressDialogOpen} onClose={handleCloseAddressDialog} onCreated={handleAddressCreated} />
    </div>
  );
}

function PanelHeading({ icon, step, title }: { icon: ReactNode; step: string; title: string }) {
  return <div className="order-panel-heading">{icon}<div><span>{step}</span><h2>{title}</h2></div></div>;
}

function PaymentOption({ value, selected, title, description, icon, onSelect }: { value: string; selected: boolean; title: string; description: string; icon: ReactNode; onSelect: () => void }) {
  return <label className={`order-payment-option ${selected ? "is-selected" : ""}`}><input type="radio" name="payment" value={value} checked={selected} onChange={onSelect} /><span className="order-payment-option__icon">{icon}</span><span><strong>{title}</strong><small>{description}</small></span><span className="order-payment-option__radio">{selected ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}</span></label>;
}

function OrderPricing({ preview }: { preview: NonNullable<PreviewState> }) {
  return <><div className="order-summary-rows"><PriceRow label="Tạm tính" value={formatCurrency(preview.subtotal)} /><PriceRow label="Phí giao hàng" value={formatCurrency(preview.shipping_fee)} />{preview.discount_amount > 0 && <PriceRow label="Giảm giá" value={`-${formatCurrency(preview.discount_amount)}`} discount />}{(preview.customer_fee_amount ?? 0) > 0 && <PriceRow label="Phí dịch vụ và phụ phí" value={formatCurrency(preview.customer_fee_amount ?? 0)} />}{(preview.tax_amount ?? 0) > 0 && <PriceRow label={(preview.tax_added_amount ?? 0) > 0 ? "Thuế" : "Thuế đã bao gồm"} value={formatCurrency(preview.tax_amount ?? 0)} />}</div><div className="order-summary-total"><span>Tổng cộng</span><strong>{formatCurrency(preview.total_price)}</strong></div></>;
}

function PriceRow({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  return <div><span>{label}</span><strong className={discount ? "is-discount" : ""}>{value}</strong></div>;
}
