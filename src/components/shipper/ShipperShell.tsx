"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { shipperNavItems, shipperDriverProfile } from "@/components/shipper/shipperFlowData";

type ShipperShellProps = {
  children: ReactNode;
};

export default function ShipperShell({ children }: ShipperShellProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  const isProfile = pathname === "/shipper/profile";

  return (
    <div className="bg-shipper-bg text-shipper-on-surface font-sans min-h-screen pb-[80px]">
      {/* TopAppBar Component */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 py-2.5 shadow-[0px_4px_12px_rgba(119,87,77,0.08)] bg-shipper-bg/95 backdrop-blur-md">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          {isProfile ? (
            <>
              {/* Back button for profile */}
              <div className="flex items-center gap-2">
                <Link
                  href="/shipper"
                  aria-label="Quay lại"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-shipper-hover active:bg-orange-100 transition-colors text-stone-700"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-lg font-bold text-stone-900 tracking-tight">Hồ sơ tài xế</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Button quay trở về màn hình chính của dự án */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 bg-white border border-shipper-border hover:bg-orange-50 hover:text-shipper-primary hover:border-orange-200 shadow-sm transition-all active:scale-95"
                  title="Quay về trang chủ EatNow"
                >
                  <span className="material-symbols-outlined text-base">storefront</span>
                  <span>Về trang chủ</span>
                </Link>
                {/* Notifications Icon */}
                <button
                  aria-label="Thông báo"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-shipper-hover transition-colors text-shipper-primary relative"
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    notifications
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Link href="/shipper/profile" className="block">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-shipper-border shadow-sm hover:ring-2 hover:ring-shipper-primary/30 transition-all">
                    <img
                      alt="Driver profile photo"
                      className="w-full h-full object-cover"
                      src={shipperDriverProfile.avatarUrl}
                    />
                  </div>
                </Link>
                <Link href="/shipper">
                  <h1 className="text-xl sm:text-2xl font-bold text-shipper-primary tracking-tight">
                    EatNow Shipper
                  </h1>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Button quay trở về màn hình chính của dự án */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 bg-white border border-shipper-border hover:bg-orange-50 hover:text-shipper-primary hover:border-orange-200 shadow-sm transition-all active:scale-95"
                  title="Quay về trang chủ EatNow"
                >
                  <span className="material-symbols-outlined text-base">storefront</span>
                  <span>Về trang chủ</span>
                </Link>

                {/* Status Toggle */}
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  type="button"
                  className="flex items-center bg-shipper-surface-high rounded-full p-0.5 cursor-pointer transition-colors"
                >
                  <span
                    className={`text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full shadow-sm transition-all ${
                      isOnline
                        ? "bg-shipper-success text-white"
                        : "bg-stone-400 text-white"
                    }`}
                  >
                    {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                  </span>
                </button>

                <button
                  aria-label="Thông báo"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-shipper-primary hover:bg-shipper-hover transition-colors active:scale-95 duration-200"
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    notifications
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[68px] px-4 max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] mx-auto">
        {children}
      </main>

      {/* BottomNavBar Component */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe py-2 shadow-[0px_16px_32px_rgba(119,87,77,0.16)] bg-white/95 backdrop-blur-md border-t border-shipper-border rounded-t-2xl">
        <div className="max-w-[640px] w-full mx-auto flex justify-around items-center">
          {shipperNavItems.map((item) => {
            const isActive =
              item.href === "/shipper"
                ? pathname === "/shipper"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link key={item.id} href={item.href} className="flex-1 flex justify-center">
                <div
                  className={`flex flex-col items-center justify-center px-3 py-1 rounded-full transition-transform active:scale-90 ${
                    isActive
                      ? "bg-shipper-selected text-shipper-primary font-bold"
                      : "text-shipper-on-surface-variant hover:bg-shipper-hover"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[11px] leading-tight font-medium mt-0.5">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
