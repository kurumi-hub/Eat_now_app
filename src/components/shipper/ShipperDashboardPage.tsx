"use client";

import Link from "next/link";
import { shipperDailyStats, shipperActiveOrder, shipperMapImages } from "@/components/shipper/shipperFlowData";

export default function ShipperDashboardPage() {
  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-6 py-4">
      {/* New Order Simulation Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-shipper-primary text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping"></span>
          <span className="text-xs sm:text-sm font-semibold">Đang tìm đơn hàng mới trong khu vực...</span>
        </div>
        <Link
          href="/shipper/new-order"
          className="text-xs bg-white text-shipper-primary font-bold px-3 py-1.5 rounded-xl shadow-sm hover:bg-orange-50 active:scale-95 transition-all whitespace-nowrap"
        >
          Mô phỏng đơn mới
        </Link>
      </div>

      {/* Daily Stats Section */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-shipper-on-surface">Hôm nay</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Earnings Card */}
          <div className="col-span-2 md:col-span-1 bg-shipper-surface-white p-4 rounded-2xl shadow-sm border border-shipper-border flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-shipper-secondary">
              <span className="material-symbols-outlined text-xl">payments</span>
              <span className="text-sm font-medium">Thu nhập</span>
            </div>
            <div className="text-3xl font-extrabold text-shipper-primary tracking-tight">
              {shipperDailyStats.earnings}
            </div>
          </div>
          {/* Trips Card */}
          <div className="bg-shipper-surface-white p-4 rounded-2xl shadow-sm border border-shipper-border flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-shipper-secondary">
              <span className="material-symbols-outlined text-xl">two_wheeler</span>
              <span className="text-sm font-medium">Chuyến</span>
            </div>
            <div className="text-3xl font-extrabold text-shipper-on-surface">
              {shipperDailyStats.trips}
            </div>
          </div>
          {/* Rating Card */}
          <div className="bg-shipper-surface-white p-4 rounded-2xl shadow-sm border border-shipper-border flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-shipper-secondary">
              <span
                className="material-symbols-outlined text-xl text-shipper-warning"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-sm font-medium">Đánh giá</span>
            </div>
            <div className="text-3xl font-extrabold text-shipper-on-surface">
              {shipperDailyStats.rating}
            </div>
          </div>
        </div>
      </section>

      {/* Active Orders Section */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-shipper-on-surface">Đơn hàng đang giao</h2>
        <div className="bg-shipper-surface-white rounded-2xl shadow-sm border border-shipper-border overflow-hidden">
          {/* Map Area Placeholder */}
          <Link href="/shipper/delivery" className="block group">
            <div
              className="h-[150px] w-full bg-shipper-surface-container relative bg-cover bg-center transition-transform group-hover:scale-[1.01]"
              style={{ backgroundImage: `url('${shipperMapImages.dashboard}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 right-3 bg-white px-3 py-1.5 rounded-full text-xs font-bold text-shipper-primary shadow-sm border border-shipper-border flex items-center gap-1 group-hover:bg-orange-50 transition-colors">
                <span className="material-symbols-outlined text-base">map</span>
                Xem bản đồ
              </div>
            </div>
          </Link>

          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-shipper-surface-container text-shipper-primary text-xs font-semibold rounded-full mb-2">
                  {shipperActiveOrder.status}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-shipper-on-surface">
                  {shipperActiveOrder.restaurantName}
                </h3>
                <p className="text-xs sm:text-sm text-shipper-secondary mt-0.5">
                  {shipperActiveOrder.restaurantAddress}
                </p>
              </div>
              <div className="text-right">
                <div className="text-base sm:text-lg font-bold text-shipper-primary">
                  {shipperActiveOrder.amount}
                </div>
                <div className="text-xs text-shipper-secondary mt-0.5">
                  {shipperActiveOrder.paymentMethod}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/shipper/delivery"
                className="flex-1 py-3 bg-shipper-primary hover:opacity-90 active:scale-95 text-shipper-on-primary font-semibold text-sm rounded-xl transition-all shadow-[0px_8px_20px_rgba(175,41,0,0.2)] text-center"
              >
                Đã đến nơi lấy
              </Link>
              <button
                type="button"
                className="w-12 h-12 flex items-center justify-center bg-shipper-hover text-shipper-primary rounded-xl active:scale-95 transition-transform border border-shipper-border shadow-sm hover:bg-orange-100"
              >
                <span className="material-symbols-outlined text-xl">call</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-shipper-on-surface">Tiện ích</h2>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <Link
            href="/shipper/earnings"
            className="bg-shipper-surface-white p-3.5 rounded-2xl shadow-sm border border-shipper-border flex flex-col items-center justify-center gap-1.5 hover:bg-shipper-hover transition-all active:scale-95 text-center"
          >
            <span className="material-symbols-outlined text-shipper-primary text-2xl sm:text-3xl">history</span>
            <span className="text-xs sm:text-sm font-semibold text-shipper-on-surface">Lịch sử đơn</span>
          </Link>
          <button
            type="button"
            className="bg-shipper-surface-white p-3.5 rounded-2xl shadow-sm border border-shipper-border flex flex-col items-center justify-center gap-1.5 hover:bg-shipper-hover transition-all active:scale-95 text-center"
          >
            <span className="material-symbols-outlined text-shipper-primary text-2xl sm:text-3xl">support_agent</span>
            <span className="text-xs sm:text-sm font-semibold text-shipper-on-surface">Hỗ trợ</span>
          </button>
          <Link
            href="/"
            className="bg-orange-50/80 p-3.5 rounded-2xl shadow-sm border border-orange-200 flex flex-col items-center justify-center gap-1.5 hover:bg-orange-100 transition-all active:scale-95 text-center"
          >
            <span className="material-symbols-outlined text-shipper-primary text-2xl sm:text-3xl">storefront</span>
            <span className="text-xs sm:text-sm font-bold text-shipper-primary">Về EatNow</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
