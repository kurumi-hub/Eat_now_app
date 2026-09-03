"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shipperNewOrder, shipperMapImages } from "@/components/shipper/shipperFlowData";

export default function ShipperNewOrderPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const strokeDashoffset = 283 - (timeLeft / 30) * 283;

  return (
    <div className="bg-shipper-surface h-screen w-screen overflow-hidden text-sm text-shipper-on-surface antialiased flex flex-col items-center justify-center relative font-sans">
      {/* Map Background Simulator */}
      <div
        className="absolute inset-0 z-0 bg-[#e5e3df]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <img
          className="w-full h-full object-cover opacity-60"
          alt="Bản đồ định vị"
          src={shipperMapImages.newOrder}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-shipper-primary rounded-full animate-[shipperPulseRing_2s_cubic-bezier(0.215,0.61,0.355,1)_infinite]"></div>
            <div className="relative w-6 h-6 bg-shipper-primary rounded-full border-2 border-white flex items-center justify-center z-10 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Dimmer */}
      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm"></div>

      {/* Button quay về màn hình chính của dự án */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-stone-800 text-xs font-bold shadow-lg hover:bg-white hover:text-shipper-primary transition-all active:scale-95 border border-stone-200"
        title="Quay về trang chủ EatNow"
      >
        <span className="material-symbols-outlined text-base">storefront</span>
        <span>Về trang chủ</span>
      </Link>

      {/* Modal Container */}
      <main className="relative z-20 w-full max-w-[400px] h-full md:h-auto md:max-h-[750px] flex flex-col justify-end md:justify-center p-0 md:p-4 pointer-events-none">
        <div className="w-full bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col animate-[shipperSlideUp_0.3s_ease-out]">
          {/* Header: Timer & Earnings */}
          <div className="bg-shipper-primary text-white p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <h2 className="text-2xl font-bold mb-1 z-10">Đơn Hàng Mới</h2>
            <div className="text-xl font-extrabold text-white mb-4 z-10">{shipperNewOrder.earnings}</div>

            {/* Circular Timer */}
            <div className="relative w-16 h-16 flex items-center justify-center z-10">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" fill="none" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="4"></circle>
                <circle
                  cx="32"
                  cy="32"
                  fill="none"
                  r="28"
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeWidth="4"
                  style={{
                    strokeDasharray: 283,
                    strokeDashoffset: strokeDashoffset,
                    transition: "stroke-dashoffset 1s linear",
                  }}
                ></circle>
              </svg>
              <span className="font-bold text-base text-white">{timeLeft}s</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 flex flex-col gap-4 bg-white overflow-y-auto max-h-[50vh] md:max-h-none">
            {/* Metrics Bar */}
            <div className="flex justify-between items-center bg-shipper-surface-container rounded-xl p-3.5 shadow-sm border border-shipper-border">
              <div className="flex flex-col items-center w-1/3">
                <span
                  className="material-symbols-outlined text-shipper-primary mb-0.5 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  route
                </span>
                <span className="text-base font-bold text-shipper-on-surface">{shipperNewOrder.distance}</span>
                <span className="text-[11px] text-shipper-on-surface-variant">Tổng quãng đường</span>
              </div>
              <div className="w-[1px] h-8 bg-shipper-divider"></div>
              <div className="flex flex-col items-center w-1/3">
                <span
                  className="material-symbols-outlined text-shipper-warning mb-0.5 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  schedule
                </span>
                <span className="text-base font-bold text-shipper-on-surface">{shipperNewOrder.estimatedTime}</span>
                <span className="text-[11px] text-shipper-on-surface-variant">Thời gian dự kiến</span>
              </div>
            </div>

            {/* Locations List */}
            <div className="relative flex flex-col gap-5 mt-1">
              {/* Path Line connecting icons */}
              <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-shipper-divider z-0 border-l-2 border-dashed border-shipper-border"></div>

              {/* Pickup */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                  <span
                    className="material-symbols-outlined text-[13px] text-shipper-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    storefront
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-shipper-on-surface-variant uppercase tracking-wider font-semibold">
                    Điểm lấy món
                  </span>
                  <span className="text-sm font-bold text-shipper-on-surface line-clamp-1">
                    {shipperNewOrder.pickup.name}
                  </span>
                  <span className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                    {shipperNewOrder.pickup.address}
                  </span>
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                  <span
                    className="material-symbols-outlined text-[13px] text-shipper-success"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-shipper-on-surface-variant uppercase tracking-wider font-semibold">
                    Điểm giao hàng
                  </span>
                  <span className="text-sm font-bold text-shipper-on-surface line-clamp-1">
                    {shipperNewOrder.dropoff.name}
                  </span>
                  <span className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                    {shipperNewOrder.dropoff.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-white border-t border-shipper-border flex flex-col gap-2 shrink-0 pb-safe">
            <button
              onClick={() => router.push("/shipper/delivery")}
              type="button"
              className="w-full h-12 bg-shipper-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Nhận Đơn
            </button>
            <Link
              href="/shipper"
              className="w-full h-12 bg-shipper-hover text-shipper-primary hover:bg-orange-100 rounded-xl font-bold text-sm active:scale-98 transition-all flex items-center justify-center border border-transparent"
            >
              Từ chối
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
