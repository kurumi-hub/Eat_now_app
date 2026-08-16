import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Link from "next/link";

export default function OrderCreationErrorPage() {
  return (
    <main className="order-result-page is-error">
      <section className="order-error-card" aria-labelledby="order-error-title">
        <div className="order-error-icon">
          <WarningAmberOutlinedIcon aria-hidden="true" />
        </div>
        <h1 id="order-error-title">Không thể tạo đơn hàng</h1>
        <p>
          Hệ thống đang gặp sự cố. Vui lòng thử lại. Đừng lo, giỏ hàng của bạn
          vẫn được lưu trên thiết bị này.
        </p>

        <div className="order-result-actions">
          <Link className="order-error-primary" href="/checkout">
            <RefreshOutlinedIcon fontSize="small" />
            Thử lại
          </Link>
          <Link className="order-error-secondary" href="/cart">
            <ShoppingBasketOutlinedIcon fontSize="small" />
            Quay lại giỏ hàng
          </Link>
        </div>
      </section>
    </main>
  );
}
