"use client";

import React from "react";
import { shipperProfile } from "@/components/shipper/shipperFlowData";

export default function ShipperProfilePage() {
  return (
    <div className="max-w-[420px] mx-auto flex flex-col gap-4 py-4">
      {/* BEGIN: HeroProfileCard */}
      <section
        className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_-2px_rgba(217,71,32,0.06),0_4px_16px_0_rgba(0,0,0,0.04)] border border-orange-50 text-center relative flex flex-col items-center"
        data-purpose="driver-hero-summary"
      >
        {/* Avatar Wrapper with Camera Action */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-orange-100 shadow-md">
            <img
              alt="Chân dung tài xế"
              className="w-full h-full object-cover"
              src={shipperProfile.avatarUrl}
            />
          </div>
          {/* Edit photo button */}
          <button
            aria-label="Cập nhật ảnh đại diện"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-shipper-primary text-white flex items-center justify-center border-2 border-white shadow-sm hover:opacity-90 active:scale-95 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          </button>
        </div>

        {/* Shipper Name */}
        <h2 className="text-xl font-bold text-stone-900 leading-snug">{shipperProfile.name}</h2>

        {/* Shipper ID & Rating Badges */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
            Mã: {shipperProfile.shipperId}
          </span>
          <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            <span
              className="material-symbols-outlined text-amber-500 text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-xs font-bold text-stone-800">{shipperProfile.rating}</span>
            <span className="text-[11px] text-stone-500 font-medium">({shipperProfile.totalTrips} chuyến)</span>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="mt-3.5 w-full bg-emerald-50 border border-emerald-200/80 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold">
          <span
            className="material-symbols-outlined text-emerald-600 text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span>Đã xác minh CCCD & Giấy phép lái xe</span>
        </div>
      </section>
      {/* END: HeroProfileCard */}

      {/* BEGIN: SectionPersonalInfo */}
      <section
        className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(217,71,32,0.06),0_4px_16px_0_rgba(0,0,0,0.04)] border border-orange-50/60"
        data-purpose="personal-details-card"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-shipper-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Thông tin cá nhân</h3>
          </div>
          <button type="button" className="text-[11px] text-shipper-primary font-semibold hover:underline">
            Chỉnh sửa
          </button>
        </div>

        <div className="divide-y divide-stone-50 pt-1 text-xs">
          {shipperProfile.personalInfo.map((info, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center gap-2">
              <span className="text-stone-500 shrink-0">{info.label}</span>
              <span className="font-medium text-stone-800 text-right">{info.value}</span>
            </div>
          ))}
        </div>
      </section>
      {/* END: SectionPersonalInfo */}

      {/* BEGIN: SectionVehicleInfo */}
      <section
        className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(217,71,32,0.06),0_4px_16px_0_rgba(0,0,0,0.04)] border border-orange-50/60"
        data-purpose="vehicle-details-card"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-shipper-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Thông tin phương tiện</h3>
          </div>
          <span className="inline-flex items-center text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
            Hợp lệ
          </span>
        </div>

        <div className="divide-y divide-stone-50 pt-1 text-xs">
          {shipperProfile.vehicleInfo.map((info, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center gap-2">
              <span className="text-stone-500 shrink-0">{info.label}</span>
              <span
                className={`font-medium text-right ${
                  info.tone === "mono"
                    ? "font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded"
                    : info.tone === "success"
                    ? "text-emerald-600 font-medium"
                    : "text-stone-800"
                }`}
              >
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </section>
      {/* END: SectionVehicleInfo */}

      {/* BEGIN: SectionBankInfo */}
      <section
        className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(217,71,32,0.06),0_4px_16px_0_rgba(0,0,0,0.04)] border border-orange-50/60"
        data-purpose="bank-details-card"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-shipper-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Tài khoản nhận tiền & Ví</h3>
          </div>
          <button type="button" className="text-[11px] text-shipper-primary font-semibold hover:underline">
            Thay đổi
          </button>
        </div>

        <div className="divide-y divide-stone-50 pt-1 text-xs">
          {shipperProfile.bankInfo.map((info, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center gap-2">
              <span className="text-stone-500 shrink-0">{info.label}</span>
              <span
                className={`font-medium text-right ${
                  info.tone === "mono"
                    ? "font-mono font-medium text-stone-800"
                    : info.tone === "brand"
                    ? "text-shipper-primary font-medium"
                    : "text-stone-800"
                }`}
              >
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </section>
      {/* END: SectionBankInfo */}

      {/* BEGIN: ActionButtons */}
      <section className="space-y-2.5 pt-2" data-purpose="profile-action-buttons">
        <button
          className="w-full bg-shipper-primary hover:opacity-90 active:scale-[0.99] text-white font-semibold py-3.5 px-4 rounded-2xl shadow-md transition duration-150 flex items-center justify-center gap-2 text-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span>Cập nhật hồ sơ</span>
        </button>
        <button
          className="w-full bg-white hover:bg-orange-50/50 active:scale-[0.99] text-stone-700 font-semibold py-3 px-4 rounded-2xl border border-stone-200 shadow-sm transition duration-150 flex items-center justify-center gap-2 text-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-stone-500">lock</span>
          <span>Đổi mật khẩu & Bảo mật</span>
        </button>
      </section>
      {/* END: ActionButtons */}
    </div>
  );
}
