import Link from "next/link";
import {
  IconBike,
  IconBowl,
  IconBurger,
  IconCake,
  IconClock,
  IconCup,
  IconFlame,
  IconLeaf,
  IconMapPin,
  IconPercent,
  IconPizza,
  IconRiceBowl,
  IconSearch,
  IconStar,
  IconTakeoutBox,
  IconUser,
} from "./icons";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import MobileBottomNav from "./MobileBottomNav";

// ---------------------------------------------------------------------
// MOCK DATA — sẽ thay bằng query Supabase thật (restaurants, foods,
// categories, vouchers) khi nối API. Field đặt tên theo đúng cột
// trong 01_schema.sql để sau này swap gần như 1-1.
// ---------------------------------------------------------------------
const categories = [
  { Icon: IconRiceBowl, name: "Cơm phần", bg: "bg-pink-100" },
  { Icon: IconBowl, name: "Bún · Phở · Mì", bg: "bg-[#f2e2d0]" },
  { Icon: IconCup, name: "Trà sữa", bg: "bg-[#e6ead9]" },
  { Icon: IconPizza, name: "Pizza", bg: "bg-pink-100" },
  { Icon: IconBurger, name: "Gà rán · Burger", bg: "bg-[#f2e2d0]" },
  { Icon: IconLeaf, name: "Đồ chay", bg: "bg-[#e6ead9]" },
  { Icon: IconCake, name: "Tráng miệng", bg: "bg-pink-100" },
  { Icon: IconTakeoutBox, name: "Ăn vặt", bg: "bg-[#f2e2d0]" },
];

const vouchers = [
  {
    Icon: IconPercent,
    code: "FREESHIP15",
    title: "Miễn phí vận chuyển",
    desc: "Đơn từ 50.000đ · giảm tối đa 15.000đ",
  },
  {
    Icon: IconPercent,
    code: "GIAM30K",
    title: "Giảm 30.000đ",
    desc: "Áp dụng cho đơn từ 150.000đ",
  },
  {
    Icon: IconFlame,
    code: "MOIQUAY30",
    title: "Giảm 30% đơn đầu",
    desc: "Dành cho khách hàng mới · tối đa 20.000đ",
  },
];

const restaurants = [
  {
    name: "Cơm Tấm Sài Gòn",
    category: "Cơm phần",
    rating_average: 4.8,
    rating_count: 612,
    eta: "15-25 phút",
    distance: "1.2 km",
    price_range: "20.000đ – 60.000đ",
    promo: "Giảm 20%",
    signature: "Sườn nướng than hoa",
    bg: "bg-pink-100",
    Icon: IconRiceBowl,
  },
  {
    name: "Phở Hà Nội Xưa",
    category: "Bún · Phở · Mì",
    rating_average: 4.7,
    rating_count: 389,
    eta: "20-30 phút",
    distance: "0.8 km",
    price_range: "35.000đ – 65.000đ",
    signature: "Nước dùng ninh 12 tiếng",
    bg: "bg-[#f2e2d0]",
    Icon: IconBowl,
  },
  {
    name: "Gong Chiu Trà Sữa",
    category: "Trà sữa",
    rating_average: 4.6,
    rating_count: 940,
    eta: "10-20 phút",
    distance: "0.5 km",
    price_range: "25.000đ – 55.000đ",
    promo: "Freeship",
    signature: "Trân châu đường đen nấu mỗi 2 tiếng",
    bg: "bg-[#e6ead9]",
    Icon: IconCup,
  },
  {
    name: "Pizza Ý Napoli",
    category: "Pizza",
    rating_average: 4.5,
    rating_count: 271,
    eta: "25-35 phút",
    distance: "2.1 km",
    price_range: "89.000đ – 189.000đ",
    signature: "Lò củi 400°C",
    bg: "bg-pink-100",
    Icon: IconPizza,
  },
  {
    name: "Gà Rán KFriedC",
    category: "Gà rán · Burger",
    rating_average: 4.4,
    rating_count: 803,
    eta: "15-25 phút",
    distance: "1.5 km",
    price_range: "45.000đ – 120.000đ",
    signature: "Gà tẩm bột giòn kiểu Hàn",
    bg: "bg-[#f2e2d0]",
    Icon: IconBurger,
  },
  {
    name: "Chay Thanh Tịnh",
    category: "Đồ chay",
    rating_average: 4.9,
    rating_count: 156,
    eta: "20-30 phút",
    distance: "1.9 km",
    price_range: "30.000đ – 70.000đ",
    signature: "Rau hái trong ngày",
    bg: "bg-[#e6ead9]",
    Icon: IconLeaf,
  },
];

const popularFoods = [
  {
    name: "Cơm sườn bì chả",
    restaurant: "Cơm Tấm Sài Gòn",
    base_price: 42000,
    rating_average: 4.8,
    bg: "bg-pink-100",
    Icon: IconRiceBowl,
    hot: true,
  },
  {
    name: "Phở bò tái nạm",
    restaurant: "Phở Hà Nội Xưa",
    base_price: 49000,
    rating_average: 4.7,
    bg: "bg-[#f2e2d0]",
    Icon: IconBowl,
    hot: true,
  },
  {
    name: "Trà sữa trân châu đường đen",
    restaurant: "Gong Chiu Trà Sữa",
    base_price: 35000,
    rating_average: 4.6,
    bg: "bg-[#e6ead9]",
    Icon: IconCup,
  },
  {
    name: "Pizza hải sản phô mai",
    restaurant: "Pizza Ý Napoli",
    base_price: 129000,
    rating_average: 4.5,
    bg: "bg-pink-100",
    Icon: IconPizza,
    hot: true,
  },
  {
    name: "Gà rán giòn cay",
    restaurant: "Gà Rán KFriedC",
    base_price: 55000,
    rating_average: 4.4,
    bg: "bg-[#f2e2d0]",
    Icon: IconBurger,
  },
  {
    name: "Cơm chay thập cẩm",
    restaurant: "Chay Thanh Tịnh",
    base_price: 38000,
    rating_average: 4.9,
    bg: "bg-[#e6ead9]",
    Icon: IconLeaf,
    hot: true,
  },
];

// Từ khoá được tìm nhiều nhất quanh khu vực này — bấm là tìm luôn
const quickPicks = ["Cơm tấm", "Phở bò", "Trà sữa", "Bún chả", "Gà rán"];

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 font-display font-extrabold text-[22px] shrink-0 ${
        light ? "text-white" : "text-pink-600"
      }`}
    >
      <span className="inline-block w-3 h-3 rounded-full bg-mango" />
      EatNow
    </div>
  );
}

const navLinks = [
  { href: "#thuc-don", label: "Thực đơn" },
  { href: "#uu-dai", label: "Ưu đãi" },
  { href: "#quan-an", label: "Quán ăn gần bạn" },
  { href: "#danh-gia", label: "Đánh giá" },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div id="top" className="flex flex-col flex-1 pb-24 md:pb-0">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-ink/[0.08]">
        <nav className="max-w-[1160px] mx-auto flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden md:flex gap-9 font-semibold text-[15px] text-ink">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-pink-600 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-[14px] font-semibold text-ink">
                Chào, {user.user_metadata?.full_name?.split(" ").pop() || "bạn"}
              </span>
              <form action={logout} className="hidden md:block">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-pink-300 px-5 py-2.5 text-[14px] font-bold text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </form>
              {/* icon tài khoản — chỉ hiện trên mobile, thay cho nút chữ */}
              <Link
                href="#"
                aria-label="Tài khoản"
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 text-pink-600"
              >
                <IconUser className="w-[18px] h-[18px]" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-[14px] font-bold text-ink hover:text-pink-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex items-center justify-center rounded-lg bg-pink-500 px-[22px] py-2.5 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Đăng ký
              </Link>
              {/* icon đăng nhập — chỉ hiện trên mobile, thay cho 2 nút chữ */}
              <Link
                href="/login"
                aria-label="Đăng nhập"
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white"
              >
                <IconUser className="w-[18px] h-[18px]" />
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* =================================================================
          HERO — "bảng hiệu quán ăn": khối đỏ full-bleed, chữ Baloo cỡ đại
          nói đúng kiểu gọi món ngoài quán. Tấm phiếu đặt hàng (ticket)
          đè lên mép dưới khối đỏ — đây là chi tiết ký hiệu của cả trang.
          ================================================================= */}
      <section className="relative">
        <div className="relative bg-pink-500 text-white overflow-hidden pt-14 pb-32 sm:pt-20 sm:pb-40">
          {/* đốm sáng trôi chậm — tạo chiều sâu cho mảng đỏ phẳng */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-drift absolute -top-20 -left-16 w-[380px] h-[380px] rounded-full bg-mango/25 blur-[90px]" />
            <div
              className="animate-drift absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-white/15 blur-[100px]"
              style={{ animationDelay: "-6s" }}
            />
            <div
              className="animate-drift absolute -bottom-24 left-1/3 w-[300px] h-[300px] rounded-full bg-black/25 blur-[80px]"
              style={{ animationDelay: "-12s" }}
            />
          </div>

          <div className="absolute inset-0 paper-grid-light pointer-events-none" />

          {/* icon món ăn mờ, trôi rất chậm — nhắc chủ đề mà không tranh chỗ với chữ */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <IconBowl className="animate-drift absolute top-14 right-[6%] w-16 h-16 sm:top-16 sm:right-[12%] sm:w-28 sm:h-28 text-white/[0.07] sm:text-white/[0.09]" />
            <IconCup
              className="animate-drift absolute bottom-16 right-[22%] w-12 h-12 sm:bottom-24 sm:right-[30%] sm:w-20 sm:h-20 text-white/[0.06] sm:text-white/[0.07]"
              style={{ animationDelay: "-8s" }}
            />
            <IconRiceBowl
              className="animate-drift absolute top-1/2 right-[2%] w-14 h-14 sm:w-24 sm:h-24 text-white/[0.05] sm:text-white/[0.06]"
              style={{ animationDelay: "-14s" }}
            />
          </div>

          {/* chuyển màu về phía đậm ở đáy — giảm chói, tăng độ nổi của chữ trắng */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

          <div className="relative max-w-[1160px] mx-auto px-6">
            <p className="flex items-center gap-2.5 font-bold text-[12px] tracking-[0.2em] uppercase text-white/70 mb-5">
              <span className="animate-pulse-dot inline-block w-2 h-2 rounded-full bg-mango" />
              Đang mở cửa · Bạch Mai, Hà Nội
            </p>

            <h1 className="font-display font-extrabold leading-[0.88] tracking-tight text-[56px] sm:text-[88px] lg:text-[110px]">
              Đói chưa?
              <br />
              <span className="text-mango">Gọi một tô.</span>
            </h1>

            <p className="mt-6 text-[15px] sm:text-[17px] text-white/75 max-w-[440px] leading-relaxed">
              2.043 quán quanh bạn đang đỏ lửa. Chọn quán, gõ món, xe tới
              trong 15 phút.
            </p>
          </div>
        </div>

        {/* PHIẾU ĐẶT HÀNG — đè lên mép khối đỏ, mép răng cưa kiểu hóa đơn.
            Chứa địa chỉ giao + ô tìm món, tức là chức năng thật chứ không
            phải hộp trang trí. */}
        <div className="relative max-w-[1160px] mx-auto px-6 -mt-24 sm:-mt-28">
          <div
            className="ticket-edge relative bg-surface max-w-[720px] px-6 sm:px-9 py-7 shadow-[0_24px_60px_-24px_rgba(26,15,12,0.45)]"
            style={{ "--ticket-notch": "var(--background)" } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.12em] uppercase text-ink-soft">
                <IconMapPin className="w-4 h-4 text-pink-500" />
                Giao đến
              </div>
              <button className="text-[12px] font-bold uppercase tracking-[0.12em] text-pink-600 hover:underline">
                Đổi địa chỉ
              </button>
            </div>

            <p className="font-display font-bold text-[19px] sm:text-[22px] mt-1.5 text-ink">
              12 Tạ Quang Bửu, Bạch Mai, Hà Nội
            </p>

            <div className="dotted-rule text-ink/25 my-6" />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 bg-background rounded-lg px-4 py-3.5 border-2 border-ink/[0.08] focus-within:border-pink-500 transition-colors">
                <IconSearch className="w-5 h-5 text-ink-soft shrink-0" />
                <input
                  type="text"
                  placeholder="Gõ tên món: cơm tấm, phở, trà sữa…"
                  className="flex-1 outline-none text-[15px] placeholder:text-ink-soft/70 bg-transparent"
                />
              </div>
              <button className="lift inline-flex items-center justify-center rounded-lg bg-ink px-8 py-3.5 text-[15px] font-bold text-white">
                Tìm quán
              </button>
            </div>

            {/* Gợi ý tìm nhanh — bấm là ra kết quả, đỡ phải gõ */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-soft mr-1">
                Đang tìm nhiều
              </span>
              {quickPicks.map((q) => (
                <button
                  key={q}
                  className="lift rounded-full bg-pink-50 text-pink-600 text-[12.5px] font-bold px-3.5 py-1.5 hover:bg-pink-100"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="dotted-rule text-ink/25 my-6" />

            {/* Dải trạng thái — nằm trong phiếu, cùng một khối với tìm kiếm
                thay vì trôi nổi bên ngoài */}
            <div className="flex items-center gap-x-6 gap-y-2.5 flex-wrap text-[12.5px] font-semibold text-ink-soft">
              <span className="flex items-center gap-2">
                <span className="animate-pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-mint" />
                142 đơn đang giao quanh đây
              </span>
              <span className="flex items-center gap-1.5">
                <IconClock className="w-4 h-4 text-pink-500" /> Trung bình 15 phút
              </span>
              <span className="flex items-center gap-1.5">
                <IconStar className="w-4 h-4 text-mango" /> 4.7 / 5 từ 12.480 lượt chấm
              </span>
              <span className="flex items-center gap-1.5">
                <IconBike className="w-4 h-4 text-pink-500" /> 2.043 quán đang mở
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* THỰC ĐƠN — thanh lọc theo nhóm món */}
      <section id="thuc-don" className="max-w-[1160px] mx-auto px-6 w-full pt-16 pb-2 reveal">
        <h2 className="font-display font-extrabold text-[13px] tracking-[0.2em] uppercase text-ink-soft mb-4">
          Chọn nhóm món
        </h2>
        <div className="relative -mx-6 px-6">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-proximity pb-1">
            {categories.map((c, i) => (
              <a
                key={c.name}
                href="#quan-an"
                className={`shrink-0 snap-start inline-flex items-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-[13.5px] font-bold border-2 active:scale-[0.97] ${
                  i === 0
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink border-ink/[0.1] hover:bg-pink-50 hover:border-pink-500/40"
                }`}
                style={{ transition: "background-color .28s var(--ease-soft), border-color .28s var(--ease-soft), transform .12s var(--ease-soft)" }}
              >
                <c.Icon className="w-4 h-4" />
                {c.name}
              </a>
            ))}
          </div>
          {/* gợi ý còn nội dung để cuộn — chỉ trên mobile */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-background to-transparent" />
        </div>
      </section>

      {/* =================================================================
          BẢNG XẾP HẠNG QUÁN — thay lưới card bằng bảng menu đánh số.
          Số ở đây là THỨ HẠNG thật (quán được đặt nhiều nhất tuần), nên
          việc đánh số mang thông tin chứ không phải trang trí.
          ================================================================= */}
      <section id="quan-an" className="max-w-[1160px] mx-auto px-6 w-full py-14">
        <div className="flex items-end justify-between gap-4 mb-2">
          <div>
            <h2 className="font-display font-extrabold text-[30px] sm:text-[40px] leading-none tracking-tight">
              Quán đắt khách tuần này
            </h2>
            <p className="text-[13.5px] text-ink-soft mt-2">
              Xếp theo số đơn trong bán kính 3 km quanh bạn
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:block text-[12px] font-bold uppercase tracking-[0.12em] text-pink-600 hover:underline shrink-0 pb-1"
          >
            Xem tất cả
          </a>
        </div>

        <div className="mt-9 stagger flex flex-col gap-1">
          {restaurants.map((r, i) => (
            <a
              key={r.name}
              href="#"
              className="rank-row group grid grid-cols-[40px_1fr_auto] sm:grid-cols-[74px_92px_1fr_auto] items-start gap-3.5 sm:gap-7 py-5 sm:py-6 px-3 sm:px-4 -mx-3 sm:-mx-4"
            >
              {/* Thứ hạng */}
              <span className="rank-numeral font-display font-extrabold text-[34px] sm:text-[54px] leading-none text-ink/35 self-start pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Ảnh món (hiện đang là icon trên nền màu) */}
              <div
                className={`hidden sm:flex relative h-[92px] w-[92px] rounded-xl items-center justify-center overflow-hidden ${r.bg}`}
              >
                <r.Icon className="zoom-slow w-10 h-10 text-ink/70" />
              </div>

              {/* Thông tin quán */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3
                    className="font-display font-extrabold text-[18px] sm:text-[22px] leading-tight tracking-tight group-hover:text-pink-600"
                    style={{ transition: "color .42s var(--ease-soft)" }}
                  >
                    {r.name}
                  </h3>
                  {r.promo && (
                    <span className="bg-mango text-ink text-[10.5px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded">
                      {r.promo}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-ink-soft mt-1 truncate">
                  {r.category} · {r.signature}
                </p>
                <div className="flex items-center gap-3.5 mt-2 text-[12.5px] font-semibold text-ink-soft">
                  <span className="flex items-center gap-1 text-ink">
                    <IconStar className="w-3.5 h-3.5 text-mango" />
                    {r.rating_average}
                    <span className="font-normal text-ink-soft">({r.rating_count})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" />
                    {r.eta}
                  </span>
                  <span className="hidden sm:inline">{r.distance}</span>
                </div>
              </div>

              {/* Khoảng giá */}
              <div className="text-right shrink-0">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft font-bold hidden sm:block">
                  Khoảng giá
                </p>
                <p className="font-display font-bold text-[13.5px] sm:text-[15px] text-ink mt-0.5 whitespace-nowrap">
                  {r.price_range}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =================================================================
          ƯU ĐÃI — mỗi voucher là một tấm phiếu cắt rời thật, dùng lại
          mô-típ răng cưa của phiếu đặt hàng ở hero.
          ================================================================= */}
      <section id="uu-dai" className="bg-ink py-16 mt-4">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-9">
            <h2 className="font-display font-extrabold text-[30px] sm:text-[40px] leading-none tracking-tight text-white">
              Phiếu giảm giá
              <br />
              <span className="text-mango">còn hiệu lực hôm nay</span>
            </h2>
            <a
              href="#"
              className="hidden sm:block text-[12px] font-bold uppercase tracking-[0.12em] text-white/60 hover:text-white transition-colors shrink-0 pb-1"
            >
              Xem tất cả
            </a>
          </div>

          <div className="relative -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-3 gap-5 sm:gap-7 overflow-x-auto sm:overflow-visible no-scrollbar snap-x snap-mandatory stagger pb-1">
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  className="ticket-edge coupon relative shrink-0 w-[78vw] sm:w-auto snap-start bg-surface px-6 py-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)]"
                  style={{ "--ticket-notch": "var(--ink)" } as React.CSSProperties}
                >
                  <span className="coupon-shine" />
                  <v.Icon className="w-7 h-7 text-pink-500" />
                  <h3 className="font-display font-extrabold text-[19px] leading-tight mt-4 text-ink">
                    {v.title}
                  </h3>
                  <p className="text-[13px] text-ink-soft mt-1.5 leading-snug">{v.desc}</p>

                  <div className="dotted-rule text-ink/25 my-5" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="coupon-code font-display font-extrabold tracking-[0.1em] text-[15px] text-pink-600">
                      {v.code}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Chạm để lưu
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* gợi ý còn nội dung để cuộn — chỉ trên mobile */}
            <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-14 bg-gradient-to-l from-ink to-transparent" />
          </div>
        </div>
      </section>

      {/* MÓN ĐANG NÓNG — carousel, hơi bốc lên trên món đang hot (dùng
          animate-steam có sẵn) */}
      <section className="max-w-[1160px] mx-auto px-6 w-full py-16">
        <div className="flex items-end justify-between gap-4 mb-7 reveal">
          <div>
            <h2 className="font-display font-extrabold text-[30px] sm:text-[40px] leading-none tracking-tight">
              Món đang nóng
            </h2>
            <p className="text-[13.5px] text-ink-soft mt-2">
              Vừa ra lò trong 30 phút qua
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:block text-[12px] font-bold uppercase tracking-[0.12em] text-pink-600 hover:underline shrink-0 pb-1"
          >
            Xem tất cả
          </a>
        </div>

        <div className="relative -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-5 sm:overflow-x-auto sm:pb-3 sm:scrollbar-brand sm:snap-x sm:snap-mandatory pb-4 pt-1">
            {popularFoods.map((f) => (
              <a
                key={f.name}
                href="#"
                className="lift group w-full sm:shrink-0 sm:w-[200px] sm:snap-start bg-surface rounded-xl overflow-hidden border border-ink/[0.12] hover:shadow-[0_18px_40px_-20px_rgba(26,15,12,0.4)]"
              >
                <div
                  className={`relative h-[110px] sm:h-[140px] flex items-center justify-center overflow-hidden ${f.bg}`}
                >
                  {/* hơi nóng bốc lên — chỉ hiện ở món đang hot */}
                  {f.hot && (
                    <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center gap-3">
                      <span className="animate-steam block w-[3px] h-8 rounded-full bg-white/70 blur-[1.5px]" />
                      <span
                        className="animate-steam block w-[3px] h-11 rounded-full bg-white/70 blur-[1.5px]"
                        style={{ animationDelay: "1.5s" }}
                      />
                      <span
                        className="animate-steam block w-[3px] h-8 rounded-full bg-white/70 blur-[1.5px]"
                        style={{ animationDelay: "2.9s" }}
                      />
                    </div>
                  )}
                  <f.Icon className="zoom-slow w-10 h-10 sm:w-14 sm:h-14 text-ink/70" />
                </div>

                <div className="p-3 sm:p-4 flex flex-col min-h-[104px] sm:min-h-[122px]">
                  <h3
                    className="font-display font-bold text-[13.5px] sm:text-[15px] leading-tight line-clamp-2 group-hover:text-pink-600"
                    style={{ transition: "color .28s var(--ease-soft)" }}
                  >
                    {f.name}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-ink-soft mt-1 truncate">{f.restaurant}</p>

                  <div className="dotted-rule text-ink/20 my-2.5 sm:my-3 mt-auto" />

                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-[15px] sm:text-[17px] text-ink">
                      {formatVnd(f.base_price)}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] sm:text-[12.5px] font-bold">
                      <IconStar className="w-3.5 h-3.5 text-mango" />
                      {f.rating_average}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {/* gợi ý còn nội dung để cuộn — chỉ khi ở chế độ cuộn ngang (sm trở lên) */}
          <div className="hidden sm:block pointer-events-none absolute right-0 top-1 bottom-4 w-12 bg-gradient-to-l from-background to-transparent" />
        </div>
      </section>

      {/* CAM KẾT — ba dòng, đặt trên nền kẻ ô như tờ giấy ghi đơn */}
      <section
        id="danh-gia"
        className="paper-grid border-y-2 border-ink/10 py-16"
      >
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 stagger">
            <div>
              <IconClock className="w-7 h-7 text-pink-500" />
              <p className="font-display font-extrabold text-[26px] leading-tight mt-4 tracking-tight">
                Nóng khi tới cửa
              </p>
              <p className="text-[13.5px] text-ink-soft mt-2 leading-relaxed max-w-[260px]">
                Ưu tiên quán gần địa chỉ giao, trung bình 15 phút từ lúc bếp
                nhận đơn.
              </p>
            </div>
            <div>
              <IconBike className="w-7 h-7 text-pink-500" />
              <p className="font-display font-extrabold text-[26px] leading-tight mt-4 tracking-tight">
                Biết xe đang ở đâu
              </p>
              <p className="text-[13.5px] text-ink-soft mt-2 leading-relaxed max-w-[260px]">
                Theo dõi tài xế trên bản đồ theo thời gian thực, không phải
                đoán.
              </p>
            </div>
            <div>
              <IconStar className="w-7 h-7 text-mango" />
              <p className="font-display font-extrabold text-[26px] leading-tight mt-4 tracking-tight">
                Đánh giá từ người ăn thật
              </p>
              <p className="text-[13.5px] text-ink-soft mt-2 leading-relaxed max-w-[260px]">
                Chỉ tài khoản đã đặt đơn mới chấm sao được, trung bình 4.7/5.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-footer text-white pt-16 pb-7">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-9">
            <div>
              <Logo light />
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mt-3">
                Ứng dụng đặt đồ ăn giao nhanh, thực đơn phong phú từ hàng
                nghìn quán ăn quanh bạn.
              </p>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-mango font-bold mb-4">
                Sản phẩm
              </h3>
              <ul className="flex flex-col gap-2.5 text-white/70 text-sm">
                <li>
                  <a href="#thuc-don" className="hover:text-white transition-colors">
                    Thực đơn
                  </a>
                </li>
                <li>
                  <a href="#quan-an" className="hover:text-white transition-colors">
                    Quán ăn gần bạn
                  </a>
                </li>
                <li>
                  <a href="#uu-dai" className="hover:text-white transition-colors">
                    Ưu đãi
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-mango font-bold mb-4">
                Công ty
              </h3>
              <ul className="flex flex-col gap-2.5 text-white/70 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tuyển dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Đối tác quán ăn
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-mango font-bold mb-4">
                Hỗ trợ
              </h3>
              <ul className="flex flex-col gap-2.5 text-white/70 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Điều khoản
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex justify-between flex-wrap gap-3 text-[13px] text-white/40">
            <span>© 2026 EatNow. Đói bụng, có ngay.</span>
            <span>Thiết kế tại Việt Nam</span>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}
