import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import Image from "next/image";
import Link from "next/link";

import { DEFAULT_DELIVERY_LOCATION_LABEL } from "@/utils/addressDisplay";
import { homeHeroImage } from "./homeData";
import {
  beforeActionsClassName,
  beforeBrandGroupClassName,
  beforeCategoryCardClassName,
  beforeCategoryGridClassName,
  beforeCategoryImageClassName,
  beforeCategoryMediaClassName,
  beforeCategoryTitleClassName,
  beforeFaqCardClassName,
  beforeFaqDescriptionClassName,
  beforeFaqHeadingClassName,
  beforeFaqLargeTitleClassName,
  beforeFaqListClassName,
  beforeFaqQuestionClassName,
  beforeFaqSectionClassName,
  beforeFaqTabClassName,
  beforeFaqTabsClassName,
  beforeFooterBrandClassName,
  beforeFooterButtonClassName,
  beforeFooterClassName,
  beforeFooterCopyClassName,
  beforeFooterInnerClassName,
  beforeFooterNavClassName,
  beforeHeaderClassName,
  beforeHeaderInnerClassName,
  beforeHeroActionsClassName,
  beforeHeroClassName,
  beforeHeroContentClassName,
  beforeHeroCopyClassName,
  beforeHeroImageClassName,
  beforeHeroOverlayClassName,
  beforeHeroTitleClassName,
  beforeLocationClassName,
  beforeLoginLinkClassName,
  beforeMainClassName,
  beforePartnerCardClassName,
  beforePartnerCopyClassName,
  beforePartnerIconClassName,
  beforePartnerImageClassName,
  beforePartnerListClassName,
  beforePartnerMediaClassName,
  beforePartnerSectionClassName,
  beforePrimaryCtaClassName,
  beforeRegisterLinkClassName,
  beforeSecondaryCtaClassName,
  beforeSectionClassName,
  beforeSectionCopyClassName,
  beforeSectionHeadingClassName,
  beforeSectionTitleClassName,
  beforeShellClassName,
  beforeWorkflowCardClassName,
  beforeWorkflowGridClassName,
  beforeWorkflowTitleClassName,
  logoClassName,
} from "./tailwindClasses";

type BeforeLoginHomePageProps = {
  deliveryLocationLabel?: string;
};

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

export default function BeforeLoginHomePage({
  deliveryLocationLabel = DEFAULT_DELIVERY_LOCATION_LABEL,
}: BeforeLoginHomePageProps) {
  return (
    <div className={beforeShellClassName}>
      <header className={beforeHeaderClassName}>
        <div className={beforeHeaderInnerClassName}>
          <div className={beforeBrandGroupClassName}>
            <Link className={logoClassName} href="/" aria-label="EatNow trang chủ">
              EatNow
            </Link>
            <button className={beforeLocationClassName} type="button">
              <LocationOnOutlinedIcon fontSize="small" />
              <span>{deliveryLocationLabel}</span>
              <ExpandMoreOutlinedIcon fontSize="small" />
            </button>
          </div>

          <nav className={beforeActionsClassName} aria-label="Tài khoản">
            <Link className={beforeLoginLinkClassName} href="/login">
              Đăng nhập
            </Link>
            <Link className={beforeRegisterLinkClassName} href="/register">
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>

      <main className={beforeMainClassName}>
        <section aria-labelledby="before-home-title" className={beforeHeroClassName}>
          <Image
            className={beforeHeroImageClassName}
            src={homeHeroImage}
            alt="Bàn ăn Việt Nam với nhiều món nóng hổi"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 1200px"
          />
          <div className={beforeHeroOverlayClassName} aria-hidden="true" />
          <div className={beforeHeroContentClassName}>
            <h1 id="before-home-title" className={beforeHeroTitleClassName}>
              Hôm nay ăn gì?
            </h1>
            <p className={beforeHeroCopyClassName}>
              Khám phá món ngon quanh bạn và đặt giao tận nơi.
            </p>
            <div className={beforeHeroActionsClassName}>
              <Link className={beforeSecondaryCtaClassName} href="/login">
                Đăng nhập
              </Link>
              <Link className={beforePrimaryCtaClassName} href="/register">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </section>

        <section className={beforeSectionClassName}>
          <div className={beforeSectionHeadingClassName}>
            <h2 className={beforeSectionTitleClassName}>
              Khám phá danh mục món ăn
            </h2>
            <p className={beforeSectionCopyClassName}>
              Từ những bát phở nóng hổi đến những ổ bánh mì giòn rụm, chúng tôi
              mang cả tinh hoa ẩm thực Việt đến tận cửa nhà bạn.
            </p>
          </div>

          <div className={beforeCategoryGridClassName}>
            {beforeLoginCategories.map((category) => (
              <article className={beforeCategoryCardClassName} key={category.title}>
                <div className={beforeCategoryMediaClassName}>
                  <Image
                    className={beforeCategoryImageClassName}
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className={beforeCategoryTitleClassName}>
                  {category.title}
                </h3>
                <p className={beforeSectionCopyClassName}>
                  {category.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={beforePartnerSectionClassName}>
          <div className={beforePartnerCopyClassName}>
            <h2 className={beforeSectionTitleClassName}>
              Hợp tác với các nhà hàng hàng đầu
            </h2>
            <p className={beforeSectionCopyClassName}>
              Chúng tôi tự hào là đối tác tin cậy của hàng trăm nhà hàng nổi
              tiếng tại địa phương, đảm bảo mỗi bữa ăn của bạn luôn đạt chất
              lượng tốt nhất.
            </p>

            <div className={beforePartnerListClassName}>
              {partnerNames.map((name) => (
                <article className={beforePartnerCardClassName} key={name}>
                  <span className={beforePartnerIconClassName}>
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  </span>
                  <strong>{name}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className={beforePartnerMediaClassName}>
            {partnerImages.map((image, index) => (
              <div
                className={beforePartnerImageClassName(index === 1)}
                key={image.src}
              >
                <Image
                  className={beforeCategoryImageClassName}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 760px) 50vw, 240px"
                />
              </div>
            ))}
          </div>
        </section>

        <section className={beforeFaqSectionClassName} aria-labelledby="before-faq-title">
          <div className={beforeFaqHeadingClassName}>
            <h2 id="before-faq-title" className={beforeFaqLargeTitleClassName}>
              Tìm hiểu thêm về chúng tôi!
            </h2>
            <nav className={beforeFaqTabsClassName} aria-label="Chủ đề thông tin">
              <button className={beforeFaqTabClassName(true)} type="button">
                Câu hỏi thường gặp
              </button>
              <button className={beforeFaqTabClassName()} type="button">
                Chúng tôi là ai?
              </button>
              <button className={beforeFaqTabClassName()} type="button">
                Chương trình đối tác
              </button>
              <button className={beforeFaqTabClassName()} type="button">
                Hỗ trợ & Trợ giúp
              </button>
            </nav>
          </div>

          <div className={beforeFaqCardClassName}>
            <div className={beforeFaqListClassName}>
              {faqQuestions.map((question, index) => (
                <button
                  className={beforeFaqQuestionClassName(index === 0)}
                  key={question}
                  type="button"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className={beforeWorkflowGridClassName}>
              {workflowCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className={beforeWorkflowCardClassName} key={card.title}>
                    <Icon />
                    <h3 className={beforeWorkflowTitleClassName}>
                      {card.title}
                    </h3>
                    <p className={beforeSectionCopyClassName}>
                      {card.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <p className={beforeFaqDescriptionClassName}>
              EatNow đơn giản hóa quy trình đặt đồ ăn. Duyệt qua thực đơn đa
              dạng của chúng tôi, chọn những món ăn yêu thích và tiến hành
              thanh toán. Bữa ăn ngon của bạn sẽ được giao đến tận cửa ngay lập
              tức.
            </p>
          </div>
        </section>
      </main>

      <footer className={beforeFooterClassName}>
        <div className={beforeFooterInnerClassName}>
          <Link className={beforeFooterBrandClassName} href="/">
            EatNow
          </Link>
          <nav className={beforeFooterNavClassName} aria-label="Thông tin EatNow">
            <button className={beforeFooterButtonClassName} type="button">
              Về chúng tôi
            </button>
            <button className={beforeFooterButtonClassName} type="button">
              Điều khoản
            </button>
            <button className={beforeFooterButtonClassName} type="button">
              Chính sách bảo mật
            </button>
            <button className={beforeFooterButtonClassName} type="button">
              Liên hệ
            </button>
          </nav>
          <p className={beforeFooterCopyClassName}>
            © 2024 EatNow Food Delivery. Bản quyền thuộc về EatNow.
          </p>
        </div>
      </footer>
    </div>
  );
}
