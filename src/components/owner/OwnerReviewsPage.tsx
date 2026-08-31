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
import * as ownerStyles from "@/components/owner/tailwindClasses";

const reviewTabs = ["Tất cả", "Mới nhất", "Chưa trả lời", "≤ 4★"];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className={ownerStyles.starsClassName} aria-label={`${rating} sao`}>
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
    <section className={ownerStyles.reviewsPageClassName}>
      <header className={ownerStyles.reviewsTopbarClassName}>
        <label className={ownerStyles.reviewSearchFieldClassName}>
          <SearchIcon />
          <input placeholder="Tìm kiếm đánh giá..." />
        </label>
        <div className={ownerStyles.reviewsTopbarActionsClassName}>
          <button className={ownerStyles.reviewsTopbarButtonClassName} type="button" aria-label="Thông báo">
            <NotificationsNoneOutlinedIcon />
            <span className={ownerStyles.notificationDotClassName} />
          </button>
          <button className={ownerStyles.reviewsTopbarButtonClassName} type="button" aria-label="Trợ giúp">
            <HelpOutlinedIcon />
          </button>
          <div className={ownerStyles.reviewAvatarClassName}>OP</div>
        </div>
      </header>

      <div className={ownerStyles.reviewsLayoutClassName}>
        <aside className={ownerStyles.ratingCardClassName}>
          <div>
            <h2 className={ownerStyles.ratingTitleClassName}>Xếp hạng trung bình</h2>
            <strong className={ownerStyles.ratingValueClassName}>4.8</strong>
            <RatingStars rating={5} />
            <p className={ownerStyles.ratingNoteClassName}>Dựa trên 1,245 đánh giá</p>
          </div>
          <div className={ownerStyles.ratingBarsClassName}>
            {ownerRatingDistribution.map((item) => (
              <div className={ownerStyles.ratingBarClassName} key={item.stars}>
                <span>{item.stars}</span>
                <StarBorderIcon />
                <mark className={ownerStyles.ratingBarTrackClassName}>
                  <i className={ownerStyles.ratingBarFillClassName} style={{ width: `${item.percent}%` }} />
                </mark>
              </div>
            ))}
          </div>
        </aside>

        <main className={ownerStyles.reviewsContentClassName}>
          <div className={ownerStyles.splitPageHeaderClassName}>
            <div>
              <h1>Đánh giá từ khách hàng</h1>
              <p>Quản lý phản hồi và tương tác với thực khách.</p>
            </div>
            <div className={ownerStyles.reviewActionsClassName}>
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

          <div className={ownerStyles.reviewTabsClassName}>
            {reviewTabs.map((tab) => (
              <button className={ownerStyles.tabButtonClassName(tab === "Tất cả", true)} type="button" key={tab}>
                {tab}
              </button>
            ))}
          </div>

          <div className={ownerStyles.reviewListClassName}>
            {ownerReviews.map((review) => (
              <article className={ownerStyles.reviewCardClassName} key={review.id}>
                <div className={ownerStyles.reviewCardTopClassName}>
                  <div className={ownerStyles.letterAvatarClassName}>{review.customerInitial}</div>
                  <div>
                    <h2 className={ownerStyles.reviewCardTitleClassName}>{review.customerName}</h2>
                    <p className={ownerStyles.reviewMetaClassName}>
                      <RatingStars rating={review.rating} />
                      <span>•</span>
                      {review.timeAgo}
                    </p>
                  </div>
                  <div className={ownerStyles.reviewBadgesClassName}>
                    {review.needsReply ? <mark>Cần phản hồi</mark> : null}
                    <span>{review.orderId}</span>
                  </div>
                </div>
                <div className={ownerStyles.reviewDishesClassName}>
                  <RestaurantMenuIcon />
                  {review.dishes}
                </div>
                <p className={ownerStyles.reviewCommentClassName}>{review.comment}</p>
                {review.reply ? (
                  <div className={ownerStyles.reviewReplyClassName}>
                    <div className={ownerStyles.reviewReplyHeaderClassName}>
                      <strong>Phản hồi từ nhà hàng</strong>
                      <span>Hôm qua</span>
                    </div>
                    <p className={ownerStyles.reviewReplyTextClassName}>{review.reply}</p>
                  </div>
                ) : (
                  <div className={ownerStyles.reviewFooterClassName}>
                    <button className={ownerStyles.softPillButtonClassName} type="button">
                      <ReplyIcon />
                      Trả lời
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <button className={ownerStyles.loadMoreClassName} type="button">
            Tải thêm đánh giá
          </button>
        </main>
      </div>
    </section>
  );
}
