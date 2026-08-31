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
import * as ownerStyles from "@/components/owner/tailwindClasses";

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
    <section className={ownerStyles.ordersPageClassName}>
      <header className={ownerStyles.stickyHeaderClassName}>
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Quản lý và theo dõi trạng thái đơn hàng trong ngày.</p>
        </div>
        <div className={ownerStyles.toolbarClassName}>
          <label className={ownerStyles.toolbarSearchFieldClassName}>
            <SearchIcon />
            <input placeholder="Tìm mã đơn, tên khách..." />
          </label>
          <button className={ownerStyles.filterButtonClassName} type="button" aria-label="Lọc đơn hàng">
            <FilterListIcon />
            <span className={ownerStyles.filterButtonDotClassName} />
          </button>
        </div>
      </header>

      <div className={ownerStyles.ordersShellClassName}>
        <section className={ownerStyles.ordersListPaneClassName}>
          <div className={ownerStyles.scrollTabsClassName}>
            {orderTabs.map((tab, index) => (
              <button
                className={ownerStyles.tabButtonClassName(index === 1)}
                type="button"
                key={tab}
              >
                {tab}
                {tab === "Đơn mới" ? <span className={ownerStyles.tabBadgeClassName}>3</span> : null}
              </button>
            ))}
          </div>
          <div className={ownerStyles.filterTagsClassName}>
            <span>Lọc:</span>
            <mark className={ownerStyles.filterTagClassName}>Hôm nay ×</mark>
          </div>

          <div className={ownerStyles.ordersListClassName}>
            {ownerOrders.map((order) => (
              <article
                className={ownerStyles.orderCardClassName(order.isSelected)}
                key={order.id}
              >
                <div className={ownerStyles.orderCardTopClassName}>
                  <div className={ownerStyles.orderCardTopInnerClassName}>
                    <strong className={ownerStyles.orderCardTitleClassName}>{order.id}</strong>
                    <mark className={ownerStyles.statusChipClassName(order.statusTone)}>
                      {order.status}
                    </mark>
                  </div>
                  <span className={ownerStyles.orderTimeClassName}>
                    <ScheduleIcon />
                    {order.time}
                  </span>
                </div>
                <div className={ownerStyles.orderCardMainClassName}>
                  <div className={ownerStyles.letterAvatarClassName}>{order.customerInitial}</div>
                  <div>
                    <strong>{order.customerName}</strong>
                    <p className={ownerStyles.orderMetaClassName}>
                      {order.itemCount} • {order.paymentMethod}
                    </p>
                  </div>
                  <div className={ownerStyles.orderMoneyClassName}>
                    <strong className={ownerStyles.orderMoneyValueClassName}>{order.total}</strong>
                    <span className={ownerStyles.orderPaymentStatusClassName}>{order.paymentStatus}</span>
                  </div>
                </div>
                {order.statusTone === "new" ? (
                  <div className={ownerStyles.orderCardActionsClassName}>
                    <button type="button">Chấp nhận đơn</button>
                    <button type="button">Từ chối</button>
                  </div>
                ) : (
                  <button className={ownerStyles.orderWideActionClassName} type="button">
                    <CheckCircleOutlinedIcon />
                    {order.statusTone === "preparing" ? "Đã chuẩn bị xong" : "Theo dõi tài xế"}
                  </button>
                )}
                {order.driver ? (
                  <p className={ownerStyles.orderDriverClassName}>
                    {order.driver}
                    <TwoWheelerIcon />
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <aside className={ownerStyles.orderDetailPaneClassName}>
          <div className={ownerStyles.orderDetailHeadlineClassName}>
            <div className={ownerStyles.orderDetailHeadlineInnerClassName}>
              <strong className={ownerStyles.orderCardTitleClassName}>{selectedOrder.id}</strong>
              <mark className={ownerStyles.statusChipClassName("new")}>Đơn mới</mark>
            </div>
            <PrintOutlinedIcon />
          </div>
          <p className={ownerStyles.orderDetailMetaClassName}>
            Hôm nay, {selectedOrder.time} • Qua ứng dụng
          </p>

          <section className={ownerStyles.detailCardClassName}>
            <span className={ownerStyles.overlineLabelClassName}>Khách hàng</span>
            <div className={ownerStyles.customerRowClassName}>
              <div className={ownerStyles.letterAvatarClassName}>{selectedOrder.customerInitial}</div>
              <div>
                <strong className={ownerStyles.customerNameClassName}>{selectedOrder.customerName}</strong>
                <p className={ownerStyles.customerPhoneClassName}>
                  <PhoneOutlinedIcon />
                  {ownerRestaurant.phone}
                </p>
              </div>
            </div>
            <div className={ownerStyles.customerAddressClassName}>
              <LocationOnOutlinedIcon />
              {ownerRestaurant.address} (Tòa nhà A, Lầu 3)
            </div>
          </section>

          <section className={ownerStyles.detailSectionClassName}>
            <h2 className={ownerStyles.detailSectionTitleClassName}>Chi tiết món ăn (3 món)</h2>
            <div className={ownerStyles.orderItemsClassName}>
              {ownerOrderDetailItems.map((item) => (
                <article className={ownerStyles.orderItemRowClassName} key={`${item.quantity}-${item.name}`}>
                  <span className={ownerStyles.orderItemQuantityClassName}>{item.quantity}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p className={ownerStyles.orderItemNoteClassName}>{item.note}</p>
                  </div>
                  <strong className={ownerStyles.orderItemPriceClassName}>{item.price}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className={ownerStyles.noteCardClassName}>
            <span className={ownerStyles.overlineLabelClassName}>Ghi chú từ khách</span>
            <p className={ownerStyles.noteTextClassName}>“Quán cho xin thêm 2 bịch nước mắm chua ngọt nhé, cảm ơn quán!”</p>
          </section>

          <section className={ownerStyles.totalCardClassName}>
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

          <div className={ownerStyles.stickyActionsClassName}>
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
