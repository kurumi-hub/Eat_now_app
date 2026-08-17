export type VoucherCategory = "all" | "freeship" | "food-discount" | "percent-discount" | "restaurant" | "expiring";

export type VoucherStatus = "active" | "used" | "expired";

export type VoucherItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string; // Material icon name
  iconColor: string; // CSS color class
  iconBg: string; // CSS background class 
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
  iconColor: string;
  headerBg: string;
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
    iconColor: "voucher-icon--primary",
    iconBg: "voucher-icon-bg--primary",
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
    iconColor: "voucher-icon--info",
    iconBg: "voucher-icon-bg--info",
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
    iconColor: "voucher-icon--disabled",
    iconBg: "",
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
    iconColor: "voucher-icon--disabled",
    iconBg: "",
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
    iconColor: "voucher-promo-icon--primary",
    headerBg: "voucher-promo-header--primary",
    labelText: "GIẢM 30K",
    isAvailable: true,
  },
  {
    id: "p2",
    title: "Tặng 1 bánh tráng miệng",
    description: "Cho đơn từ 150k tại Cửa hàng A",
    icon: "cake",
    iconColor: "voucher-promo-icon--info",
    headerBg: "voucher-promo-header--info",
    labelText: "TẶNG BÁNH",
    isAvailable: true,
  },
  {
    id: "p3",
    title: "Flash Sale đồ uống 9k",
    description: "Khung giờ 14h - 16h mỗi ngày",
    icon: "local_offer",
    iconColor: "voucher-promo-icon--muted",
    headerBg: "voucher-promo-header--muted",
    labelText: "ĐỒNG GIÁ 9K",
    isAvailable: false,
    unavailableReason: "Chưa tới giờ",
  },
];
