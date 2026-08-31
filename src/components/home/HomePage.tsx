"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/types/auth";
import CustomerFooter from "./CustomerFooter";
import CustomerHeader from "./CustomerHeader";
import {
  flashSaleItems,
  homeCategories,
  homeHeroImage,
  nearbyFoods,
} from "./homeData";
import type { HomeRestaurant } from "./homeData";
import {
  bottomNavButtonClassName,
  bottomNavClassName,
  cardImageClassName,
  cardMediaClassName,
  categoryCardClassName,
  categoryGridClassName,
  categoryIconClassName,
  flashBadgeClassName,
  flashBodyClassName,
  flashBuyButtonClassName,
  flashCardClassName,
  flashCardTitleClassName,
  flashCountdownClassName,
  flashGridClassName,
  flashHeadingClassName,
  flashHitareaClassName,
  flashImageClassName,
  flashMediaClassName,
  flashMeterClassName,
  flashMeterTextClassName,
  flashPriceRowClassName,
  flashProgressClassName,
  flashRestaurantNameClassName,
  flashTitleGroupClassName,
  foodbotClassName,
  foodbotLabelClassName,
  foodCardClassName,
  foodGridClassName,
  foodMediaClassName,
  foodTitleClassName,
  heroClassName,
  heroContentClassName,
  heroCopyClassName,
  heroEyebrowClassName,
  heroImageClassName,
  heroMediaClassName,
  heroTitleClassName,
  mainClassName,
  pageClassName,
  ratingClassName,
  restaurantBodyClassName,
  restaurantCardClassName,
  restaurantCardLinkClassName,
  restaurantGridClassName,
  restaurantMetaClassName,
  restaurantTitleClassName,
  sectionActionClassName,
  sectionClassName,
  sectionHeadingClassName,
  sectionTitleClassName,
} from "./tailwindClasses";

type HomePageProps = {
  user: PublicUser | null;
  featuredRestaurants: HomeRestaurant[];
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function formatHomeCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

const FLASH_SALE_INITIAL_SECONDS = 2 * 60 * 60 + 45 * 60 + 12;

function formatFlashSaleCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export default function HomePage({
  user,
  featuredRestaurants,
  deliveryLocationLabel,
}: HomePageProps) {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });
  const [flashSaleRemainingSeconds, setFlashSaleRemainingSeconds] = useState(
    FLASH_SALE_INITIAL_SECONDS
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFlashSaleRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const showPlaceholder = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  return (
    <div className={pageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={mainClassName}>
        <section id="home-hero" className={heroClassName}>
          <div className={heroMediaClassName}>
            <Image
              className={heroImageClassName}
              src={homeHeroImage}
              alt="Món ăn đặc trưng EatNow"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className={heroContentClassName}>
            <p className={heroEyebrowClassName}>Giao nhanh quanh bạn</p>
            <h1 className={heroTitleClassName}>Hôm nay ăn gì?</h1>
            <p className={heroCopyClassName}>
              Khám phá món ngon quanh bạn và đặt giao tận nơi.
            </p>
            <Button
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={() => router.push("/search")}
            >
              Đặt món ngay
            </Button>
          </div>
        </section>

        <section id="featured-categories" className={sectionClassName}>
          <div className={sectionHeadingClassName}>
            <h2 className={sectionTitleClassName}>Danh Mục Nổi Bật</h2>
            <button
              className={sectionActionClassName}
              type="button"
              onClick={() => router.push("/search")}
            >
              Xem tất cả
            </button>
          </div>
          <div className={categoryGridClassName}>
            {homeCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  className={categoryCardClassName}
                  key={category.label}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/search?category=${encodeURIComponent(category.label)}`
                    )
                  }
                >
                  <div className={categoryIconClassName}>
                    <Icon />
                  </div>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="flash-sale" className={sectionClassName}>
          <div className={flashHeadingClassName}>
            <div className={flashTitleGroupClassName}>
              <h2 className={sectionTitleClassName}>
                Flash Sale - Giá sốc hôm nay
              </h2>
              <span className={flashCountdownClassName} aria-label="Thời gian còn lại">
                <AccessTimeOutlinedIcon fontSize="small" />
                {formatFlashSaleCountdown(flashSaleRemainingSeconds)}
              </span>
            </div>
            <button
              className={sectionActionClassName}
              type="button"
              onClick={() => router.push("/search?sale=flash")}
            >
              Xem tất cả
            </button>
          </div>

          <div className={flashGridClassName}>
            {flashSaleItems.map((item) => {
              const progress = Math.min(100, (item.sold / item.total) * 100);
              const remaining = Math.max(0, item.total - item.sold);

              return (
                <article className={flashCardClassName} key={item.name}>
                  <button
                    type="button"
                    className={flashHitareaClassName}
                    onClick={() =>
                      router.push(
                        `/restaurants/${item.restaurantSlug}#${item.foodId}`
                      )
                    }
                    aria-label={`Mua ngay ${item.name}`}
                  >
                    <div className={flashMediaClassName}>
                      <Image
                        className={flashImageClassName}
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 760px) 100vw, 33vw"
                      />
                      <span className={flashBadgeClassName}>
                        {item.discountLabel}
                      </span>
                    </div>
                    <div className={flashBodyClassName}>
                      <h3 className={flashCardTitleClassName}>{item.name}</h3>
                      <p className={flashRestaurantNameClassName}>
                        {item.restaurantName}
                      </p>
                      <div className={flashPriceRowClassName}>
                        <strong>{formatHomeCurrency(item.price)}</strong>
                        <span>{formatHomeCurrency(item.originalPrice)}</span>
                      </div>
                      <div className={flashMeterClassName}>
                        <div className={flashMeterTextClassName}>
                          <span>
                            Đã bán {item.sold}/{item.total}
                          </span>
                          <span>Còn lại {remaining}</span>
                        </div>
                        <div
                          className={flashProgressClassName}
                          aria-hidden="true"
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className={flashBuyButtonClassName}>Mua ngay</span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="featured-restaurants" className={sectionClassName}>
          <div className={sectionHeadingClassName}>
            <h2 className={sectionTitleClassName}>Nhà Hàng Nổi Bật</h2>
            <button
              className={sectionActionClassName}
              type="button"
              onClick={() => router.push("/restaurants")}
            >
              Xem tất cả
            </button>
          </div>
          <div className={restaurantGridClassName}>
            {featuredRestaurants.map((restaurant) => (
              <article className={restaurantCardClassName} key={restaurant.slug}>
                <Link
                  className={restaurantCardLinkClassName}
                  href={`/restaurants/${restaurant.slug}`}
                >
                  <div className={cardMediaClassName}>
                    <Image
                      className={cardImageClassName}
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className={ratingClassName}>
                      <StarBorderOutlinedIcon fontSize="small" />
                      <span>{restaurant.rating}</span>
                    </div>
                  </div>
                  <div className={restaurantBodyClassName}>
                    <h3 className={restaurantTitleClassName}>
                      {restaurant.name}
                    </h3>
                    <div className={restaurantMetaClassName}>
                      <span>{restaurant.time}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={sectionClassName}>
          <div className={sectionHeadingClassName}>
            <h2 className={sectionTitleClassName}>Gợi Ý Hôm Nay</h2>
            <button
              className={sectionActionClassName}
              type="button"
              onClick={() => router.push("/search")}
            >
              Xem tất cả
            </button>
          </div>
          <div className={foodGridClassName}>
            {nearbyFoods.map((food) => (
              <article
                className={foodCardClassName}
                key={food.name}
                onClick={() =>
                  router.push(`/search?q=${encodeURIComponent(food.name)}`)
                }
              >
                <div className={foodMediaClassName}>
                  <Image
                    className={cardImageClassName}
                    src={food.image}
                    alt={food.name}
                    fill
                    sizes="(max-width: 760px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
                <h3 className={foodTitleClassName}>{food.name}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>

      <button
        className={foodbotClassName}
        type="button"
        aria-label="Mở trợ lý FoodBot"
        onClick={() =>
          showPlaceholder(
            "Trợ lý FoodBot sẽ được triển khai ở sprint tiếp theo."
          )
        }
      >
        <SmartToyOutlinedIcon />
        <span className={foodbotLabelClassName}>Trợ lý FoodBot</span>
      </button>

      <nav className={bottomNavClassName} aria-label="Điều hướng nhanh">
        <button
          className={bottomNavButtonClassName(true)}
          type="button"
          onClick={() => scrollToSection("home-hero")}
        >
          <HomeOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button
          className={bottomNavButtonClassName()}
          type="button"
          onClick={() => scrollToSection("featured-restaurants")}
        >
          <RestaurantMenuOutlinedIcon />
          <span>Nhà hàng</span>
        </button>
        <button
          className={bottomNavButtonClassName()}
          type="button"
          onClick={() => router.push(user ? "/account/profile" : "/login")}
        >
          <AccountCircleOutlinedIcon />
          <span>Tài khoản</span>
        </button>
      </nav>

      <CustomerFooter onPlaceholder={showPlaceholder} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
