"use client";

import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import BrandLogo from "@/components/common/BrandLogo";
import { DEFAULT_DELIVERY_LOCATION_LABEL } from "@/utils/addressDisplay";
import { beforeFaqTabsData } from "./beforeFaqData";
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
  logoImageClassName,
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


export default function BeforeLoginHomePage({
  deliveryLocationLabel = DEFAULT_DELIVERY_LOCATION_LABEL,
}: BeforeLoginHomePageProps) {
  const [activeTabId, setActiveTabId] = useState("faq");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const activeTab =
    beforeFaqTabsData.find((tab) => tab.id === activeTabId) ??
    beforeFaqTabsData[0];
  const activeTopic =
    activeTab.items[activeQuestionIndex] ?? activeTab.items[0];

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setActiveQuestionIndex(0);
  };
  return (
    <div className={beforeShellClassName}>
      <header className={beforeHeaderClassName}>
        <div className={beforeHeaderInnerClassName}>
          <div className={beforeBrandGroupClassName}>
            <Link className={logoClassName} href="/" aria-label="EatNow trang chủ">
              <BrandLogo
                alt=""
                className={logoImageClassName}
                priority
                sizes="102px"
                variant="horizontal"
              />
            </Link>
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
              {beforeFaqTabsData.map((tab) => (
                <button
                  key={tab.id}
                  className={beforeFaqTabClassName(activeTabId === tab.id)}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className={beforeFaqCardClassName}>
            <div className={beforeFaqListClassName}>
              {activeTab.items.map((item, index) => (
                <button
                  className={beforeFaqQuestionClassName(activeQuestionIndex === index)}
                  key={item.question}
                  type="button"
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  {item.question}
                </button>
              ))}
            </div>

            <div
              key={`${activeTabId}-${activeQuestionIndex}`}
              className={`${beforeWorkflowGridClassName} animate-faq-fade`}
            >
              {activeTopic.cards.map((card) => {
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

            <p
              key={`desc-${activeTabId}-${activeQuestionIndex}`}
              className={`${beforeFaqDescriptionClassName} animate-faq-fade`}
            >
              {activeTopic.description}
            </p>
          </div>
        </section>
      </main>

      <footer className={beforeFooterClassName}>
        <div className={beforeFooterInnerClassName}>
          <Link className={beforeFooterBrandClassName} href="/" aria-label="EatNow trang chủ">
            <BrandLogo
              alt=""
              className={logoImageClassName}
              sizes="76px"
              variant="full"
            />
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
