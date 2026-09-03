"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shipperDelivery, shipperMapImages } from "@/components/shipper/shipperFlowData";

export default function ShipperDeliveryProgressPage() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      router.push("/shipper/earnings");
    }, 1500);
  };

  return (
    <div className="bg-shipper-bg-cream text-shipper-on-surface text-sm h-screen w-full flex flex-col overflow-hidden relative font-sans">
      {/* Header */}
      <header className="w-full top-0 sticky shadow-sm bg-white/95 backdrop-blur-md z-50 border-b border-shipper-border">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-[640px] mx-auto">
          {/* Back Button */}
          <Link
            href="/shipper"
            className="w-10 h-10 rounded-full hover:bg-shipper-hover transition-colors active:scale-95 text-shipper-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="text-xl font-bold text-shipper-primary flex-1 text-center">
            EatNow Shipper
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-stone-700 bg-orange-50 hover:bg-orange-100 hover:text-shipper-primary transition-all border border-orange-200 shadow-sm"
              title="Quay về trang chủ EatNow"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span className="hidden sm:inline">Về trang chủ</span>
            </Link>
            <button
              type="button"
              aria-label="Thông báo"
              className="w-9 h-9 rounded-full hover:bg-shipper-hover transition-colors active:scale-95 text-shipper-on-surface-variant flex items-center justify-center"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      {/* Map Canvas */}
      <main className="flex-1 relative w-full h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${shipperMapImages.delivery}')` }}
        ></div>
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      </main>

      {/* Floating Success Notification Modal */}
      {isCompleted && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center max-w-[340px] animate-[shipperSlideUp_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-shipper-success flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-1">Giao hàng thành công!</h3>
            <p className="text-xs text-stone-500 mb-4">
              Thu nhập +85.000đ đã được cộng vào tài khoản của bạn.
            </p>
            <div className="text-xs text-shipper-primary font-semibold animate-pulse">
              Đang chuyển đến trang thu nhập...
            </div>
          </div>
        </div>
      )}

      {/* Bottom Drawer Card */}
      <div className="absolute bottom-0 left-0 right-0 max-w-[640px] mx-auto bg-white rounded-t-3xl shadow-[0px_16px_32px_rgba(119,87,77,0.2)] flex flex-col p-4 sm:p-5 gap-3.5 z-40 border-t border-shipper-border">
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-1"></div>

        {/* Status & ETA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-shipper-primary shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                moped
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-shipper-primary leading-snug">
                {shipperDelivery.status}
              </h3>
              <p className="text-xs text-stone-500">{shipperDelivery.eta}</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-shipper-success animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700">Live</span>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* Customer Info & Address */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-stone-100 shrink-0 overflow-hidden ring-2 ring-orange-100">
              <img
                className="w-full h-full object-cover"
                alt="Khách hàng"
                src={shipperDelivery.customer.avatar}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-stone-900 truncate">
                {shipperDelivery.customer.name}
              </h4>
              <p className="text-xs text-stone-500 tracking-wide">{shipperDelivery.customer.phone}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-shipper-hover text-shipper-primary flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-emerald-50 text-shipper-success flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">call</span>
              </button>
            </div>
          </div>

          <div className="bg-shipper-surface-container p-3 rounded-xl border border-shipper-border flex items-start gap-2.5">
            <span className="material-symbols-outlined text-shipper-primary text-xl mt-0.5 shrink-0">
              location_on
            </span>
            <div>
              <p className="text-[11px] font-semibold text-stone-500 mb-0.5 uppercase tracking-wide">
                Giao đến
              </p>
              <p className="text-xs font-semibold text-stone-800 leading-relaxed">
                {shipperDelivery.dropoffAddress}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* Order Items Summary */}
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-stone-400 text-xl mt-0.5 shrink-0">
            receipt_long
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
              Chi tiết đơn hàng
            </p>
            <p className="text-xs font-bold text-stone-800 mt-0.5">{shipperDelivery.orderSummary}</p>
          </div>
        </div>

        {/* Primary Action */}
        <button
          onClick={handleComplete}
          type="button"
          className="w-full py-3.5 bg-shipper-primary hover:opacity-90 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-[0px_8px_20px_rgba(175,41,0,0.25)] transition-all flex items-center justify-center gap-2"
        >
          <span>Đã giao hàng thành công</span>
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </button>
      </div>
    </div>
  );
}
