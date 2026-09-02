export type VoucherCategory = "all" | "freeship" | "food-discount" | "percent-discount" | "restaurant" | "expiring";

export type VoucherStatus = "active" | "used" | "expired";
export type VoucherTone = "primary" | "info" | "disabled";
export type PromoTone = "primary" | "info" | "muted";

export type VoucherItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string; // Material icon name
  tone: VoucherTone;
  status: VoucherStatus;
  category: VoucherCategory;
  expiryDate?: string;
  usedDate?: string;
  isExpiringSoon?: boolean;
};

export type PromoItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: PromoTone;
  labelText: string;
  isAvailable: boolean;
  unavailableReason?: string;
};

export const voucherCategories: { id: VoucherCategory; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "freeship", label: "Miễn phí giao hàng" },
  { id: "food-discount", label: "Giảm món ăn" },
  { id: "percent-discount", label: "Giảm theo %" },
  { id: "restaurant", label: "Nhà hàng" },
  { id: "expiring", label: "Sắp hết hạn" },
];

export const mockUserVouchers: VoucherItem[] = [
  {
    id: "v1",
    code: "FREESHIP",
    title: "Miễn phí giao hàng",
    description: "Tối đa 15.000đ cho đơn từ 50k",
    icon: "local_shipping",
    tone: "primary",
    status: "active",
    category: "freeship",
    expiryDate: "30/08/2026",
  },
  {
    id: "v2",
    code: "GIẢM 20%",
    title: "Giảm 20% tổng bill",
    description: "Áp dụng cho nhà hàng đối tác",
    icon: "restaurant",
    tone: "info",
    status: "active",
    category: "percent-discount",
    expiryDate: "1 ngày",
    isExpiringSoon: true,
  },
  {
    id: "v3",
    code: "GIẢM 50K",
    title: "Giảm 50.000đ",
    description: "Đơn tối thiểu 200k",
    icon: "receipt_long",
    tone: "disabled",
    status: "used",
    category: "food-discount",
    usedDate: "15/08/2026",
  },
  {
    id: "v4",
    code: "HẾT HẠN",
    title: "Tặng ly sứ EatNow",
    description: "Cho đơn từ 300k",
    icon: "event_busy",
    tone: "disabled",
    status: "expired",
    category: "food-discount",
    expiryDate: "01/08/2026",
  },
];

export const mockPromos: PromoItem[] = [
  {
    id: "p1",
    title: "Giảm 30.000đ cho đơn đầu tiên",
    description: "Không giới hạn đơn tối thiểu",
    icon: "redeem",
    tone: "primary",
    labelText: "GIẢM 30K",
    isAvailable: true,
  },
  {
    id: "p2",
    title: "Tặng 1 bánh tráng miệng",
    description: "Cho đơn từ 150k tại Cửa hàng A",
    icon: "cake",
    tone: "info",
    labelText: "TẶNG BÁNH",
    isAvailable: true,
  },
  {
    id: "p3",
    title: "Flash Sale đồ uống 9k",
    description: "Khung giờ 14h - 16h mỗi ngày",
    icon: "local_offer",
    tone: "muted",
    labelText: "ĐỒNG GIÁ 9K",
    isAvailable: false,
    unavailableReason: "Chưa tới giờ",
  },
];

export type VoucherResult = {
  isValid: boolean;
  discount: number;
  errorMessage?: string;
  voucher?: VoucherItem;
};

export function calculateVoucherDiscount(
  code: string,
  subtotal: number,
  deliveryFee: number
): VoucherResult {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { isValid: false, discount: 0, errorMessage: "Vui lòng nhập mã ưu đãi" };
  }

  const voucher = mockUserVouchers.find(
    (v) => v.code.toUpperCase() === normalizedCode
  );

  if (!voucher) {
    return { isValid: false, discount: 0, errorMessage: "Mã ưu đãi không hợp lệ" };
  }

  if (voucher.status === "used") {
    return { isValid: false, discount: 0, errorMessage: "Mã ưu đãi đã được sử dụng", voucher };
  }

  if (voucher.status === "expired") {
    return { isValid: false, discount: 0, errorMessage: "Mã ưu đãi đã hết hạn", voucher };
  }

  let discount = 0;

  switch (voucher.category) {
    case "freeship":
      if (subtotal < 50000) {
        return {
          isValid: false,
          discount: 0,
          errorMessage: "Đơn tối thiểu 50.000đ để áp dụng mã này",
          voucher,
        };
      }
      discount = Math.min(deliveryFee, 15000);
      break;

    case "percent-discount":
      discount = Math.min(Math.round(subtotal * 0.2), 50000);
      break;

    case "food-discount":
      if (subtotal < 200000) {
        return {
          isValid: false,
          discount: 0,
          errorMessage: "Đơn tối thiểu 200.000đ để áp dụng mã này",
          voucher,
        };
      }
      discount = 50000;
      break;

    default:
      discount = 0;
  }

  return { isValid: true, discount, voucher };
}
