"use client";

import Link from "next/link";

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
    <footer className="home-footer">
      <div className="home-footer__inner">
        <Link className="home-footer__brand" href="/">
          EatNow
        </Link>
        <p>
          Nền tảng đặt món ăn trực tuyến nhanh chóng, tiện lợi và chuẩn vị.
        </p>
        <div className="home-footer__links">
          <button
            type="button"
            onClick={() =>
              handlePlaceholder("Trang giới thiệu sẽ được hoàn thiện sau.")
            }
          >
            Về chúng tôi
          </button>
          <button
            type="button"
            onClick={() =>
              handlePlaceholder("Chính sách bảo mật sẽ được hoàn thiện sau.")
            }
          >
            Chính sách
          </button>
          <button
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
