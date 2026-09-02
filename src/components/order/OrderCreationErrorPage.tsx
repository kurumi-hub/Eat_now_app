import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Link from "next/link";

import * as orderStyles from "./tailwindClasses";

export default function OrderCreationErrorPage() {
  return (
    <main className={orderStyles.orderErrorResultPageClassName}>
      <section
        className={orderStyles.orderResultCardClassName}
        aria-labelledby="order-error-title"
      >
        <div className={orderStyles.orderResultIconClassName("error")}>
          <WarningAmberOutlinedIcon aria-hidden="true" />
        </div>
        <h1
          id="order-error-title"
          className={orderStyles.orderResultTitleClassName}
        >
          Không thể tạo đơn hàng
        </h1>
        <p className={orderStyles.orderResultTextClassName}>
          Hệ thống đang gặp sự cố. Vui lòng thử lại. Đừng lo, giỏ hàng của bạn
          vẫn được lưu trên thiết bị này.
        </p>

        <div className={orderStyles.orderResultActionsClassName}>
          <Link
            className={orderStyles.orderPrimaryActionLinkClassName}
            href="/checkout"
          >
            <RefreshOutlinedIcon fontSize="small" />
            Thử lại
          </Link>
          <Link
            className={orderStyles.orderSecondaryActionLinkClassName}
            href="/cart"
          >
            <ShoppingBasketOutlinedIcon fontSize="small" />
            Quay lại giỏ hàng
          </Link>
        </div>
      </section>
    </main>
  );
}
