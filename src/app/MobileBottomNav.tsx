"use client";

import { useState } from "react";
import { IconHome, IconGrid, IconPercent, IconStore } from "./icons";

const items = [
  { id: "home", label: "Trang chủ", href: "#top", Icon: IconHome },
  { id: "menu", label: "Thực đơn", href: "#thuc-don", Icon: IconGrid },
  { id: "uu-dai", label: "Ưu đãi", href: "#uu-dai", Icon: IconPercent },
  { id: "quan-an", label: "Quán ăn", href: "#quan-an", Icon: IconStore },
];

export default function MobileBottomNav() {
  const [active, setActive] = useState("home");

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-3"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
    >
      <div className="ios-tabbar flex items-center gap-0.5 w-full max-w-[420px] rounded-[26px] bg-surface/85 backdrop-blur-xl border border-black/5 shadow-[0_16px_40px_-14px_rgba(20,15,10,0.35)] px-1.5 py-1.5">
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <a
              key={it.id}
              href={it.href}
              onClick={() => setActive(it.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-[20px] py-2 transition-all ${
                isActive ? "bg-pink-500 text-white" : "text-ink-soft"
              }`}
            >
              <it.Icon className={`w-[19px] h-[19px] ${isActive ? "" : ""}`} />
              <span className="text-[10px] font-bold leading-none">{it.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
