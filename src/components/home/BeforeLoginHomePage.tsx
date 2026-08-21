import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import Image from "next/image";
import Link from "next/link";

import { homeHeroImage } from "./homeData";

const beforeLoginCategories = [
  {
    title: "Cơm Tấm Truyền Thống",
    description:
      "Hương vị đậm đà từ sườn nướng than hồng và nước mắm kẹo đặc trưng.",
    image: "/images/home/food-com-tam.png",
    alt: "Cơm tấm sườn nướng",
  },
  {
    title: "Phở Bò Gia Truyền",
    description:
      "Nước dùng thanh ngọt từ xương hầm 12 giờ cùng thảo mộc tự nhiên.",
    image: "/images/home/food-pho.png",
    alt: "Tô phở bò nóng",
  },
  {
    title: "Bún Bò Huế Cay Nồng",
    description:
      "Vị cay thơm hòa cùng sả, ớt và nước dùng đậm chất miền Trung.",
    image: "/images/home/food-bun-bo.png",
    alt: "Tô bún bò Huế",
  },
  {
    title: "Bánh Mì Sài Gòn",
    description:
      "Vỏ bánh giòn tan quyện cùng pate béo ngậy và thịt nướng thơm lừng.",
    image: "/images/home/food-banh-mi.png",
    alt: "Bánh mì thịt nướng",
  },
];

const partnerNames = [
  "Cơm Tấm Sáu Hiếu",
  "Phở 2000",
  "Bún Chú Hùng",
  "Góc Phố Bakery",
];

const partnerImages = [
  {
    src: "/images/home/restaurant-com-tam.png",
    alt: "Cơm Tấm Sáu Hiếu",
  },
  {
    src: "/images/home/restaurant-pho.png",
    alt: "Phở 2000",
  },
];

const faqQuestions = [
  "EatNow hoạt động như thế nào?",
  "Những phương thức thanh toán nào được chấp nhận?",
  "Tôi có thể theo dõi đơn hàng trong thời gian thực không?",
  "Có ưu đãi hoặc khuyến mãi đặc biệt nào không?",
  "EatNow có khả dụng ở khu vực của tôi không?",
];

const workflowCards = [
  {
    title: "Đặt món!",
    description: "Chọn món yêu thích từ các nhà hàng gần bạn.",
    icon: RestaurantOutlinedIcon,
  },
  {
    title: "Theo dõi tiến độ",
    description: "Cập nhật trạng thái đơn hàng theo từng bước giao.",
    icon: RouteOutlinedIcon,
  },
  {
    title: "Nhận đơn hàng!",
    description: "Bữa ăn nóng hổi được giao tới cửa nhanh chóng.",
    icon: LocalMallOutlinedIcon,
  },
];

export default function BeforeLoginHomePage() {
  return (
    <div className="home-before-login-page">
      <header className="home-before-header">
        <div className="home-before-header__inner">
          <div className="home-before-brand-group">
            <Link className="home-logo" href="/" aria-label="EatNow trang chủ">
              EatNow
            </Link>
            <button className="home-before-location" type="button">
              <LocationOnOutlinedIcon fontSize="small" />
              <span>Ninh Kiều, Cần Thơ</span>
              <ExpandMoreOutlinedIcon fontSize="small" />
            </button>
          </div>

          <nav className="home-before-actions" aria-label="Tài khoản">
            <Link className="home-before-login-link" href="/login">
              Đăng nhập
            </Link>
            <Link className="home-before-register-link" href="/register">
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>

      <main className="home-before-main">
        <section className="home-before-hero" aria-labelledby="before-home-title">
          <Image
            src={homeHeroImage}
            alt="Bàn ăn Việt Nam với nhiều món nóng hổi"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 1200px"
          />
          <div className="home-before-hero__overlay" aria-hidden="true" />
          <div className="home-before-hero__content">
            <h1 id="before-home-title">Hôm nay ăn gì?</h1>
            <p>Khám phá món ngon quanh bạn và đặt giao tận nơi.</p>
            <div className="home-before-hero__actions">
              <Link className="home-before-secondary-cta" href="/login">
                Đăng nhập
              </Link>
              <Link className="home-before-primary-cta" href="/register">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </section>

        <section className="home-before-section home-before-category-section">
          <div className="home-before-section__heading">
            <h2>Khám phá danh mục món ăn</h2>
            <p>
              Từ những bát phở nóng hổi đến những ổ bánh mì giòn rụm, chúng tôi
              mang cả tinh hoa ẩm thực Việt đến tận cửa nhà bạn.
            </p>
          </div>

          <div className="home-before-category-grid">
            {beforeLoginCategories.map((category) => (
              <article className="home-before-category-card" key={category.title}>
                <div className="home-before-category-card__media">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-before-partner-section">
          <div className="home-before-partner-copy">
            <h2>Hợp tác với các nhà hàng hàng đầu</h2>
            <p>
              Chúng tôi tự hào là đối tác tin cậy của hàng trăm nhà hàng nổi
              tiếng tại địa phương, đảm bảo mỗi bữa ăn của bạn luôn đạt chất
              lượng tốt nhất.
            </p>

            <div className="home-before-partner-list">
              {partnerNames.map((name) => (
                <article className="home-before-partner-card" key={name}>
                  <span>
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  </span>
                  <strong>{name}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="home-before-partner-media">
            {partnerImages.map((image, index) => (
              <div
                className={`home-before-partner-image${
                  index === 1 ? " is-offset" : ""
                }`}
                key={image.src}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 760px) 50vw, 240px"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="home-before-faq-section" aria-labelledby="before-faq-title">
          <div className="home-before-faq-heading">
            <h2 id="before-faq-title">Tìm hiểu thêm về chúng tôi!</h2>
            <nav aria-label="Chủ đề thông tin">
              <button className="is-active" type="button">
                Câu hỏi thường gặp
              </button>
              <button type="button">Chúng tôi là ai?</button>
              <button type="button">Chương trình đối tác</button>
              <button type="button">Hỗ trợ & Trợ giúp</button>
            </nav>
          </div>

          <div className="home-before-faq-card">
            <div className="home-before-faq-list">
              {faqQuestions.map((question, index) => (
                <button
                  className={index === 0 ? "is-active" : ""}
                  key={question}
                  type="button"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="home-before-workflow-grid">
              {workflowCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="home-before-workflow-card" key={card.title}>
                    <Icon />
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </article>
                );
              })}
            </div>

            <p className="home-before-faq-description">
              EatNow đơn giản hóa quy trình đặt đồ ăn. Duyệt qua thực đơn đa
              dạng của chúng tôi, chọn những món ăn yêu thích và tiến hành
              thanh toán. Bữa ăn ngon của bạn sẽ được giao đến tận cửa ngay lập
              tức.
            </p>
          </div>
        </section>
      </main>

      <Link className="home-before-foodbot" href="/login" aria-label="Trợ lý FoodBot">
        <SmartToyOutlinedIcon />
        <span>Trợ lý FoodBot</span>
      </Link>

      <footer className="home-before-footer">
        <div className="home-before-footer__inner">
          <Link className="home-before-footer__brand" href="/">
            EatNow
          </Link>
          <nav aria-label="Thông tin EatNow">
            <button type="button">Về chúng tôi</button>
            <button type="button">Điều khoản</button>
            <button type="button">Chính sách bảo mật</button>
            <button type="button">Liên hệ</button>
          </nav>
          <p>© 2024 EatNow Food Delivery. Bản quyền thuộc về EatNow.</p>
        </div>
      </footer>
    </div>
  );
}
