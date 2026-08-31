import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Image from "next/image";
import Link from "next/link";

import OwnerStoreStatusControl from "@/components/owner/OwnerStoreStatusControl";
import * as ownerStyles from "@/components/owner/tailwindClasses";
import {
  ownerDashboardMetrics,
  ownerOrders,
  ownerPopularDishes,
  ownerRestaurant,
} from "@/components/owner/ownerFlowData";

export default function OwnerDashboardPage() {
  return (
    <section className={ownerStyles.pageClassName}>
      <header className={ownerStyles.pageHeaderClassName}>
        <div>
          <h1>Xin chào, {ownerRestaurant.name}</h1>
          <p>Tổng quan hoạt động kinh doanh hôm nay.</p>
        </div>
        <div className={ownerStyles.headerActionsClassName}>
          <OwnerStoreStatusControl initialStatus={ownerRestaurant.status} />
          <button className={ownerStyles.roundButtonClassName} type="button" aria-label="Thông báo">
            <NotificationsNoneOutlinedIcon />
          </button>
        </div>
      </header>

      <div className={ownerStyles.metricGridClassName}>
        {ownerDashboardMetrics.map((metric) => (
          <article
            className={ownerStyles.metricCardClassName(metric.tone ?? "neutral")}
            key={metric.id}
          >
            <span>{metric.label}</span>
            <strong className={ownerStyles.metricValueClassName(metric.tone ?? "neutral")}>
              {metric.value}
            </strong>
            <small className={ownerStyles.metricNoteClassName(metric.tone ?? "neutral")}>
              {metric.tone === "success" ? <CheckCircleOutlinedIcon /> : null}
              {metric.tone === "primary" ? <TrendingUpIcon /> : null}
              {metric.note}
            </small>
          </article>
        ))}
      </div>

      <div className={ownerStyles.dashboardGridClassName}>
        <section className={ownerStyles.dashboardPanelClassName}>
          <div className={ownerStyles.cardHeaderClassName}>
            <h2>Đơn hàng đang xử lý</h2>
            <Link href="/owner/orders">Xem tất cả</Link>
          </div>
          <div className={ownerStyles.stackedListClassName}>
            {ownerOrders.map((order) => (
              <article
                className={ownerStyles.dashboardOrderClassName(order.statusTone === "new")}
                key={order.id}
              >
                <div className={ownerStyles.dashboardOrderIdentityClassName}>
                  <span className={ownerStyles.dashboardOrderNumberClassName(order.statusTone === "new")}>
                    {order.id.replace("#EN-98", "#")}
                  </span>
                  <div>
                    <strong>{order.customerName}</strong>
                    <p>
                      {order.itemCount} • {order.total}
                    </p>
                  </div>
                </div>
                <div className={ownerStyles.dashboardOrderStatusClassName}>
                  <mark className={ownerStyles.statusChipClassName(order.statusTone)}>
                    {order.status}
                  </mark>
                  <small className={ownerStyles.mutedParagraphClassName}>{order.relativeTime}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={ownerStyles.dashboardPanelClassName}>
          <div className={ownerStyles.cardHeaderClassName}>
            <h2>Món bán chạy nhất</h2>
          </div>
          <div className={ownerStyles.stackedListClassName}>
            {ownerPopularDishes.map((dish) => (
              <article className={ownerStyles.popularItemClassName} key={dish.rank}>
                <div className={ownerStyles.popularImageWrapClassName}>
                  <Image
                    className={ownerStyles.imageFillClassName}
                    src={dish.image}
                    alt={dish.name}
                    width={80}
                    height={80}
                  />
                  <span className={ownerStyles.popularRankClassName}>{dish.rank}</span>
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
