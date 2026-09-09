"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { customerOrderStatus } from "@/lib/data/customerOrders";
import type { CustomerOrderSummary } from "@/types/customerOrders";
import type { PublicVoucher } from "@/types/voucher";
import { getRecentRestaurants, type RememberedRestaurant } from "@/utils/restaurantHistory";
import type { FavoriteRestaurant } from "@/lib/data/favoriteRestaurants";

type Props = { isAuthenticated: boolean; orders: CustomerOrderSummary[]; vouchers: PublicVoucher[]; favorites: FavoriteRestaurant[] };
const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
function benefit(voucher: PublicVoucher) {
  if (voucher.benefitScope === "shipping") return "Ưu đãi phí giao hàng";
  if (voucher.discountType === "percent") return `Giảm ${voucher.discountValue}%${voucher.maxDiscount ? `, tối đa ${money(voucher.maxDiscount)}` : ""}`;
  return `Giảm ${money(voucher.discountValue)}`;
}

export default function HomePersonalizedSections({ isAuthenticated, orders, vouchers, favorites }: Props) {
  const [recent, setRecent] = useState<RememberedRestaurant[]>([]);
  useEffect(() => {
    const refresh = () => setRecent(getRecentRestaurants());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("eatnow-restaurant-memory", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("eatnow-restaurant-memory", refresh); };
  }, []);
  const activeOrder = useMemo(() => orders.find((order) => !["completed", "cancelled"].includes(order.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((order) => order.status === "completed").slice(0, 3), [orders]);
  const remembered = favorites.length ? favorites.slice(0, 4) : recent.slice(0, 4);
  if (!isAuthenticated && remembered.length === 0) return null;

  return <div className="home-personalized-stack">
    {activeOrder ? <section className="home-active-order" aria-labelledby="active-order-title">
      <div className="home-active-order__icon"><ReceiptLongOutlinedIcon /></div>
      <div className="home-active-order__body"><span>Đơn hàng đang diễn ra</span><h2 id="active-order-title">{activeOrder.restaurant.name}</h2><p>{customerOrderStatus(activeOrder).label} · {activeOrder.items.length} món · {money(activeOrder.pricing.total)}</p></div>
      <Link href={`/orders/${activeOrder.id}`}>Theo dõi đơn</Link>
    </section> : null}
    {completedOrders.length ? <section className="home-section" aria-labelledby="reorder-title">
      <div className="home-section__heading"><div><span className="home-section__eyebrow">Món quen của bạn</span><h2 id="reorder-title">Đặt lại món gần đây</h2></div><Link href="/orders" className="home-section__all-link">Lịch sử đơn</Link></div>
      <div className="home-reorder-grid">{completedOrders.map((order) => <article className="home-reorder-card" key={order.id}>
        <div className="home-reorder-card__media">{order.restaurant.imageUrl ? <Image src={order.restaurant.imageUrl} alt={order.restaurant.name} fill unoptimized sizes="72px" /> : <ReceiptLongOutlinedIcon />}</div>
        <div className="home-reorder-card__body"><h3>{order.restaurant.name}</h3><p>{order.items.slice(0, 2).map((item) => `${item.quantity}× ${item.name}`).join(", ")}{order.items.length > 2 ? ` +${order.items.length - 2} món` : ""}</p><span>{money(order.pricing.total)}</span></div>
        <Link href={`/restaurants/${order.restaurant.slug}`}>Chọn lại món</Link>
      </article>)}</div>
    </section> : null}
    {vouchers.length ? <section className="home-section" aria-labelledby="personal-offers-title">
      <div className="home-section__heading"><div><span className="home-section__eyebrow">Tiết kiệm cho đơn tới</span><h2 id="personal-offers-title">Ưu đãi dành cho bạn</h2></div><Link href="/vouchers" className="home-section__all-link">Xem kho voucher</Link></div>
      <div className="home-personal-offers">{vouchers.slice(0, 3).map((voucher) => <Link href="/vouchers" className="home-personal-offer" key={voucher.id}><LocalOfferOutlinedIcon /><div><strong>{voucher.name}</strong><span>{benefit(voucher)}</span><small>Mã {voucher.code} · HSD {new Date(voucher.expiredAt).toLocaleDateString("vi-VN")}</small></div></Link>)}</div>
    </section> : null}
    {remembered.length ? <section className="home-section" aria-labelledby="remembered-title">
      <div className="home-section__heading"><div><span className="home-section__eyebrow">Quay lại thật nhanh</span><h2 id="remembered-title">{favorites.length ? "Nhà hàng yêu thích" : "Nhà hàng đã xem gần đây"}</h2></div><Link href="/restaurants" className="home-section__all-link">Khám phá thêm</Link></div>
      <div className="home-remembered-grid">{remembered.map((restaurant) => <Link href={`/restaurants/${restaurant.slug}`} className="home-remembered-card" key={restaurant.slug}>
        <div className="home-remembered-card__media">{restaurant.image ? <Image src={restaurant.image} alt={restaurant.name} fill unoptimized sizes="(max-width: 760px) 50vw, 25vw" /> : null}{favorites.some((item) => item.slug === restaurant.slug) ? <span><FavoriteOutlinedIcon fontSize="small" /></span> : null}</div>
        <h3>{restaurant.name}</h3><p><StarOutlinedIcon fontSize="inherit" /> {restaurant.rating} <i>·</i> <AccessTimeOutlinedIcon fontSize="inherit" /> {restaurant.deliveryTime}</p>
      </Link>)}</div>
    </section> : null}
  </div>;
}
