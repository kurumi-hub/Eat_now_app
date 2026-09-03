"use client";

import Link from "next/link";

import {
  footerBrandClassName,
  footerButtonClassName,
  footerClassName,
  footerCopyClassName,
  footerInnerClassName,
  footerLinksClassName,
} from "./tailwindClasses";

type CustomerFooterProps = {
  onPlaceholder?: (message: string) => void;
};

export default function CustomerFooter({ onPlaceholder }: CustomerFooterProps) {
  const handlePlaceholder = (message: string) => {
    if (onPlaceholder) {
      onPlaceholder(message);
    }
  };

  return (
    <footer className={footerClassName}>
      <div className={footerInnerClassName}>
        <Link className={footerBrandClassName} href="/">
          EatNow
        </Link>
        <p className={footerCopyClassName}>
          Nền tảng đặt món ăn trực tuyến nhanh chóng, tiện lợi và chuẩn vị.
        </p>
        <div className={footerLinksClassName}>
          <button
            className={footerButtonClassName}
            type="button"
            onClick={() =>
              handlePlaceholder("Trang giới thiệu sẽ được hoàn thiện sau.")
            }
          >
            Về chúng tôi
          </button>
          <button
            className={footerButtonClassName}
            type="button"
            onClick={() =>
              handlePlaceholder("Chính sách bảo mật sẽ được hoàn thiện sau.")
            }
          >
            Chính sách
          </button>
          <Link
            className={footerButtonClassName}
            href="/shipper"
          >
            Kênh tài xế
          </Link>
          <button
            className={footerButtonClassName}
            type="button"
            onClick={() =>
              handlePlaceholder("Thông tin liên hệ sẽ được hoàn thiện sau.")
            }
          >
            Liên hệ
          </button>
        </div>
      </div>
    </footer>
  );
}
