/* ── Shipper Flow — Types & Mock Data ── */

export type ShipperNavItem = {
  id: "home" | "orders" | "earnings" | "profile";
  label: string;
  href: string;
  icon: string;
};

export type ShipperStats = {
  earnings: string;
  trips: number;
  rating: number;
};

export type ShipperActiveOrder = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  status: string;
  amount: string;
  paymentMethod: string;
};

export type ShipperNewOrder = {
  earnings: string;
  distance: string;
  estimatedTime: string;
  pickup: { name: string; address: string };
  dropoff: { name: string; address: string };
};

export type ShipperDelivery = {
  status: string;
  eta: string;
  customer: { name: string; phone: string; avatar: string };
  address: string;
  dropoffAddress: string;
  orderSummary: string;
};

export type ShipperTransaction = {
  id: string;
  restaurantName: string;
  time: string;
  status: string;
  amount: string;
  faded?: boolean;
};

export type ShipperEarningsSummary = {
  balance: string;
  weeklyOrders: number;
  weeklyKm: string;
  weeklyDistance: number;
};

export type ShipperProfileInfo = {
  label: string;
  value: string;
  tone?: "success" | "brand" | "mono";
};

export type ShipperProfile = {
  name: string;
  shipperId: string;
  rating: number;
  totalTrips: string;
  verified: boolean;
  avatarUrl: string;
  phone: string;
  email: string;
  joinDate: string;
  operatingArea: string;
  vehicleType: string;
  licensePlate: string;
  personalInfo: ShipperProfileInfo[];
  vehicleInfo: ShipperProfileInfo[];
  bankInfo: ShipperProfileInfo[];
};

/* ── Navigation ── */

export const shipperNavItems: ShipperNavItem[] = [
  { id: "home", label: "Trang chủ", href: "/shipper", icon: "home" },
  { id: "orders", label: "Đơn hàng", href: "/shipper/delivery", icon: "local_shipping" },
  { id: "earnings", label: "Thu nhập", href: "/shipper/earnings", icon: "payments" },
  { id: "profile", label: "Tài khoản", href: "/shipper/profile", icon: "person" },
];

/* ── Shipper Driver Profile (for TopAppBar) ── */

export const shipperDriverProfile = {
  name: "Nguyễn Văn A",
  shipperId: "SHP-88421",
  rating: 4.9,
  totalTrips: "1.250+",
  joinDate: "12/03/2023",
  operatingArea: "Ba Đình - Đống Đa - Cầu Giấy (Hà Nội)",
  vehicleType: "Xe máy (Honda Wave Alpha)",
  licensePlate: "29-B1 868.29",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwT2O-IbFtURdKOD7XpUM5eyyoIUD5a3w2aTwFHRcqP70gGCfxH0DOD4DP_vy7GjNaGBVeSkdjj_0mShLHehqFC09RtZB4kxccYaX180ug1Rw6mVnkORWG_Lsgz9fuNzVON6SOLGyHBPqhuF5yLT3waOLJREXcEGS8gLgAzdGptcLwnCDeH5WlTScphQAoqVF7PnB15rOan6h6W1dHYxAt545MK05-2qRBHl987ry53qkvZO4osXm",
};

/* ── Dashboard ── */

export const shipperDailyStats: ShipperStats = {
  earnings: "450.000đ",
  trips: 12,
  rating: 4.9,
};

export const shipperActiveOrder: ShipperActiveOrder = {
  id: "ORD-001",
  restaurantName: "Phở Thìn Lò Đúc",
  restaurantAddress: "13 Lò Đúc, Phạm Đình Hổ",
  status: "Đang lấy món",
  amount: "85.000đ",
  paymentMethod: "Thanh toán thẻ",
};

/* ── New Order ── */

export const shipperNewOrder: ShipperNewOrder = {
  earnings: "25.000đ",
  distance: "3.2 km",
  estimatedTime: "15 ph",
  pickup: {
    name: "Phở Gia Truyền Bát Đàn",
    address: "49 Bát Đàn, P. Cửa Đông, Q. Hoàn Kiếm, Hà Nội",
  },
  dropoff: {
    name: "Tòa nhà Lotte Center",
    address: "54 Liễu Giai, P. Cống Vị, Q. Ba Đình, Hà Nội",
  },
};

/* ── Map placeholder URLs ── */

export const shipperMapImages = {
  dashboard:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAaK6YvetyAg9K7JFk9g8rGTUxkQ6Ig9GfLhaHVy8oKoQ_xXtkPGyxpEnw4WF9KDf7WI65Oao3CZEgspZj8EZ28_Qi5vsy7Ru4E99WjqMOdKCBdgLk7Bdugjvyn9M6pkxv70U-N3xIJgXIiL7sWKVw-sp3QEWQ-5txkjgLNHLl2AjP8a4hG9pReKWJJGYXejZiK-cM6lODSDexoH3AZwsY-PcJMxoymPJ5vTSwwZuWDqmH4gD2gjvTT",
  dashboardMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAaK6YvetyAg9K7JFk9g8rGTUxkQ6Ig9GfLhaHVy8oKoQ_xXtkPGyxpEnw4WF9KDf7WI65Oao3CZEgspZj8EZ28_Qi5vsy7Ru4E99WjqMOdKCBdgLk7Bdugjvyn9M6pkxv70U-N3xIJgXIiL7sWKVw-sp3QEWQ-5txkjgLNHLl2AjP8a4hG9pReKWJJGYXejZiK-cM6lODSDexoH3AZwsY-PcJMxoymPJ5vTSwwZuWDqmH4gD2gjvTT",
  delivery:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeKVvNklOgx5ENafjBFGVCmmgrkEKPtI9BfxyA8QoXcUZ7aClng12wFWLzgnNkkT4h1Z_USTOHBYZH_xQbVcWZLr6WDzqeuPLX31goFHlmykcVpHq4ZEPzfcSI2qFR2CQm4SrNqMcip_1sevVBbPLCkc6xdguYCdZhVMg2UXS1dlzmjxBMbTd9XK4sGD3Uus8rlG0u1VDbUB8JonNFxKLEHy_ROnVwv0NuR8abrKJQ8567F4g8v87l",
  deliveryMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeKVvNklOgx5ENafjBFGVCmmgrkEKPtI9BfxyA8QoXcUZ7aClng12wFWLzgnNkkT4h1Z_USTOHBYZH_xQbVcWZLr6WDzqeuPLX31goFHlmykcVpHq4ZEPzfcSI2qFR2CQm4SrNqMcip_1sevVBbPLCkc6xdguYCdZhVMg2UXS1dlzmjxBMbTd9XK4sGD3Uus8rlG0u1VDbUB8JonNFxKLEHy_ROnVwv0NuR8abrKJQ8567F4g8v87l",
  newOrder:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCbZ7PDYIukvXsmDlFhOufri9Ubai_bgD39Ndw9wz0H3Dqc81jgfggQwr040fYr21c2zC_lKSmZICgrUb225bRCHuUGI84Llb-wbfzQBx6AZoFp-cQgicNaoOZxecYABg9DZdOLZw6E3JMEUYAV38sMOKEVZ3p3VdWEDeO-RA7WzHuFU_az-GdEsLJZV4DJ-oCCah1p3ed4mmu9B--y1GeDbC84xHD3uWnChKxglV2TeilQCcWnemT5",
  newOrderMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCbZ7PDYIukvXsmDlFhOufri9Ubai_bgD39Ndw9wz0H3Dqc81jgfggQwr040fYr21c2zC_lKSmZICgrUb225bRCHuUGI84Llb-wbfzQBx6AZoFp-cQgicNaoOZxecYABg9DZdOLZw6E3JMEUYAV38sMOKEVZ3p3VdWEDeO-RA7WzHuFU_az-GdEsLJZV4DJ-oCCah1p3ed4mmu9B--y1GeDbC84xHD3uWnChKxglV2TeilQCcWnemT5",
  customerAvatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ3bd1Iy7lIH13nR8jxlQtrZJn2-S-IqchHj9Yqj6N3QJzbZ3Fm83X0Jgdu3IZu6E8P3PvTuoaxOux41ke5yIr4RVrUBIsc7NjpJZzID8sQK0ChOkKtG91ejRBnZYoBYVGCSm9hAhBogf_iVPTEGXSLu_7hTacSvvtEZtARtW862_w6uO1ErVj4-19cOWG1C1zy9uu5L9NnnZnKVWKdKLWOv_vp7doy71z-YWdULEBhd1gMmaOJqdp",
};

/* ── Delivery Progress ── */

export const shipperDelivery: ShipperDelivery = {
  status: "Đang giao hàng",
  eta: "Đến nơi trong khoảng 10 phút",
  customer: {
    name: "Nguyễn Văn A",
    phone: "0912 xxx 345",
    avatar: shipperMapImages.customerAvatar,
  },
  address: "54 Liễu Giai, P. Cống Vị, Q. Ba Đình, Hà Nội",
  dropoffAddress: "54 Liễu Giai, P. Cống Vị, Q. Ba Đình, Hà Nội",
  orderSummary: "2x Phở Bò Tái Nạm",
};

/* ── Earnings ── */

export const shipperEarnings: ShipperEarningsSummary = {
  balance: "1.250.000đ",
  weeklyOrders: 45,
  weeklyKm: "120km",
  weeklyDistance: 120,
};

export const shipperTransactions: ShipperTransaction[] = [
  {
    id: "1",
    restaurantName: "Phở Thìn Lò Đúc",
    time: "Hôm nay",
    status: "Hoàn thành",
    amount: "+85.000đ",
  },
  {
    id: "2",
    restaurantName: "Bún Chả Đắc Kim",
    time: "Hôm nay",
    status: "Hoàn thành",
    amount: "+65.000đ",
  },
  {
    id: "3",
    restaurantName: "The Pizza Company",
    time: "Hôm qua",
    status: "Hoàn thành",
    amount: "+120.000đ",
    faded: true,
  },
];

/* ── Profile ── */

export const shipperProfile: ShipperProfile = {
  name: "Nguyễn Văn A",
  shipperId: "SHP-88421",
  rating: 4.9,
  totalTrips: "1.250+",
  verified: true,
  avatarUrl: shipperDriverProfile.avatarUrl,
  phone: "0912 345 678",
  email: "nguyen.vana@eatnow.vn",
  joinDate: "12/03/2023",
  operatingArea: "Ba Đình - Đống Đa - Cầu Giấy (Hà Nội)",
  vehicleType: "Xe máy (Honda Wave Alpha)",
  licensePlate: "29-B1 868.29",
  personalInfo: [
    { label: "Họ và tên", value: "Nguyễn Văn A" },
    { label: "Số điện thoại", value: "0912 345 678" },
    { label: "Email", value: "nguyen.vana@eatnow.vn" },
    { label: "Ngày tham gia", value: "12/03/2023 (1 năm 8 tháng)" },
    { label: "Khu vực chính", value: "Ba Đình - Đống Đa - Cầu Giấy (Hà Nội)" },
  ],
  vehicleInfo: [
    { label: "Phương tiện", value: "Xe máy (Honda Wave Alpha)" },
    { label: "Biển kiểm soát", value: "29-B1 868.29", tone: "mono" },
    { label: "Màu sơn xe", value: "Đỏ - Đen" },
    { label: "Giấy tờ & Bảo hiểm", value: "Còn hiệu lực (HSD: 12/2025)", tone: "success" },
  ],
  bankInfo: [
    { label: "Ngân hàng", value: "Vietcombank (CN Thăng Long)" },
    { label: "Số tài khoản", value: "•••• •••• 8899", tone: "mono" },
    { label: "Chủ tài khoản", value: "NGUYEN VAN A" },
    { label: "Phương thức rút", value: "Tự động hàng ngày (0đ phí)", tone: "brand" },
  ],
};
