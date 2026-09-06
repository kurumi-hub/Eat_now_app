"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { HomeFlashSale } from "@/types/flashSale";

type HomeFlashSaleProps = {
  campaign: HomeFlashSale;
};

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0"));
}

export default function HomeFlashSale({ campaign }: HomeFlashSaleProps) {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const serverOffset = Date.parse(campaign.serverTime) - Date.now();
    const endsAt = Date.parse(campaign.endsAt);
    const update = () => setRemainingMs(Math.max(0, endsAt - (Date.now() + serverOffset)));

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [campaign.endsAt, campaign.serverTime]);

  useEffect(() => {
    if (remainingMs !== 0) return;
    const refreshTimer = window.setTimeout(() => router.refresh(), 1200);
    return () => window.clearTimeout(refreshTimer);
  }, [remainingMs, router]);

  const timeParts = useMemo(
    () => remainingMs === null ? ["--", "--", "--"] : formatRemaining(remainingMs),
    [remainingMs]
  );

  return (
    <section id="flash-sale" className="home-section home-flash-sale" aria-labelledby="flash-sale-title">
      <div className="home-flash-sale__heading">
        <div>
          <p><LocalFireDepartmentOutlinedIcon /> Flash Sale</p>
          <h2 id="flash-sale-title">{campaign.name}</h2>
          <span>{campaign.subtitle}</span>
        </div>
        <div className="home-flash-sale__countdown" aria-label={`Còn ${timeParts[0]} giờ ${timeParts[1]} phút ${timeParts[2]} giây`}>
          <AccessTimeOutlinedIcon aria-hidden="true" />
          <span>{timeParts[0]}</span><i>:</i><span>{timeParts[1]}</span><i>:</i><span>{timeParts[2]}</span>
        </div>
      </div>

      <div className="home-flash-sale__track">
        {campaign.items.map((item) => {
          const discountPercent = Math.max(1, Math.round((1 - item.salePrice / item.originalPrice) * 100));
          const soldPercent = Math.min(100, Math.round((item.soldQuantity / item.stockLimit) * 100));
          const href = `/restaurants/${item.restaurantSlug}/foods/${item.foodId}?sale=${item.id}`;
          return (
            <Link className="home-flash-sale-card" href={href} key={item.id}>
              <div className="home-flash-sale-card__media">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    unoptimized
                    sizes="(max-width: 760px) 70vw, (max-width: 1024px) 36vw, 260px"
                  />
                ) : (
                  <span>EatNow</span>
                )}
                <strong>-{discountPercent}%</strong>
              </div>
              <div className="home-flash-sale-card__body">
                <small>{item.restaurantName}</small>
                <h3>{item.foodName}</h3>
                <div className="home-flash-sale-card__price">
                  <b>{formatPrice(item.salePrice)}</b>
                  <del>{formatPrice(item.originalPrice)}</del>
                </div>
                <div className="home-flash-sale-card__stock">
                  <span><i style={{ width: `${soldPercent}%` }} /></span>
                  <small>{item.remainingQuantity <= 5 ? `Chỉ còn ${item.remainingQuantity}` : `Đã bán ${item.soldQuantity}`}</small>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
