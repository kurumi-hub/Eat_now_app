"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
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
import CustomerHeader from "./CustomerHeader";
import {
  homeCategories,
  homeHeroImage,
  nearbyFoods,
} from "./homeData";
import type { HomeRestaurant } from "./homeData";

type HomePageProps = {
  user: PublicUser | null;
  defaultDeliveryAddress: string | null;
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

export default function HomePage({
  user,
  defaultDeliveryAddress,
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

  return (
    <div className="home-experience">
      <CustomerHeader
        user={user}
        deliveryAddress={defaultDeliveryAddress}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={scrollToSection}
      />

      <main className="home-main">
        <section
          id="home-hero"
          className="home-hero"
          aria-label="Mâm món Việt nổi bật"
        >
          <div className="home-hero__media" aria-hidden="true">
            <Image
              src={homeHeroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 760px) 100vw, 1200px"
            />
          </div>
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">Giao nhanh quanh bạn</p>
            <h1>Hôm nay ăn gì?</h1>
            <p>
              Khám phá món ngon quanh bạn và đặt giao tận nơi.
            </p>
            <Button
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={() =>
                showPlaceholder(
                  "Chức năng đặt món sẽ được triển khai ở sprint sau."
                )
              }
            >
              Đặt món ngay
            </Button>
          </div>
        </section>

        <section id="featured-categories" className="home-section">
          <h2>Danh Mục Nổi Bật</h2>
          <div className="home-category-grid">
            {homeCategories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.label}
                  className="home-category-card"
                  type="button"
                  onClick={() =>
                    showPlaceholder(
                      `Danh mục ${category.label} sẽ được mở ở sprint sau.`
                    )
                  }
                >
                  <span className="home-category-card__icon">
                    <Icon />
                  </span>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="featured-restaurants" className="home-section">
          <div className="home-section__heading">
            <h2>Nhà Hàng Nổi Bật</h2>
            <button
              type="button"
              onClick={() =>
                showPlaceholder(
                  "Danh sách nhà hàng sẽ được triển khai ở sprint tiếp theo."
                )
              }
            >
              Xem tất cả
            </button>
          </div>
          <div className="home-restaurant-grid">
            {featuredRestaurants.map((restaurant) => (
              <Link
                className="home-restaurant-card"
                href={`/restaurants/${restaurant.slug}`}
                key={restaurant.name}
              >
                <div className="home-card-media">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="home-restaurant-card__body">
                  <h3>{restaurant.name}</h3>
                  <p>
                    <StarBorderOutlinedIcon fontSize="inherit" />
                    <span>{restaurant.rating}</span>
                    <span aria-hidden="true">.</span>
                    <span>{restaurant.time}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section">
          <h2>Món Ngon Gần Bạn</h2>
          <div className="home-food-grid">
            {nearbyFoods.map((food) => (
              <article className="home-food-card" key={food.name}>
                <div className="home-food-card__media">
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

      <footer className="home-footer">
        <div className="home-footer__inner">
          <Link className="home-footer__brand" href="/">
            EatNow
          </Link>
          <div className="home-footer__links">
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Trang giới thiệu sẽ được bổ sung sau.")
              }
            >
              Về chúng tôi
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Điều khoản sẽ được bổ sung sau.")
              }
            >
              Điều khoản
            </button>
            <button
              type="button"
              onClick={() =>
                showPlaceholder("Chính sách bảo mật sẽ được bổ sung sau.")
              }
            >
              Chính sách bảo mật
            </button>
            <button
              type="button"
              onClick={() => showPlaceholder("Liên hệ sẽ được bổ sung sau.")}
            >
              Liên hệ
            </button>
          </div>
          <p>© 2026 EatNow Food Delivery. Bản quyền thuộc về EatNow.</p>
        </div>
      </footer>

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
