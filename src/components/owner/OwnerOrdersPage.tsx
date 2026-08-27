import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";

import {
  ownerOrderDetailItems,
  ownerOrders,
  ownerRestaurant,
} from "@/components/owner/ownerFlowData";

const orderTabs = [
  "Tất cả",
  "Đơn mới",
  "Đã xác nhận",
  "Đang chuẩn bị",
  "Chờ lấy hàng",
  "Hoàn thành",
  "Đã hủy",
];

export default function OwnerOrdersPage() {
  const selectedOrder = ownerOrders.find((order) => order.isSelected) ?? ownerOrders[0];

  return (
    <section className="owner-orders-page">
      <header className="owner-orders-header">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Quản lý và theo dõi trạng thái đơn hàng trong ngày.</p>
        </div>
        <div className="owner-toolbar">
          <label className="owner-search-field">
            <SearchIcon />
            <input placeholder="Tìm mã đơn, tên khách..." />
          </label>
          <button className="owner-filter-button" type="button" aria-label="Lọc đơn hàng">
            <FilterListIcon />
            <span />
          </button>
        </div>
      </header>

      <div className="owner-orders-shell">
        <section className="owner-orders-list-pane">
          <div className="owner-tabs owner-tabs--scroll">
            {orderTabs.map((tab) => (
              <button
                className={tab === "Đơn mới" ? "is-active" : ""}
                type="button"
                key={tab}
              >
                {tab}
                {tab === "Đơn mới" ? <span>3</span> : null}
              </button>
            ))}
          </div>
          <div className="owner-filter-tags">
            <span>Lọc:</span>
            <mark>Hôm nay ×</mark>
          </div>

          <div className="owner-orders-list">
            {ownerOrders.map((order) => (
              <article
                className={`owner-order-card${order.isSelected ? " is-selected" : ""}`}
                key={order.id}
              >
                <div className="owner-order-card__top">
                  <div>
                    <strong>{order.id}</strong>
                    <mark className={`owner-status owner-status--${order.statusTone}`}>
                      {order.status}
                    </mark>
                  </div>
                  <span>
                    <ScheduleIcon />
                    {order.time}
                  </span>
                </div>
                <div className="owner-order-card__main">
                  <div className="owner-letter-avatar">{order.customerInitial}</div>
                  <div>
                    <strong>{order.customerName}</strong>
                    <p>
                      {order.itemCount} • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="owner-order-card__money">
                    <strong>{order.total}</strong>
                    <span>{order.paymentStatus}</span>
                  </div>
                </div>
                {order.statusTone === "new" ? (
                  <div className="owner-order-card__actions">
                    <button type="button">Chấp nhận đơn</button>
                    <button type="button">Từ chối</button>
                  </div>
                ) : (
                  <button className="owner-order-card__wide-action" type="button">
                    <CheckCircleOutlinedIcon />
                    {order.statusTone === "preparing" ? "Đã chuẩn bị xong" : "Theo dõi tài xế"}
                  </button>
                )}
                {order.driver ? (
                  <p className="owner-order-card__driver">
                    {order.driver}
                    <TwoWheelerIcon />
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <aside className="owner-order-detail-pane">
          <div className="owner-order-detail__headline">
            <div>
              <strong>{selectedOrder.id}</strong>
              <mark className="owner-status owner-status--new">Đơn mới</mark>
            </div>
            <PrintOutlinedIcon />
          </div>
          <p>Hôm nay, {selectedOrder.time} • Qua ứng dụng</p>

          <section className="owner-detail-card owner-customer-card">
            <span>Khách hàng</span>
            <div className="owner-customer-card__row">
              <div className="owner-letter-avatar">{selectedOrder.customerInitial}</div>
              <div>
                <strong>{selectedOrder.customerName}</strong>
                <p>
                  <PhoneOutlinedIcon />
                  {ownerRestaurant.phone}
                </p>
              </div>
            </div>
            <div className="owner-customer-card__address">
              <LocationOnOutlinedIcon />
              {ownerRestaurant.address} (Tòa nhà A, Lầu 3)
            </div>
          </section>

          <section className="owner-detail-section">
            <h2>Chi tiết món ăn (3 món)</h2>
            <div className="owner-order-items">
              {ownerOrderDetailItems.map((item) => (
                <article key={`${item.quantity}-${item.name}`}>
                  <span>{item.quantity}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </div>
                  <strong>{item.price}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="owner-note-card">
            <span>Ghi chú từ khách</span>
            <p>“Quán cho xin thêm 2 bịch nước mắm chua ngọt nhé, cảm ơn quán!”</p>
          </section>

          <section className="owner-total-card">
            <div>
              <span>Tạm tính</span>
              <strong>115.000đ</strong>
            </div>
            <div>
              <span>Phí giao hàng</span>
              <strong>30.000đ</strong>
            </div>
            <div>
              <span>Voucher</span>
              <strong>-0đ</strong>
            </div>
            <div>
              <span>Tổng cộng</span>
              <strong>145.000đ</strong>
            </div>
          </section>

          <div className="owner-order-detail__sticky-actions">
            <button type="button">Từ chối</button>
            <button type="button">
              <CheckCircleOutlinedIcon />
              Chấp nhận đơn
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
