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
import { useState } from "react";
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

type HomePageProps = {
  user: PublicUser | null;
  featuredRestaurants: HomeRestaurant[];
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

export default function HomePage({
  user,
  featuredRestaurants,
}: HomePageProps) {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

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
    <div className="home-page">
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="home-main">
        <section id="home-hero" className="home-hero">
          <div className="home-hero__media">
            <Image
              src={homeHeroImage}
              alt="Món ăn đặc trưng EatNow"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">Giao nhanh quanh bạn</p>
            <h1>Hôm nay ăn gì?</h1>
            <p>Khám phá món ngon quanh bạn và đặt giao tận nơi.</p>
            <Button
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={() => router.push("/search")}
            >
              Đặt món ngay
            </Button>
          </div>
        </section>

        <section id="featured-categories" className="home-section">
          <div className="home-section__heading">
            <h2>Danh Mục Nổi Bật</h2>
            <button type="button" onClick={() => router.push("/search")}>
              Xem tất cả
            </button>
          </div>
          <div className="home-category-grid">
            {homeCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  className="home-category-card"
                  key={category.label}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/search?category=${encodeURIComponent(category.label)}`
                    )
                  }
                >
                  <div className="home-category-card__icon">
                    <Icon />
                  </div>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="flash-sale" className="home-section home-flash-sale">
          <div className="home-flash-sale__heading">
            <div className="home-flash-sale__title">
              <h2>Flash Sale - Giá sốc hôm nay</h2>
              <span className="home-flash-countdown" aria-label="Thời gian còn lại">
                <AccessTimeOutlinedIcon fontSize="small" />
                02:45:12
              </span>
            </div>
            <button type="button" onClick={() => router.push("/search?sale=flash")}>
              Xem tất cả
            </button>
          </div>

          <div className="home-flash-sale-grid">
            {flashSaleItems.map((item) => {
              const progress = Math.min(100, (item.sold / item.total) * 100);
              const remaining = Math.max(0, item.total - item.sold);

              return (
                <article className="home-flash-card" key={item.name}>
                  <button
                    type="button"
                    className="home-flash-card__hitarea"
                    onClick={() =>
                      router.push(`/search?q=${encodeURIComponent(item.name)}`)
                    }
                    aria-label={`Mua ngay ${item.name}`}
                  >
                    <div className="home-flash-card__media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 760px) 100vw, 33vw"
                      />
                      <span className="home-flash-badge">
                        {item.discountLabel}
                      </span>
                    </div>
                    <div className="home-flash-card__body">
                      <h3>{item.name}</h3>
                      <div className="home-flash-price-row">
                        <strong>{formatHomeCurrency(item.price)}</strong>
                        <span>{formatHomeCurrency(item.originalPrice)}</span>
                      </div>
                      <div className="home-flash-sale-meter">
                        <div className="home-flash-sale-meter__text">
                          <span>
                            Đã bán {item.sold}/{item.total}
                          </span>
                          <span>Còn lại {remaining}</span>
                        </div>
                        <div
                          className="home-flash-progress"
                          aria-hidden="true"
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="home-flash-buy-button">Mua ngay</span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="featured-restaurants" className="home-section">
          <div className="home-section__heading">
            <h2>Nhà Hàng Nổi Bật</h2>
            <button
              type="button"
              onClick={() => router.push("/restaurants")}
            >
              Xem tất cả
            </button>
          </div>
          <div className="home-restaurant-grid">
            {featuredRestaurants.map((restaurant) => (
              <article className="home-restaurant-card" key={restaurant.slug}>
                <Link
                  className="home-restaurant-card__link"
                  href={`/restaurants/${restaurant.slug}`}
                >
                  <div className="home-card-media">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="home-rating">
                      <StarBorderOutlinedIcon fontSize="small" />
                      <span>{restaurant.rating}</span>
                    </div>
                  </div>
                  <div className="home-restaurant-card__body">
                    <h3>{restaurant.name}</h3>
                    <div className="home-restaurant-card__meta">
                      <span>{restaurant.time}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__heading">
            <h2>Gợi Ý Hôm Nay</h2>
            <button type="button" onClick={() => router.push("/search")}>
              Xem tất cả
            </button>
          </div>
          <div className="home-food-grid">
            {nearbyFoods.map((food) => (
              <article
                className="home-food-card"
                key={food.name}
                onClick={() =>
                  router.push(`/search?q=${encodeURIComponent(food.name)}`)
                }
              >
                <div className="home-card-media home-card-media--food">
                  <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    sizes="(max-width: 760px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
                <h3>{food.name}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>

      <button
        className="home-foodbot"
        type="button"
        aria-label="Mở trợ lý FoodBot"
        onClick={() =>
          showPlaceholder(
            "Trợ lý FoodBot sẽ được triển khai ở sprint tiếp theo."
          )
        }
      >
        <SmartToyOutlinedIcon />
        <span>Trợ lý FoodBot</span>
      </button>

      <nav className="home-bottom-nav" aria-label="Điều hướng nhanh">
        <button
          className="is-active"
          type="button"
          onClick={() => scrollToSection("home-hero")}
        >
          <HomeOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("featured-restaurants")}
        >
          <RestaurantMenuOutlinedIcon />
          <span>Nhà hàng</span>
        </button>
        <button
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
