"use client";

import React from "react";
import { shipperEarnings, shipperTransactions } from "@/components/shipper/shipperFlowData";

export default function ShipperEarningsPage() {
  return (
    <div className="max-w-[420px] mx-auto flex flex-col gap-6 py-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-shipper-on-surface">Thu nhập & Lịch sử</h2>
      </div>

      {/* Earnings Summary Card */}
      <div className="bg-shipper-surface-white rounded-2xl p-5 border border-shipper-border shadow-[0px_4px_12px_rgba(119,87,77,0.08)] flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-shipper-on-surface-variant font-medium">Số dư hiện tại</span>
          <span className="text-4xl sm:text-[44px] leading-tight font-extrabold tracking-tight text-shipper-primary">
            {shipperEarnings.balance}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-t border-b border-shipper-divider">
          <div className="flex flex-col items-center w-1/2 border-r border-shipper-divider">
            <span className="text-[11px] font-semibold text-shipper-on-surface-variant uppercase tracking-wider">
              Số đơn tuần này
            </span>
            <span className="text-xl font-bold text-shipper-on-surface mt-1">
              {shipperEarnings.weeklyOrders}
            </span>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <span className="text-[11px] font-semibold text-shipper-on-surface-variant uppercase tracking-wider">
              Số km tuần này
            </span>
            <span className="text-xl font-bold text-shipper-on-surface mt-1">
              {shipperEarnings.weeklyKm}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-shipper-primary hover:opacity-90 active:scale-[0.98] text-shipper-on-primary text-base font-semibold rounded-xl py-3.5 transition-all shadow-[0px_8px_20px_rgba(175,41,0,0.2)]"
        >
          Rút tiền
        </button>
      </div>

      {/* Transaction/Order History List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-shipper-on-surface">Lịch sử giao dịch</h3>

        {shipperTransactions.map((tx) => (
          <div
            key={tx.id}
            className={`bg-shipper-surface-white rounded-xl p-3 border border-shipper-border shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
              tx.faded ? "opacity-75" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-shipper-surface-container flex items-center justify-center text-shipper-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-shipper-on-surface line-clamp-1">
                  {tx.restaurantName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-shipper-on-surface-variant">{tx.time}</span>
                  <span className="w-1 h-1 rounded-full bg-shipper-divider"></span>
                  <span className="text-[11px] font-medium text-shipper-success px-2 py-0.5 bg-emerald-50 rounded-full">
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-shipper-primary whitespace-nowrap pl-2">
              {tx.amount}
            </span>
          </div>
        ))}

        <button
          type="button"
          className="w-full text-center text-shipper-primary text-sm font-semibold py-2.5 mt-1 hover:bg-shipper-hover rounded-xl transition-colors active:scale-98"
        >
          Xem tất cả lịch sử
        </button>
      </div>
    </div>
  );
}
