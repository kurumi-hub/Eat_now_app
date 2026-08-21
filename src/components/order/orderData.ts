import type {
  CartItem,
  CheckoutSnapshot,
  OrderReceipt,
  OrderStatus,
} from "@/contexts/CartContext";
import {
  normalizeVietnamesePhone,
  normalizeWhitespace,
  validateFullName,
  validateVietnamesePhone,
} from "@/utils/validation";

export const mockDeliveryFee = 15000;

export type PaymentMethod = "cod" | "vnpay";

export type CheckoutField = "recipientName" | "phone" | "address";

export type CheckoutFormValues = {
  recipientName: string;
  phone: string;
  address: string;
  deliveryNote: string;
  restaurantNote: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutValidationResult = {
  isValid: boolean;
  errors: Partial<Record<CheckoutField, string>>;
  normalized: CheckoutFormValues;
};

export function formatOrderCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

export function normalizeCheckoutValues(
  values: CheckoutFormValues
): CheckoutFormValues {
  return {
    recipientName: normalizeWhitespace(values.recipientName),
    phone: normalizeVietnamesePhone(values.phone),
    address: normalizeWhitespace(values.address),
    deliveryNote: normalizeWhitespace(values.deliveryNote),
    restaurantNote: normalizeWhitespace(values.restaurantNote),
    paymentMethod: values.paymentMethod === "vnpay" ? "vnpay" : "cod",
  };
}

export function validateCheckoutValues(
  values: CheckoutFormValues
): CheckoutValidationResult {
  const normalized = normalizeCheckoutValues(values);
  const errors: Partial<Record<CheckoutField, string>> = {
    recipientName: validateFullName(values.recipientName),
    phone: validateVietnamesePhone(values.phone),
    address: normalized.address
      ? ""
      : "Vui lòng nhập địa chỉ giao hàng.",
  };

  return {
    isValid: !Object.values(errors).some(Boolean),
    errors,
    normalized,
  };
}

export function getCheckoutSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCheckoutItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function hasCheckoutChanged(
  snapshot: CheckoutSnapshot | null,
  items: CartItem[]
) {
  if (!snapshot) return false;

  const subtotal = getCheckoutSubtotal(items);
  const itemCount = getCheckoutItemCount(items);

  return snapshot.subtotal !== subtotal || snapshot.itemCount !== itemCount;
}

export type OrderDisplayItem = {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  restaurantName?: string;
  restaurantSlug?: string;
  customizationKey?: string;
  optionSummary?: string[];
  note?: string;
};

export type OrderDisplayRecord = {
  id: string;
  status: OrderStatus;
  restaurantName: string;
  restaurantSlug: string;
  restaurantAddress: string;
  restaurantImage: string;
  recipientName: string;
  phone: string;
  address: string;
  deliveryNote: string;
  restaurantNote: string;
  paymentLabel: string;
  createdAt: string;
  estimatedDeliveryLabel: string;
  updatedAtLabel: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  surcharge: number;
  total: number;
  itemCount: number;
  items: OrderDisplayItem[];
  issueReason?: string;
  appliedVoucherCode?: string | null;
};

export type OrderTimelineStep = {
  id: OrderStatus;
  title: string;
  description: string;
  timeLabel?: string;
};

export const orderTimelineSteps: OrderTimelineStep[] = [
  {
    id: "pending",
    title: "Đã đặt hàng",
    description: "EatNow đã ghi nhận đơn hàng của bạn.",
    timeLabel: "10:30 AM",
  },
  {
    id: "confirmed",
    title: "Nhà hàng xác nhận",
    description: "Nhà hàng đang kiểm tra và xác nhận đơn.",
    timeLabel: "10:35 AM",
  },
  {
    id: "preparing",
    title: "Nhà hàng đang chuẩn bị",
    description: "Bếp đang chuẩn bị món ăn.",
    timeLabel: "10:42 AM",
  },
  {
    id: "delivering",
    title: "Đang giao",
    description: "Tài xế đang trên đường đến bạn.",
    timeLabel: "10:55 AM",
  },
  {
    id: "completed",
    title: "Hoàn thành",
    description: "Đơn hàng đã được giao thành công.",
  },
];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  delivering: "Đang giao",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Bị từ chối",
};

export const orderStatusDescriptions: Record<OrderStatus, string> = {
  pending:
    "Nhà hàng đang kiểm tra đơn hàng của bạn. Vui lòng đợi trong giây lát.",
  confirmed: "Nhà hàng đã xác nhận đơn và đang chuyển sang bếp.",
  preparing: "Nhà hàng đang chuẩn bị các món trong đơn.",
  delivering: "Đơn hàng của bạn đang trên đường đến.",
  completed: "Đơn hàng đã hoàn thành. Cảm ơn bạn đã dùng EatNow.",
  cancelled: "Đơn hàng đã được hủy.",
  rejected: "Nhà hàng không thể nhận đơn này.",
};

const defaultRestaurantAddress = "Ninh Kiều, Cần Thơ";

export const mockPendingOrder: OrderDisplayRecord = {
  id: "EN-8472",
  status: "pending",
  restaurantName: "Cơm Tấm Sáu Hiếu",
  restaurantSlug: "com-tam-sau-hieu",
  restaurantAddress: "123 Đường 30/4, Ninh Kiều, Cần Thơ",
  restaurantImage: "/images/home/restaurant-com-tam.png",
  recipientName: "Nguyễn Văn A",
  phone: "0901234567",
  address: "Ninh Kiều, Cần Thơ",
  deliveryNote: "Gọi trước khi đến.",
  restaurantNote: "Thêm mỡ hành",
  paymentLabel: "Tiền mặt (COD)",
  createdAt: "2026-08-14T03:30:00.000Z",
  estimatedDeliveryLabel: "15-20 phút",
  updatedAtLabel: "10:30 AM",
  subtotal: 85000,
  deliveryFee: mockDeliveryFee,
  discount: 0,
  surcharge: 0,
  total: 100000,
  itemCount: 3,
  items: [
    {
      foodId: "com-tam-suon-bi-cha",
      name: "Cơm tấm sườn bì chả",
      quantity: 1,
      price: 65000,
      image: "/images/home/food-com-tam.png",
      note: "Thêm mỡ hành",
    },
    {
      foodId: "tra-dao",
      name: "Trà đào",
      quantity: 2,
      price: 10000,
      image: "/images/home/food-tra-dao.png",
    },
  ],
};

export const mockTrackingOrder: OrderDisplayRecord = {
  ...mockPendingOrder,
  status: "delivering",
  updatedAtLabel: "10:55 AM",
};

export const mockOrderHistory: OrderDisplayRecord[] = [
  {
    ...mockTrackingOrder,
    id: "EN-9001",
    status: "completed",
    createdAt: "2026-08-12T12:30:00.000Z",
    paymentLabel: "Tiền mặt (COD)",
  },
  {
    ...mockPendingOrder,
  },
  {
    id: "EN-8105",
    status: "cancelled",
    restaurantName: "Bánh Mì Góc Phố",
    restaurantSlug: "tiem-banh-mi-goc-pho",
    restaurantAddress: defaultRestaurantAddress,
    restaurantImage: "/images/home/restaurant-banh-mi.png",
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    address: "Ninh Kiều, Cần Thơ",
    deliveryNote: "",
    restaurantNote: "",
    paymentLabel: "Tiền mặt (COD)",
    createdAt: "2026-08-08T05:15:00.000Z",
    estimatedDeliveryLabel: "10-20 phút",
    updatedAtLabel: "12:15 PM",
    subtotal: 60000,
    deliveryFee: 15000,
    discount: 0,
    surcharge: 0,
    total: 75000,
    itemCount: 2,
    issueReason: "Hủy bởi người dùng.",
    items: [
      {
        foodId: "banh-mi-thit-nuong",
        name: "Bánh mì thịt nướng",
        quantity: 1,
        price: 32000,
        image: "/images/home/food-banh-mi.png",
      },
      {
        foodId: "tra-dao",
        name: "Trà đào",
        quantity: 1,
        price: 28000,
        image: "/images/home/food-tra-dao.png",
      },
    ],
  },
  {
    id: "EN-7932",
    status: "rejected",
    restaurantName: "Phở 2000 - Ninh Kiều",
    restaurantSlug: "pho-2000-ninh-kieu",
    restaurantAddress: defaultRestaurantAddress,
    restaurantImage: "/images/home/restaurant-pho.png",
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    address: "Ninh Kiều, Cần Thơ",
    deliveryNote: "",
    restaurantNote: "",
    paymentLabel: "Tiền mặt (COD)",
    createdAt: "2026-08-05T13:45:00.000Z",
    estimatedDeliveryLabel: "15-25 phút",
    updatedAtLabel: "20:45 PM",
    subtotal: 69000,
    deliveryFee: 15000,
    discount: 0,
    surcharge: 0,
    total: 84000,
    itemCount: 1,
    issueReason: "Quán quá tải, không thể nhận thêm đơn.",
    items: [
      {
        foodId: "pho-bo-dac-biet",
        name: "Phở bò đặc biệt",
        quantity: 1,
        price: 69000,
        image: "/images/home/food-pho.png",
      },
    ],
  },
];

export function formatOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getOrderStatusClass(status: OrderStatus) {
  return `is-${status}`;
}

export function getOrderRestaurantLabel(
  items: OrderDisplayItem[],
  fallbackRestaurantName: string
) {
  const restaurantNames = Array.from(
    new Set(
      items
        .map((item) => item.restaurantName)
        .filter((name): name is string => Boolean(name))
    )
  );

  if (restaurantNames.length === 0) return fallbackRestaurantName;

  return restaurantNames.join(", ");
}

function mapReceiptToOrderRecord(receipt: OrderReceipt): OrderDisplayRecord {
  const items: OrderDisplayItem[] = receipt.items.map((item) => ({
    foodId: item.foodId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image: item.image,
    restaurantName: item.restaurantName,
    restaurantSlug: item.restaurantSlug,
    customizationKey: item.customizationKey,
    optionSummary: item.optionSummary,
    note: [item.optionSummary?.join(", "), item.note]
      .filter(Boolean)
      .join(" - "),
  }));

  return {
    id: receipt.id,
    status: receipt.status,
    restaurantName: getOrderRestaurantLabel(
      items,
      receipt.restaurant.restaurantName
    ),
    restaurantSlug: items[0]?.restaurantSlug || receipt.restaurant.restaurantSlug,
    restaurantAddress: defaultRestaurantAddress,
    restaurantImage: receipt.items[0]?.image || "/images/home/restaurant-com-tam.png",
    recipientName: receipt.recipientName,
    phone: receipt.phone,
    address: receipt.address,
    deliveryNote: receipt.deliveryNote,
    restaurantNote: receipt.restaurantNote,
    paymentLabel:
      receipt.paymentMethod === "vnpay" ? "VNPAY" : "Tiền mặt (COD)",
    createdAt: receipt.createdAt,
    estimatedDeliveryLabel: receipt.estimatedDeliveryLabel,
    updatedAtLabel: "Vừa xong",
    subtotal: receipt.subtotal,
    deliveryFee: receipt.deliveryFee,
    discount: typeof receipt.discount === "number" ? receipt.discount : 0,
    surcharge: 0,
    total: receipt.total,
    itemCount: receipt.itemCount,
    appliedVoucherCode:
      typeof receipt.appliedVoucherCode === "string"
        ? receipt.appliedVoucherCode
        : null,
    items,
  };
}

export function getMergedOrderHistory(localOrders: OrderReceipt[]) {
  const localRecords = localOrders.map(mapReceiptToOrderRecord);
  const localIds = new Set(localRecords.map((order) => order.id));

  return [
    ...localRecords,
    ...mockOrderHistory.filter((order) => !localIds.has(order.id)),
  ];
}

export function findOrderRecordById(
  orderId: string,
  localOrders: OrderReceipt[]
) {
  const normalizedOrderId = orderId.replace(/^#/, "");

  return (
    getMergedOrderHistory(localOrders).find(
      (order) => order.id === normalizedOrderId
    ) || mockPendingOrder
  );
}
