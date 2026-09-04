"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import Link from "next/link";

type SiteFooterProps = {
  onPlaceholder?: (message: string) => void;
};

const currentYear = new Date().getFullYear();

export default function SiteFooter({ onPlaceholder }: SiteFooterProps) {
  const showPlaceholder = (message: string) => {
    onPlaceholder?.(message);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__brand-column">
            <Link
              className="site-footer__brand"
              href="/?home=1"
              aria-label="EatNow trang chủ"
            >
              <span className="site-footer__brand-mark" aria-hidden="true">
                <LocalDiningOutlinedIcon />
              </span>
              <span>EatNow</span>
            </Link>
            <p className="site-footer__description">
              Món ngon quanh bạn, giao tận cửa nhanh chóng và an tâm trong từng
              đơn hàng.
            </p>
            <div className="site-footer__trust-note">
              <VerifiedOutlinedIcon fontSize="small" />
              <span>Đối tác được xác minh · Thanh toán an toàn</span>
            </div>
          </section>

          <nav className="site-footer__column" aria-label="Khám phá EatNow">
            <h2>Khám phá</h2>
            <Link href="/?home=1">Trang chủ</Link>
            <Link href="/#featured-restaurants">Nhà hàng nổi bật</Link>
            <Link href="/vouchers">Ưu đãi và voucher</Link>
            <Link href="/account/seller">Trở thành đối tác</Link>
          </nav>

          <nav className="site-footer__column" aria-label="Thông tin hỗ trợ">
            <h2>Hỗ trợ</h2>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Trung tâm trợ giúp sẽ được bổ sung sau.")
              }
            >
              Trung tâm trợ giúp
            </button>
            <button
              type="button"
              onClick={() => showPlaceholder("Điều khoản sẽ được bổ sung sau.")}
            >
              Điều khoản sử dụng
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Chính sách bảo mật sẽ được bổ sung sau.")
              }
            >
              Chính sách bảo mật
            </button>
          </nav>

          <section className="site-footer__column site-footer__contact">
            <h2>Liên hệ</h2>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Kênh hotline sẽ được cập nhật sau.")
              }
            >
              <PhoneInTalkOutlinedIcon fontSize="small" />
              <span>Hotline hỗ trợ</span>
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Email hỗ trợ sẽ được cập nhật sau.")
              }
            >
              <EmailOutlinedIcon fontSize="small" />
              <span>Gửi yêu cầu hỗ trợ</span>
            </button>
            <span className="site-footer__address">
              <LocationOnOutlinedIcon fontSize="small" />
              <span>EatNow luôn đồng hành cùng bạn</span>
            </span>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>© {currentYear} EatNow. Mọi quyền được bảo lưu.</p>
          <div className="site-footer__socials" aria-label="Mạng xã hội EatNow">
            <button
              type="button"
              aria-label="Facebook"
              onClick={() =>
                showPlaceholder("Facebook EatNow sẽ được cập nhật sau.")
              }
            >
              <FacebookOutlinedIcon fontSize="small" />
            </button>
            <button
              type="button"
              aria-label="Instagram"
              onClick={() =>
                showPlaceholder("Instagram EatNow sẽ được cập nhật sau.")
              }
            >
              <InstagramIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
