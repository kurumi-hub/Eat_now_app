"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CoffeeOutlinedIcon from "@mui/icons-material/CoffeeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalBarOutlinedIcon from "@mui/icons-material/LocalBarOutlined";
import LocalDrinkOutlinedIcon from "@mui/icons-material/LocalDrinkOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import { Alert, Snackbar } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import CustomerFooter from "@/components/home/CustomerFooter";
import { useCart } from "@/contexts/CartContext";
import type { PublicUser } from "@/types/auth";
import CustomerHeader from "@/components/home/CustomerHeader";
import type {
  RestaurantDetail,
  RestaurantInfoItem,
  RestaurantMenuCustomization,
  RestaurantMenuCategory,
  RestaurantMenuItem,
  RestaurantMenuOption,
  RestaurantMenuSale,
} from "./restaurantDetailData";
import * as restaurantStyles from "./tailwindClasses";

type RestaurantDetailPageProps = {
  restaurant: RestaurantDetail;
  user: PublicUser | null;
  deliveryLocationLabel?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

type CustomizedCartItemInput = {
  item: RestaurantMenuItem;
  quantity: number;
  unitPrice: number;
  customizationKey: string;
  optionSummary: string[];
  note?: string;
};

const placeholderIcons = {
  local_drink: LocalDrinkOutlinedIcon,
  local_bar: LocalBarOutlinedIcon,
  water_drop: WaterDropOutlinedIcon,
  coffee: CoffeeOutlinedIcon,
};

const infoIcons = {
  location_on: LocationOnOutlinedIcon,
  schedule: AccessTimeOutlinedIcon,
  two_wheeler: LocalShippingOutlinedIcon,
};

const fallbackCustomization: RestaurantMenuCustomization = {
  defaultSizeId: "standard",
  sizeOptions: [{ id: "standard", label: "Phần tiêu chuẩn", priceDelta: 0 }],
  toppingOptions: [],
  preferenceOptions: [],
  notePlaceholder: "Ghi chú thêm cho quán...",
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatPriceDelta(value: number) {
  return value === 0 ? "+0đ" : `+${formatCurrency(value)}`;
}

function getItemCustomization(item: RestaurantMenuItem) {
  return item.customization || fallbackCustomization;
}

function getOptionSummary(
  selectedSize: RestaurantMenuOption,
  selectedToppings: RestaurantMenuOption[],
  selectedPreferences: RestaurantMenuOption[]
) {
  return [
    `Size ${selectedSize.label} (${formatPriceDelta(selectedSize.priceDelta)})`,
    ...selectedToppings.map(
      (topping) => `${topping.label} (${formatPriceDelta(topping.priceDelta)})`
    ),
    ...selectedPreferences.map((preference) => preference.label),
  ];
}

function getCustomizationKey(
  selectedSize: RestaurantMenuOption,
  selectedToppings: RestaurantMenuOption[],
  selectedPreferences: RestaurantMenuOption[],
  note: string
) {
  const toppingKey =
    selectedToppings
      .map((topping) => topping.id)
      .sort()
      .join(".") || "no-topping";
  const preferenceKey =
    selectedPreferences
      .map((preference) => preference.id)
      .sort()
      .join(".") || "no-preference";
  const noteKey = note.trim().toLocaleLowerCase("vi-VN") || "no-note";

  return `${selectedSize.id}|${toppingKey}|${preferenceKey}|${noteKey}`;
}

function getSaleProgress(sale: RestaurantMenuSale) {
  return Math.min(100, (sale.sold / sale.total) * 100);
}

function getSaleRemaining(sale: RestaurantMenuSale) {
  return Math.max(0, sale.total - sale.sold);
}

function isCompactCategory(category: RestaurantMenuCategory) {
  return category.layout === "compact";
}

function getFilteredItems(category: RestaurantMenuCategory, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi-VN");

  if (!normalizedSearch) return category.items;

  return category.items.filter((item) =>
    `${item.name} ${item.description}`
      .toLocaleLowerCase("vi-VN")
      .includes(normalizedSearch)
  );
}

export default function RestaurantDetailPage({
  restaurant,
  user,
  deliveryLocationLabel,
}: RestaurantDetailPageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(
    restaurant.menuCategories[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomizationItem, setSelectedCustomizationItem] =
    useState<RestaurantMenuItem | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });
  const visibleCategories = useMemo(
    () =>
      restaurant.menuCategories
        .map((category) => ({
          ...category,
          items: getFilteredItems(category, searchTerm),
        }))
        .filter((category) => category.items.length > 0),
    [restaurant.menuCategories, searchTerm]
  );

  const showPlaceholder = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddItem = (item: RestaurantMenuItem) => {
    if (!restaurant.isOpen) {
      showPlaceholder("Nhà hàng hiện đang đóng cửa.");
      return;
    }

    if (!item.isAvailable) {
      showPlaceholder("Món này hiện chưa sẵn sàng để đặt.");
      return;
    }

    setSelectedCustomizationItem(item);
  };

  const handleConfirmCustomizedItem = ({
    item,
    quantity,
    unitPrice,
    customizationKey,
    optionSummary,
    note,
  }: CustomizedCartItemInput) => {
    const addResult = addItem(
      {
        restaurantId: restaurant.slug,
        restaurantSlug: restaurant.slug,
        restaurantName: restaurant.name,
      },
      {
        foodId: item.id,
        name: item.name,
        price: unitPrice,
        image: item.image,
        quantity,
        customizationKey,
        optionSummary,
        note,
      }
    );

    setSelectedCustomizationItem(null);
    showPlaceholder(
      addResult === "UPDATED"
        ? `Đã cập nhật số lượng ${item.name} trong giỏ hàng.`
        : `Đã thêm ${item.name} vào giỏ hàng.`
    );
  };

  return (
    <div className={restaurantStyles.restaurantDetailPageClassName}>
      <CustomerHeader
        user={user}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
        deliveryLocationLabel={deliveryLocationLabel}
      />

      <main className={restaurantStyles.restaurantDetailMainClassName}>
        <section
          className={restaurantStyles.restaurantHeroClassName}
          aria-labelledby="restaurant-title"
        >
          <div className={restaurantStyles.restaurantHeroMediaClassName}>
            <Image
              src={restaurant.image}
              alt={`Món nổi bật tại ${restaurant.name}`}
              fill
              priority
              className={restaurantStyles.restaurantHeroImageClassName}
              sizes="(max-width: 760px) 100vw, 280px"
            />
          </div>

          <div className={restaurantStyles.restaurantHeroBodyClassName}>
            <div className={restaurantStyles.restaurantHeroToplineClassName}>
              <div className={restaurantStyles.restaurantHeroIdentityClassName}>
                <h1
                  id="restaurant-title"
                  className={restaurantStyles.restaurantHeroTitleClassName}
                >
                  {restaurant.name}
                </h1>
                <div className={restaurantStyles.restaurantRatingLineClassName}>
                  <StarOutlinedIcon
                    className={restaurantStyles.restaurantRatingIconClassName}
                    fontSize="small"
                  />
                  <strong>{restaurant.rating}</strong>
                  <span>({restaurant.reviewCount})</span>
                </div>
                <p className={restaurantStyles.restaurantHeroAddressClassName}>
                  {restaurant.address}
                </p>
                <strong className={restaurantStyles.restaurantOpenStatusClassName}>
                  {restaurant.isOpen ? "Đang mở" : "Đang đóng"} - Đóng lúc{" "}
                  {restaurant.openUntil}
                </strong>
              </div>

              <div
                className={restaurantStyles.restaurantDetailActionsClassName}
                aria-label="Hành động nhà hàng"
              >
                <button
                  type="button"
                  className={restaurantStyles.restaurantDetailActionButtonClassName}
                  aria-label="Yêu thích nhà hàng"
                  onClick={() => showPlaceholder("Đã thêm nhà hàng vào yêu thích.")}
                >
                  <FavoriteBorderOutlinedIcon />
                </button>
                <button
                  type="button"
                  className={restaurantStyles.restaurantDetailActionButtonClassName}
                  aria-label="Chia sẻ nhà hàng"
                  onClick={() => showPlaceholder("Liên kết nhà hàng đã sẵn sàng để chia sẻ.")}
                >
                  <ShareOutlinedIcon />
                </button>
              </div>
            </div>

            <div className={restaurantStyles.restaurantServiceRowClassName}>
              <span className={restaurantStyles.restaurantServicePillClassName}>
                {restaurant.deliveryTime}
              </span>
              <span className={restaurantStyles.restaurantServicePillClassName}>
                {restaurant.deliveryFee}
              </span>
              <span className={restaurantStyles.restaurantServicePillClassName}>
                {restaurant.minimumOrder}
              </span>
            </div>
          </div>
        </section>

        <section
          className={restaurantStyles.restaurantSectionClassName}
          aria-labelledby="restaurant-vouchers-title"
        >
          <h2
            id="restaurant-vouchers-title"
            className={restaurantStyles.restaurantSectionTitleClassName}
          >
            Ưu đãi của quán
          </h2>
          <div className={restaurantStyles.restaurantVoucherStripClassName}>
            {restaurant.restaurantVouchers.map((voucher) => (
              <article
                className={restaurantStyles.restaurantVoucherCardClassName}
                key={voucher.id}
              >
                <div className={restaurantStyles.restaurantVoucherTextClassName}>
                  <strong
                    className={restaurantStyles.restaurantVoucherTitleClassName}
                  >
                    {voucher.title}
                  </strong>
                  <span
                    className={restaurantStyles.restaurantVoucherSubtitleClassName}
                  >
                    {voucher.subtitle}
                  </span>
                </div>
                <button
                  type="button"
                  className={restaurantStyles.restaurantVoucherButtonClassName}
                  onClick={() => showPlaceholder(`Đã lưu mã ${voucher.title}.`)}
                >
                  {voucher.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          className={restaurantStyles.restaurantMenuSearchClassName}
          aria-label="Tìm món trong nhà hàng"
        >
          <SearchOutlinedIcon />
          <input
            className={restaurantStyles.restaurantMenuSearchInputClassName}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Tìm món trong ${restaurant.name}...`}
            type="search"
          />
        </section>

        <nav
          className={restaurantStyles.restaurantCategoryPillsClassName}
          aria-label="Danh mục món ăn"
        >
          {restaurant.menuCategories.map((category, index) => {
            const isActive = category.id === activeCategory;

            return (
              <button
                key={category.id}
                type="button"
                className={restaurantStyles.restaurantCategoryPillClassName(
                  isActive
                )}
                data-active={isActive}
                aria-pressed={isActive}
                onClick={() => handleCategoryClick(category.id)}
              >
                {index === 0 ? "🔥 " : ""}
                {category.label}
              </button>
            );
          })}
        </nav>

        <div className={restaurantStyles.restaurantMenuColumnClassName}>
          {visibleCategories.length > 0 ? (
            visibleCategories.map((category, index) => {
              const compact = isCompactCategory(category);

              return (
                <section
                  key={category.id}
                  id={category.id}
                  className={restaurantStyles.restaurantMenuSectionClassName}
                >
                  <h2 className={restaurantStyles.restaurantSectionTitleClassName}>
                    {index === 0 && category.id === "best-sellers" ? "🔥 " : ""}
                    {category.label}
                  </h2>
                  <div className={restaurantStyles.restaurantMenuGridClassName(compact)}>
                    {category.items.map((item) => (
                      <RestaurantMenuCard
                        key={item.id}
                        compact={compact}
                        item={item}
                        isRestaurantOpen={restaurant.isOpen}
                        onAdd={handleAddItem}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            <div className={restaurantStyles.restaurantMenuEmptyClassName}>
              Không tìm thấy món phù hợp trong quán này.
            </div>
          )}
        </div>

        <section
          className={restaurantStyles.restaurantSectionClassName}
          aria-labelledby="restaurant-reviews-title"
        >
          <div className={restaurantStyles.restaurantSectionHeadingClassName}>
            <h2
              id="restaurant-reviews-title"
              className={restaurantStyles.restaurantSectionTitleClassName}
            >
              Đánh giá từ khách hàng
            </h2>
            <div className={restaurantStyles.restaurantReviewSummaryClassName}>
              <StarOutlinedIcon
                className={restaurantStyles.restaurantRatingIconClassName}
                fontSize="small"
              />
              <strong>{restaurant.rating}</strong>
              <span>({restaurant.reviewCount})</span>
            </div>
          </div>
          <div className={restaurantStyles.restaurantReviewGridClassName}>
            {restaurant.restaurantReviews.map((review) => (
              <article
                className={restaurantStyles.restaurantReviewCardClassName}
                key={review.id}
              >
                <div className={restaurantStyles.restaurantReviewHeaderClassName}>
                  <span
                    className={restaurantStyles.restaurantReviewAvatarClassName(
                      review.tone
                    )}
                  >
                    {review.initial}
                  </span>
                  <div className={restaurantStyles.restaurantReviewIdentityClassName}>
                    <strong className={restaurantStyles.restaurantReviewNameClassName}>
                      {review.customerName}
                    </strong>
                    <div
                      className={restaurantStyles.restaurantReviewStarsClassName}
                      aria-label={`${review.rating} sao`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <StarOutlinedIcon
                          key={`${review.id}-${index}`}
                          fontSize="inherit"
                        />
                      ))}
                    </div>
                  </div>
                  <small className={restaurantStyles.restaurantReviewTimeClassName}>
                    {review.timeAgo}
                  </small>
                </div>
                <p className={restaurantStyles.restaurantReviewTextClassName}>
                  {review.content}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={restaurantStyles.restaurantSectionClassName}
          aria-labelledby="restaurant-info-title"
        >
          <h2
            id="restaurant-info-title"
            className={restaurantStyles.restaurantSectionTitleClassName}
          >
            Thông tin nhà hàng
          </h2>
          <div className={restaurantStyles.restaurantInfoCardClassName}>
            {restaurant.restaurantInfoItems.map((item) => (
              <RestaurantInfoRow item={item} key={item.id} />
            ))}
          </div>
        </section>
      </main>

      <CustomerFooter onPlaceholder={showPlaceholder} />

      {selectedCustomizationItem ? (
        <RestaurantCustomizationModal
          item={selectedCustomizationItem}
          onClose={() => setSelectedCustomizationItem(null)}
          onConfirm={handleConfirmCustomizedItem}
        />
      ) : null}

      <nav
        className={restaurantStyles.restaurantBottomNavClassName}
        aria-label="Điều hướng nhanh"
      >
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() => router.push("/")}
        >
          <HomeOutlinedIcon />
          <span>Trang chủ</span>
        </button>
        <button
          className={restaurantStyles.restaurantBottomNavButtonClassName(true)}
          type="button"
        >
          <ExploreOutlinedIcon />
          <span>Khám phá</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() => router.push("/orders")}
        >
          <ReceiptLongOutlinedIcon />
          <span>Đơn hàng</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() =>
            showPlaceholder("Công thức sẽ được hoàn thiện ở bước tiếp theo.")
          }
        >
          <MenuBookOutlinedIcon />
          <span>Công thức</span>
        </button>
        <button
          type="button"
          className={restaurantStyles.restaurantBottomNavButtonClassName()}
          onClick={() => router.push(user ? "/account/profile" : "/login")}
        >
          <AccountCircleOutlinedIcon />
          <span>Tài khoản</span>
        </button>
      </nav>

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

function RestaurantCustomizationModal({
  item,
  onClose,
  onConfirm,
}: {
  item: RestaurantMenuItem;
  onClose: () => void;
  onConfirm: (input: CustomizedCartItemInput) => void;
}) {
  const customization = getItemCustomization(item);
  const [selectedSizeId, setSelectedSizeId] = useState(
    customization.defaultSizeId
  );
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[]>(
    []
  );
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const selectedSize =
    customization.sizeOptions.find((option) => option.id === selectedSizeId) ||
    customization.sizeOptions[0] ||
    fallbackCustomization.sizeOptions[0];
  const selectedToppings = customization.toppingOptions.filter((option) =>
    selectedToppingIds.includes(option.id)
  );
  const selectedPreferences = customization.preferenceOptions.filter((option) =>
    selectedPreferenceIds.includes(option.id)
  );
  const unitPrice =
    item.price +
    selectedSize.priceDelta +
    selectedToppings.reduce((sum, option) => sum + option.priceDelta, 0) +
    selectedPreferences.reduce((sum, option) => sum + option.priceDelta, 0);
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (optionId: string) => {
    setSelectedToppingIds((current) =>
      current.includes(optionId)
        ? current.filter((itemId) => itemId !== optionId)
        : [...current, optionId]
    );
  };

  const togglePreference = (optionId: string) => {
    setSelectedPreferenceIds((current) =>
      current.includes(optionId)
        ? current.filter((itemId) => itemId !== optionId)
        : [...current, optionId]
    );
  };

  const handleConfirm = () => {
    const normalizedNote = note.trim();

    onConfirm({
      item,
      quantity,
      unitPrice,
      customizationKey: getCustomizationKey(
        selectedSize,
        selectedToppings,
        selectedPreferences,
        normalizedNote
      ),
      optionSummary: getOptionSummary(
        selectedSize,
        selectedToppings,
        selectedPreferences
      ),
      note: normalizedNote || undefined,
    });
  };

  return (
    <div className={restaurantStyles.restaurantCustomizationOverlayClassName}>
      <section
        className={restaurantStyles.restaurantCustomizationModalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-customization-title"
      >
        <button
          type="button"
          className={restaurantStyles.restaurantCustomizationCloseClassName}
          aria-label="Đóng tùy chọn món"
          onClick={onClose}
        >
          <CloseOutlinedIcon />
        </button>

        <div className={restaurantStyles.restaurantCustomizationBodyClassName}>
          <header className={restaurantStyles.restaurantCustomizationHeaderClassName}>
            <div>
              <h2
                id="restaurant-customization-title"
                className={restaurantStyles.restaurantCustomizationTitleClassName}
              >
                {item.name}
              </h2>
              <p
                className={
                  restaurantStyles.restaurantCustomizationDescriptionClassName
                }
              >
                {item.description}
              </p>
            </div>
            <RestaurantMenuPrice
              item={item}
              className={restaurantStyles.restaurantCustomizationPriceRowClassName}
              showDiscountBadge
            />
            {item.sale ? (
              <RestaurantSaleMeter
                sale={item.sale}
                className={restaurantStyles.restaurantCustomizationSaleMeterClassName}
              />
            ) : null}
          </header>

          <div className={restaurantStyles.restaurantCustomizationSectionClassName}>
            <h3 className={restaurantStyles.restaurantCustomizationSectionTitleClassName}>
              Chọn kích cỡ *
            </h3>
            <div className={restaurantStyles.restaurantCustomizationOptionsClassName}>
              {customization.sizeOptions.map((option) => (
                <label
                  className={restaurantStyles.restaurantCustomizationOptionClassName}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={`${item.id}-size`}
                    checked={selectedSizeId === option.id}
                    onChange={() => setSelectedSizeId(option.id)}
                  />
                  <span
                    className={
                      restaurantStyles.restaurantCustomizationOptionLabelClassName
                    }
                  >
                    Size {option.label}
                  </span>
                  <strong
                    className={
                      restaurantStyles.restaurantCustomizationOptionPriceClassName
                    }
                  >
                    {formatPriceDelta(option.priceDelta)}
                  </strong>
                </label>
              ))}
            </div>
          </div>

          <div className={restaurantStyles.restaurantCustomizationSectionClassName}>
            <h3 className={restaurantStyles.restaurantCustomizationSectionTitleClassName}>
              Món thêm
            </h3>
            {customization.toppingOptions.length > 0 ? (
              <div className={restaurantStyles.restaurantCustomizationOptionsClassName}>
                {customization.toppingOptions.map((option) => (
                  <label
                    className={restaurantStyles.restaurantCustomizationOptionClassName}
                    key={option.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedToppingIds.includes(option.id)}
                      onChange={() => toggleTopping(option.id)}
                    />
                    <span
                      className={
                        restaurantStyles.restaurantCustomizationOptionLabelClassName
                      }
                    >
                      {option.label}
                    </span>
                    <strong
                      className={
                        restaurantStyles.restaurantCustomizationOptionPriceClassName
                      }
                    >
                      {formatPriceDelta(option.priceDelta)}
                    </strong>
                  </label>
                ))}
              </div>
            ) : (
              <p className={restaurantStyles.restaurantCustomizationEmptyClassName}>
                Món này không có topping tùy chọn.
              </p>
            )}
          </div>

          {customization.preferenceOptions.length > 0 ? (
            <div
              className={
                restaurantStyles.restaurantCustomizationPreferenceSectionClassName
              }
            >
              <h3 className={restaurantStyles.restaurantCustomizationSectionTitleClassName}>
                Tùy chọn món
              </h3>
              <div
                className={restaurantStyles.restaurantCustomizationPreferencesClassName}
              >
                {customization.preferenceOptions.map((option) => (
                  <label
                    className={restaurantStyles.restaurantCustomizationPreferenceClassName}
                    key={option.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPreferenceIds.includes(option.id)}
                      onChange={() => togglePreference(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <label className={restaurantStyles.restaurantCustomizationNoteClassName}>
            <span
              className={restaurantStyles.restaurantCustomizationNoteLabelClassName}
            >
              Ghi chú cho quán
            </span>
            <textarea
              className={restaurantStyles.restaurantCustomizationTextareaClassName}
              value={note}
              rows={3}
              onChange={(event) => setNote(event.target.value)}
              placeholder={customization.notePlaceholder}
            />
          </label>

          <div className={restaurantStyles.restaurantCustomizationFooterClassName}>
            <div className={restaurantStyles.restaurantCustomizationQuantityClassName}>
              <button
                type="button"
                className={
                  restaurantStyles.restaurantCustomizationQuantityButtonClassName
                }
                aria-label="Giảm số lượng"
                disabled={quantity === 1}
                onClick={() =>
                  setQuantity((currentQuantity) =>
                    Math.max(1, currentQuantity - 1)
                  )
                }
              >
                <RemoveOutlinedIcon fontSize="small" />
              </button>
              <span className={restaurantStyles.restaurantCustomizationQuantityValueClassName}>
                {quantity}
              </span>
              <button
                type="button"
                className={
                  restaurantStyles.restaurantCustomizationQuantityButtonClassName
                }
                aria-label="Tăng số lượng"
                onClick={() =>
                  setQuantity((currentQuantity) => currentQuantity + 1)
                }
              >
                <AddOutlinedIcon fontSize="small" />
              </button>
            </div>

            <button
              type="button"
              className={restaurantStyles.restaurantCustomizationSubmitClassName}
              onClick={handleConfirm}
            >
              Thêm vào giỏ • {formatCurrency(totalPrice)}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RestaurantMenuPrice({
  item,
  className = restaurantStyles.restaurantMenuPriceRowClassName,
  showDiscountBadge = false,
}: {
  item: RestaurantMenuItem;
  className?: string;
  showDiscountBadge?: boolean;
}) {
  const priceValueClassName = showDiscountBadge
    ? restaurantStyles.restaurantCustomizationPriceValueClassName
    : restaurantStyles.restaurantMenuPriceValueClassName;
  const originalPriceClassName = showDiscountBadge
    ? restaurantStyles.restaurantCustomizationOriginalPriceClassName
    : restaurantStyles.restaurantMenuOriginalPriceClassName;

  return (
    <div className={className}>
      <strong className={priceValueClassName}>{formatCurrency(item.price)}</strong>
      {item.sale ? (
        <del className={originalPriceClassName}>
          {formatCurrency(item.sale.originalPrice)}
        </del>
      ) : null}
      {item.sale && showDiscountBadge ? (
        <span className={restaurantStyles.restaurantCustomizationDiscountClassName}>
          {item.sale.discountLabel}
        </span>
      ) : null}
    </div>
  );
}

function RestaurantSaleMeter({
  sale,
  className = restaurantStyles.restaurantMenuSaleMeterClassName,
}: {
  sale: RestaurantMenuSale;
  className?: string;
}) {
  const progress = getSaleProgress(sale);
  const remaining = getSaleRemaining(sale);

  return (
    <div className={className}>
      <div className={restaurantStyles.restaurantMenuSaleMeterTextClassName}>
        <span>
          Đã bán {sale.sold}/{sale.total}
        </span>
        <span>Còn lại {remaining}</span>
      </div>
      <div
        className={restaurantStyles.restaurantMenuSaleProgressClassName}
        aria-hidden="true"
      >
        <span
          className={restaurantStyles.restaurantMenuSaleProgressBarClassName}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function RestaurantMenuCard({
  compact,
  item,
  isRestaurantOpen,
  onAdd,
}: {
  compact: boolean;
  item: RestaurantMenuItem;
  isRestaurantOpen: boolean;
  onAdd: (item: RestaurantMenuItem) => void;
}) {
  return (
    <article
      id={item.id}
      className={restaurantStyles.restaurantMenuCardClassName(
        compact,
        item.isAvailable
      )}
    >
      <RestaurantMenuMedia compact={compact} item={item} />
      <div className={restaurantStyles.restaurantMenuCardContentClassName}>
        <div className={restaurantStyles.restaurantMenuCardTitleRowClassName}>
          <h3 className={restaurantStyles.restaurantMenuItemTitleClassName(compact)}>
            {item.name}
          </h3>
          {item.isPopular ? (
            <span className={restaurantStyles.restaurantMenuBadgeClassName}>
              🔥 Bán chạy
            </span>
          ) : null}
          {item.sale ? (
            <span className={restaurantStyles.restaurantMenuSaleBadgeClassName}>
              {item.sale.discountLabel}
            </span>
          ) : null}
        </div>
        {!compact ? (
          <p className={restaurantStyles.restaurantMenuItemDescriptionClassName}>
            {item.description}
          </p>
        ) : null}
        <div className={restaurantStyles.restaurantMenuFooterClassName(compact)}>
          <RestaurantMenuPrice item={item} />
          <button
            type="button"
            className={restaurantStyles.restaurantAddButtonClassName(compact)}
            onClick={() => onAdd(item)}
            disabled={!isRestaurantOpen || !item.isAvailable}
            aria-label={`Thêm ${item.name}`}
          >
            <AddOutlinedIcon fontSize="small" />
            Thêm
          </button>
        </div>
        {item.sale ? <RestaurantSaleMeter sale={item.sale} /> : null}
        {!item.isAvailable ? (
          <span className={restaurantStyles.restaurantMenuUnavailableClassName}>
            Tạm hết món
          </span>
        ) : null}
      </div>
    </article>
  );
}

function RestaurantMenuMedia({
  compact,
  item,
}: {
  compact: boolean;
  item: RestaurantMenuItem;
}) {
  if (item.placeholderIcon) {
    const PlaceholderIcon = placeholderIcons[item.placeholderIcon];

    return (
      <div
        className={restaurantStyles.restaurantMenuMediaClassName(compact, true)}
      >
        <PlaceholderIcon
          className={restaurantStyles.restaurantMenuPlaceholderIconClassName}
        />
      </div>
    );
  }

  return (
    <div className={restaurantStyles.restaurantMenuMediaClassName(compact)}>
      <Image
        src={item.image}
        alt={item.name}
        fill
        className={restaurantStyles.restaurantMenuImageClassName}
        sizes={compact ? "(max-width: 760px) 50vw, 25vw" : "120px"}
      />
    </div>
  );
}

function RestaurantInfoRow({ item }: { item: RestaurantInfoItem }) {
  const Icon = infoIcons[item.icon];

  return (
    <div className={restaurantStyles.restaurantInfoRowClassName}>
      <Icon className={restaurantStyles.restaurantInfoIconClassName} />
      <div>
        <strong className={restaurantStyles.restaurantInfoTitleClassName}>
          {item.title}
        </strong>
        <p className={restaurantStyles.restaurantInfoDescriptionClassName}>
          {item.description}
        </p>
      </div>
    </div>
  );
}
