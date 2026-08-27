import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Image from "next/image";
import Link from "next/link";

import OwnerStoreStatusControl from "@/components/owner/OwnerStoreStatusControl";
import {
  ownerDashboardMetrics,
  ownerOrders,
  ownerPopularDishes,
  ownerRestaurant,
} from "@/components/owner/ownerFlowData";

export default function OwnerDashboardPage() {
  return (
    <section className="owner-page owner-dashboard">
      <header className="owner-page-header owner-page-header--dashboard">
        <div>
          <h1>Xin chào, {ownerRestaurant.name}</h1>
          <p>Tổng quan hoạt động kinh doanh hôm nay.</p>
        </div>
        <div className="owner-dashboard__header-actions">
          <OwnerStoreStatusControl initialStatus={ownerRestaurant.status} />
          <button className="owner-round-button" type="button" aria-label="Thông báo">
            <NotificationsNoneOutlinedIcon />
          </button>
        </div>
      </header>

      <div className="owner-metric-grid">
        {ownerDashboardMetrics.map((metric) => (
          <article
            className={`owner-card owner-metric owner-metric--${metric.tone ?? "neutral"}`}
            key={metric.id}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>
              {metric.tone === "success" ? <CheckCircleOutlinedIcon /> : null}
              {metric.tone === "primary" ? <TrendingUpIcon /> : null}
              {metric.note}
            </small>
          </article>
        ))}
      </div>

      <div className="owner-dashboard__grid">
        <section className="owner-card owner-card--flush owner-dashboard__orders">
          <div className="owner-card__header">
            <h2>Đơn hàng đang xử lý</h2>
            <Link href="/owner/orders">Xem tất cả</Link>
          </div>
          <div className="owner-dashboard__order-list">
            {ownerOrders.map((order) => (
              <article
                className={`owner-dashboard-order${
                  order.statusTone === "new" ? " is-highlighted" : ""
                }`}
                key={order.id}
              >
                <div className="owner-dashboard-order__identity">
                  <span>{order.id.replace("#EN-98", "#")}</span>
                  <div>
                    <strong>{order.customerName}</strong>
                    <p>
                      {order.itemCount} • {order.total}
                    </p>
                  </div>
                </div>
                <div className="owner-dashboard-order__status">
                  <mark className={`owner-status owner-status--${order.statusTone}`}>
                    {order.status}
                  </mark>
                  <small>{order.relativeTime}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="owner-card owner-card--flush owner-dashboard__popular">
          <div className="owner-card__header">
            <h2>Món bán chạy nhất</h2>
          </div>
          <div className="owner-popular-list">
            {ownerPopularDishes.map((dish) => (
              <article className="owner-popular-item" key={dish.rank}>
                <div className="owner-popular-item__image">
                  <Image src={dish.image} alt={dish.name} width={80} height={80} />
                  <span>{dish.rank}</span>
                </div>
                <div>
                  <strong>{dish.name}</strong>
                  <p>{dish.sold}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
