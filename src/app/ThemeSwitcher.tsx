"use client";

import { useState } from "react";
import { IconPalette, IconX, IconCheckCircle } from "./icons";
import { THEMES, useTheme } from "./ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.id === theme);

  return (
    <>
      {open && (
        <button
          aria-label="Đóng bảng chọn theme"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px]"
        />
      )}

      <div className="fixed right-4 sm:right-6 bottom-24 md:bottom-8 z-[70] flex flex-col items-end gap-3">
        {open && (
          <div className="w-[280px] rounded-[22px] bg-surface p-4 shadow-[0_20px_50px_-16px_rgba(20,15,10,0.35)] border border-black/5 animate-[pop_.18s_ease-out]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-[15px] text-ink">
                Chọn theme màu
              </h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="w-7 h-7 grid place-items-center rounded-full text-ink-soft hover:bg-pink-50 transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-ink-soft mb-3">
              {THEMES.length} màu · đang dùng{" "}
              <span className="font-bold" style={{ color: current?.swatch }}>
                {current?.label}
              </span>
            </p>

            <div className="grid grid-cols-5 gap-x-2 gap-y-3 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  aria-label={t.label}
                  className="group flex flex-col items-center gap-1"
                >
                  <span
                    className="w-9 h-9 rounded-full transition-transform group-hover:scale-110 flex items-center justify-center"
                    style={{
                      background: t.swatch,
                      boxShadow:
                        theme === t.id
                          ? `0 0 0 2px white, 0 0 0 4px ${t.swatch}`
                          : "0 0 0 1px rgba(0,0,0,0.06)",
                    }}
                  >
                    {theme === t.id && <IconCheckCircle className="w-4 h-4 text-white" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Đổi theme màu"
          className="w-14 h-14 rounded-full grid place-items-center text-white shadow-[0_14px_30px_-10px_rgba(44,25,18,0.5)] transition-transform hover:-translate-y-0.5 active:scale-95"
          style={{ background: current?.swatch }}
        >
          <IconPalette className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
