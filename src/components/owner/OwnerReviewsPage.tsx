import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import {
  ownerRatingDistribution,
  ownerReviews,
} from "@/components/owner/ownerFlowData";

const reviewTabs = ["Tất cả", "Mới nhất", "Chưa trả lời", "≤ 4★"];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="owner-stars" aria-label={`${rating} sao`}>
      {Array.from({ length: 5 }).map((_, index) =>
        index < rating ? (
          <StarIcon key={index} fontSize="small" />
        ) : (
          <StarBorderIcon key={index} fontSize="small" />
        )
      )}
    </span>
  );
}

export default function OwnerReviewsPage() {
  return (
    <section className="owner-reviews-page">
      <header className="owner-reviews-topbar">
        <label className="owner-search-field owner-search-field--review">
          <SearchIcon />
          <input placeholder="Tìm kiếm đánh giá..." />
        </label>
        <div>
          <button type="button" aria-label="Thông báo">
            <NotificationsNoneOutlinedIcon />
            <span />
          </button>
          <button type="button" aria-label="Trợ giúp">
            <HelpOutlinedIcon />
          </button>
          <div className="owner-review-avatar">OP</div>
        </div>
      </header>

      <div className="owner-reviews-layout">
        <aside className="owner-card owner-rating-card">
          <div>
            <h2>Xếp hạng trung bình</h2>
            <strong>4.8</strong>
            <RatingStars rating={5} />
            <p>Dựa trên 1,245 đánh giá</p>
          </div>
          <div className="owner-rating-bars">
            {ownerRatingDistribution.map((item) => (
              <div key={item.stars}>
                <span>{item.stars}</span>
                <StarBorderIcon />
                <mark>
                  <i style={{ width: `${item.percent}%` }} />
                </mark>
              </div>
            ))}
          </div>
        </aside>

        <main className="owner-reviews-content">
          <div className="owner-page-header owner-page-header--split">
            <div>
              <h1>Đánh giá từ khách hàng</h1>
              <p>Quản lý phản hồi và tương tác với thực khách.</p>
            </div>
            <div className="owner-review-actions">
              <button type="button">
                <FilterListIcon />
                Lọc
              </button>
              <button type="button">
                <FileDownloadOutlinedIcon />
                Xuất báo cáo
              </button>
            </div>
          </div>

          <div className="owner-tabs owner-tabs--review">
            {reviewTabs.map((tab) => (
              <button className={tab === "Tất cả" ? "is-active" : ""} type="button" key={tab}>
                {tab}
              </button>
            ))}
          </div>

          <div className="owner-review-list">
            {ownerReviews.map((review) => (
              <article className="owner-card owner-review-card" key={review.id}>
                <div className="owner-review-card__top">
                  <div className="owner-letter-avatar">{review.customerInitial}</div>
                  <div>
                    <h2>{review.customerName}</h2>
                    <p>
                      <RatingStars rating={review.rating} />
                      <span>•</span>
                      {review.timeAgo}
                    </p>
                  </div>
                  <div className="owner-review-card__badges">
                    {review.needsReply ? <mark>Cần phản hồi</mark> : null}
                    <span>{review.orderId}</span>
                  </div>
                </div>
                <div className="owner-review-dishes">
                  <RestaurantMenuIcon />
                  {review.dishes}
                </div>
                <p className="owner-review-card__comment">{review.comment}</p>
                {review.reply ? (
                  <div className="owner-review-reply">
                    <div>
                      <strong>Phản hồi từ nhà hàng</strong>
                      <span>Hôm qua</span>
                    </div>
                    <p>{review.reply}</p>
                  </div>
                ) : (
                  <div className="owner-review-card__footer">
                    <button type="button">
                      <ReplyIcon />
                      Trả lời
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <button className="owner-load-more" type="button">
            Tải thêm đánh giá
          </button>
        </main>
      </div>
    </section>
  );
}
