"use client";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { Alert, Button, Snackbar } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/types/auth";
import type { SiteMediaItem } from "@/types/siteMedia";
import { nearbyFoods } from "./homeData";
import type { HomeCategory, HomeRestaurant } from "./homeData";

type HomePageProps = {
  user: PublicUser | null;
  categories: HomeCategory[];
  featuredRestaurants: HomeRestaurant[];
  heroImage: SiteMediaItem;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

export default function HomePage({
  categories,
  featuredRestaurants,
  heroImage,
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
      <main className="home-main">
        <section
          id="home-hero"
          className="home-hero"
          aria-label="Mâm món Việt nổi bật"
        >
          <div className="home-hero__media">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.altText}
              fill
              priority
              unoptimized
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
              onClick={() => router.push("/restaurants")}
            >
              Đặt món ngay
            </Button>
          </div>
        </section>

        <section id="featured-categories" className="home-section">
          <h2>Danh Mục Nổi Bật</h2>
          <div className="home-category-grid">
            {categories.length === 0 ? (
              <p className="home-category-empty">Danh mục món ăn đang được cập nhật.</p>
            ) : categories.map((category) => (
                <button
                  key={category.id}
                  className="home-category-card"
                  type="button"
                  onClick={() => router.push(`/restaurants?category=${encodeURIComponent(category.id)}`)}
                >
                  <span className="home-category-card__icon">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.altText}
                        width={64}
                        height={64}
                        unoptimized
                      />
                    ) : (
                      <RestaurantMenuOutlinedIcon />
                    )}
                  </span>
                  <span>{category.label}</span>
                </button>
              ))}
          </div>
        </section>

        <section id="featured-restaurants" className="home-section">
          <div className="home-section__heading">
            <h2>Nhà Hàng Nổi Bật</h2>
            <Link href="/restaurants" className="home-section__all-link">
              Xem tất cả
            </Link>
          </div>
          <div className="home-restaurant-grid">
            {featuredRestaurants.length ? featuredRestaurants.map((restaurant) => (
              <Link
                className="home-restaurant-card"
                href={`/restaurants/${restaurant.slug}`}
                key={restaurant.slug}
              >
                <div className="home-card-media">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.imageAlt}
                    fill
                    unoptimized
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
            )) : <div className="home-restaurant-empty">Chưa có nhà hàng đã xuất bản kèm ảnh thật.</div>}
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
