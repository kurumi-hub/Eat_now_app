import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import {
  ownerRevenueMetrics,
  ownerRevenueTrend,
  ownerTopRevenueDishes,
  ownerTransactions,
} from "@/components/owner/ownerFlowData";

const metricIcons = [
  AccountBalanceWalletOutlinedIcon,
  ReceiptLongOutlinedIcon,
  AnalyticsOutlinedIcon,
  CheckCircleOutlinedIcon,
];

export default function OwnerRevenuePage() {
  return (
    <section className="owner-page owner-revenue-page">
      <header className="owner-page-header owner-page-header--split">
        <div>
          <h1>Doanh thu &amp; Phân tích</h1>
          <p>Tổng quan về hiệu suất kinh doanh của bạn.</p>
        </div>
        <select className="owner-period-select" defaultValue="this-month">
          <option value="7-days">7 ngày</option>
          <option value="30-days">30 ngày</option>
          <option value="this-month">Tháng này</option>
        </select>
      </header>

      <div className="owner-metric-grid owner-metric-grid--revenue">
        {ownerRevenueMetrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <article
              className={`owner-card owner-revenue-metric owner-metric--${
                metric.tone ?? "neutral"
              }`}
              key={metric.id}
            >
              <div>
                <span>{metric.label}</span>
                <Icon />
              </div>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </article>
          );
        })}
      </div>

      <section className="owner-card owner-chart-card">
        <div className="owner-card__header">
          <h2>Xu hướng doanh thu</h2>
          <button type="button" aria-label="Tùy chọn biểu đồ">
            <MoreHorizIcon />
          </button>
        </div>
        <div className="owner-chart">
          <div className="owner-chart__axis">
            {["30M", "28M", "26M", "24M", "22M", "20M", "18M", "16M", "14M", "12M"].map(
              (label) => (
                <span key={label}>{label}</span>
              )
            )}
          </div>
          <svg viewBox="0 0 720 260" role="img" aria-label="Biểu đồ xu hướng doanh thu">
            <defs>
              <linearGradient id="ownerRevenueArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a04100" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a04100" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M20 224 C65 204, 82 108, 128 94 C182 78, 207 160, 252 156 C302 151, 315 70, 372 48 C424 27, 459 111, 508 116 C561 121, 586 25, 644 18 C678 15, 704 34, 720 38"
              fill="none"
              stroke="#a04100"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M20 224 C65 204, 82 108, 128 94 C182 78, 207 160, 252 156 C302 151, 315 70, 372 48 C424 27, 459 111, 508 116 C561 121, 586 25, 644 18 C678 15, 704 34, 720 38 L720 246 L20 246 Z"
              fill="url(#ownerRevenueArea)"
            />
            {[20, 128, 252, 372, 508, 644, 720].map((x, index) => (
              <circle
                cx={x}
                cy={[224, 94, 156, 48, 116, 18, 38][index]}
                fill="#ffffff"
                key={x}
                r="5"
                stroke="#a04100"
                strokeWidth="3"
              />
            ))}
          </svg>
          <div className="owner-chart__labels">
            {ownerRevenueTrend.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="owner-card owner-table-card">
        <div className="owner-card__header">
          <h2>Món bán chạy</h2>
        </div>
        <div className="owner-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {ownerTopRevenueDishes.map((dish) => (
                <tr key={dish.name}>
                  <td>{dish.name}</td>
                  <td>{dish.sold}</td>
                  <td>{dish.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="owner-card owner-table-card">
        <div className="owner-card__header">
          <h2>Giao dịch gần đây</h2>
          <button type="button">Xem tất cả</button>
        </div>
        <div className="owner-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Thời gian</th>
                <th>Phương thức</th>
                <th>Giá trị đơn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {ownerTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.time}</td>
                  <td>{transaction.method}</td>
                  <td>{transaction.total}</td>
                  <td>
                    <mark>{transaction.status}</mark>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
