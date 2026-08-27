export type OwnerNavItem = {
  id: "dashboard" | "orders" | "menu" | "revenue" | "reviews" | "settings";
  label: string;
  href: string;
  badge?: number;
};

export type OwnerMetric = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: "primary" | "success" | "neutral";
};

export type OwnerOrder = {
  id: string;
  customerName: string;
  customerInitial: string;
  itemCount: string;
  paymentMethod: string;
  total: string;
  time: string;
  relativeTime: string;
  status: string;
  statusTone: "new" | "preparing" | "pickup" | "done";
  paymentStatus: string;
  isSelected?: boolean;
  driver?: string;
};

export type OwnerMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
};

export type OwnerReview = {
  id: string;
  customerName: string;
  customerInitial: string;
  orderId: string;
  rating: number;
  timeAgo: string;
  dishes: string;
  comment: string;
  needsReply?: boolean;
  reply?: string;
};

export const ownerRestaurant = {
  name: "Bếp Việt Premium",
  shortName: "Bếp Việt",
  category: "Món Việt Nam",
  description: "Món Việt truyền thống đậm đà bản sắc",
  address: "123 Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM",
  phone: "0987 654 321",
  status: "Đang mở cửa",
  ownerProfileName: "Owner Profile",
  ownerProfileId: "9482",
};

export const ordersBadge = 3;

export const ownerNavItems: OwnerNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/owner" },
  { id: "orders", label: "Đơn hàng", href: "/owner/orders", badge: ordersBadge },
  { id: "menu", label: "Thực đơn", href: "/owner/menu" },
  { id: "revenue", label: "Doanh thu", href: "/owner/revenue" },
  { id: "reviews", label: "Đánh giá", href: "/owner/reviews" },
];

export const ownerSettingsNavItem: OwnerNavItem = {
  id: "settings",
  label: "Settings",
  href: "/owner/settings",
};

export const ownerDashboardMetrics: OwnerMetric[] = [
  {
    id: "today-revenue",
    label: "Doanh thu hôm nay",
    value: "5.420.000đ",
    note: "+12% vs hôm qua",
    tone: "primary",
  },
  {
    id: "new-orders",
    label: "Đơn hàng mới",
    value: "18 đơn",
    note: "Chờ xử lý: 4",
  },
  {
    id: "rating",
    label: "Đánh giá trung bình",
    value: "4.8/5",
    note: "120 lượt đánh giá",
  },
  {
    id: "completion",
    label: "Tỷ lệ hoàn thành",
    value: "98%",
    note: "Tuyệt vời",
    tone: "success",
  },
];

export const ownerOrders: OwnerOrder[] = [
  {
    id: "#EN-9840",
    customerName: "Trần Thị B",
    customerInitial: "B",
    itemCount: "3 món",
    paymentMethod: "COD",
    total: "145.000đ",
    time: "10:45 AM",
    relativeTime: "5 phút trước",
    status: "Đơn mới",
    statusTone: "new",
    paymentStatus: "Chưa thanh toán",
    isSelected: true,
  },
  {
    id: "#EN-9841",
    customerName: "Lê Văn C",
    customerInitial: "C",
    itemCount: "1 món",
    paymentMethod: "VNPay",
    total: "55.000đ",
    time: "10:30 AM",
    relativeTime: "12 phút trước",
    status: "Đang chuẩn bị",
    statusTone: "preparing",
    paymentStatus: "Đã thanh toán",
  },
  {
    id: "#EN-9838",
    customerName: "Nguyễn Anh A",
    customerInitial: "A",
    itemCount: "5 món",
    paymentMethod: "Momo",
    total: "320.000đ",
    time: "10:15 AM",
    relativeTime: "25 phút trước",
    status: "Chờ lấy hàng",
    statusTone: "pickup",
    paymentStatus: "Đã thanh toán",
    driver: "Tài xế: Nguyễn Văn H (090xxxx123)",
  },
];

export const ownerOrderDetailItems = [
  {
    quantity: "2x",
    name: "Cơm tấm sườn bì chả",
    price: "110.000đ",
    note: "Size: Lớn (+5.000đ), Topping: Trứng ốp la (+10.000đ)",
  },
  {
    quantity: "1x",
    name: "Trà đá",
    price: "5.000đ",
    note: "Size: Mặc định",
  },
];

export const ownerCategories = [
  { id: "best", label: "Món bán chạy", count: 8 },
  { id: "rice", label: "Cơm", count: 12, active: true },
  { id: "extra", label: "Món ăn kèm", count: 6 },
  { id: "drink", label: "Đồ uống", count: 10 },
];

export const ownerMenuItems: OwnerMenuItem[] = [
  {
    id: "com-tam-suon-bi-cha",
    name: "Cơm Tấm Sườn Bì Chả",
    description:
      "Cơm tấm truyền thống với sườn nướng than hoa đậm đà, bì lợn giòn sần sật, chả trứng hấp mềm mịn, ăn kèm mỡ hành và nước mắm chua ngọt.",
    price: "65.000đ",
    image: "/images/home/restaurant-com-tam.png",
    category: "Cơm",
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "pho-bo-tai-nam",
    name: "Phở Bò Tái Nam",
    description:
      "Phở bò nước dùng trong, ngọt thanh hầm từ xương bò 12 tiếng. Thịt bò tái mềm, nạm gân giòn rụm.",
    price: "55.000đ",
    image: "/images/home/food-pho.png",
    category: "Món bán chạy",
    isAvailable: false,
  },
  {
    id: "bun-thit-nuong",
    name: "Bún Thịt Nướng Special",
    description:
      "Bún tươi, thịt nướng sả thơm, rau sống, đồ chua và nước mắm pha theo công thức riêng.",
    price: "60.000đ",
    image: "/images/home/restaurant-bun.png",
    category: "Món ăn kèm",
    isAvailable: true,
  },
];

export const ownerPopularDishes = [
  {
    rank: "#1",
    name: "Phở Bò Đặc Biệt",
    sold: "45 đã bán",
    image: "/images/home/food-pho.png",
  },
  {
    rank: "#2",
    name: "Bánh Mì Thịt Nướng",
    sold: "32 đã bán",
    image: "/images/home/food-banh-mi.png",
  },
  {
    rank: "#3",
    name: "Bún Chả Hà Nội",
    sold: "28 đã bán",
    image: "/images/home/food-bun-bo.png",
  },
];

export const ownerRevenueMetrics: OwnerMetric[] = [
  {
    id: "gross",
    label: "Tổng doanh thu",
    value: "đ 124.5M",
    note: "↑ 12.5% so với kỳ trước",
    tone: "primary",
  },
  {
    id: "orders",
    label: "Số lượng đơn hàng",
    value: "1,245",
    note: "↑ 5.2% so với kỳ trước",
  },
  {
    id: "average",
    label: "Giá trị đơn trung bình",
    value: "đ 100K",
    note: "→ Không đổi",
  },
  {
    id: "done",
    label: "Tỷ lệ hoàn thành",
    value: "98.2%",
    note: "↑ 2.1% so với kỳ trước",
    tone: "success",
  },
];

export const ownerRevenueTrend = [
  { label: "T2", value: "12M" },
  { label: "T3", value: "19M" },
  { label: "T4", value: "15M" },
  { label: "T5", value: "25M" },
  { label: "T6", value: "22M" },
  { label: "T7", value: "30M" },
  { label: "CN", value: "28M" },
];

export const ownerTopRevenueDishes = [
  { name: "Cơm Tấm Sườn Bì Chả", sold: 84, revenue: "đ 5,460,000" },
  { name: "Bún Thịt Nướng Special", sold: 62, revenue: "đ 3,720,000" },
  { name: "Phở Bò Tái Lăn", sold: 55, revenue: "đ 4,125,000" },
  { name: "Gỏi Cuốn Tôm Thịt", sold: 48, revenue: "đ 1,680,000" },
  { name: "Trà Đào Cam Sả", sold: 42, revenue: "đ 1,470,000" },
];

export const ownerTransactions = [
  { id: "#ORD-0921", time: "24/10/2023 18:30", method: "Thẻ tín dụng", total: "đ 350,000", status: "Đã thanh toán" },
  { id: "#ORD-0920", time: "24/10/2023 17:45", method: "COD", total: "đ 125,000", status: "COD" },
  { id: "#ORD-0919", time: "24/10/2023 16:15", method: "Ví điện tử", total: "đ 480,000", status: "Đã thanh toán" },
];

export const ownerReviews: OwnerReview[] = [
  {
    id: "review-1092",
    customerName: "Nguyễn Văn A",
    customerInitial: "N",
    orderId: "#EN-1092",
    rating: 5,
    timeAgo: "2 giờ trước",
    dishes: "Phở Bò Đặc Biệt, Trà Đá, Quẩy",
    comment:
      "Nước dùng rất đậm đà, thịt bò mềm và nhiều. Đóng gói rất cẩn thận, món ăn giao đến vẫn còn nóng hổi. Sẽ tiếp tục ủng hộ quán!",
  },
  {
    id: "review-1093",
    customerName: "Trần Thị B",
    customerInitial: "T",
    orderId: "#EN-1093",
    rating: 4,
    timeAgo: "Hôm qua",
    dishes: "Bún Chả Hà Nội, Nem Rán",
    comment:
      "Đồ ăn ngon, nêm nếm vừa miệng. Tuy nhiên phần rau sống hơi ít so với phần bún chả. Mong quán chú ý thêm.",
    needsReply: true,
    reply:
      "Chào bạn Trần Thị B, cảm ơn bạn đã góp ý. Quán xin ghi nhận và sẽ điều chỉnh lại định lượng rau sống cho các đơn hàng sau. Rất mong được phục vụ bạn lần tới!",
  },
];

export const ownerRatingDistribution = [
  { stars: 5, percent: 85 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

export const ownerBusinessHours = [
  { day: "Thứ 2 - Thứ 6", time: "08:00 - 22:00" },
  { day: "Thứ 7", time: "09:00 - 23:00" },
  { day: "Chủ nhật", time: "09:00 - 21:30" },
];

export const ownerStaffMembers = [
  { name: "Minh Anh", role: "Quản lý ca", status: "Đang hoạt động" },
  { name: "Hoàng Nam", role: "Nhân viên bếp", status: "Đang hoạt động" },
  { name: "staff@bepviet.vn", role: "Lời mời đang chờ", status: "Hết hạn sau 7 ngày" },
];
