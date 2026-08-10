"use client";

import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";
import {
  areaFilters,
  defaultSearchQuery,
  filterSearchResults,
  formatSearchCurrency,
  getFilterLabel,
  priceFilters,
  searchResultItems,
  sortOptions,
  sortSearchResults,
  type AreaFilterId,
  type PriceFilterId,
  type SearchFilterState,
  type SearchResultItem,
  type SearchResultType,
  type SortOptionId,
} from "./searchFilterData";

type SearchFilterPageProps = {
  user: PublicUser | null;
  initialQuery?: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
};

const defaultPageSize = 4;
const validTypes: SearchResultType[] = ["food", "restaurant"];
const validSorts = sortOptions.map((option) => option.id);

function isSearchResultType(value: string | null): value is SearchResultType {
  return Boolean(value && validTypes.includes(value as SearchResultType));
}

function isSortOption(value: string | null): value is SortOptionId {
  return Boolean(value && validSorts.includes(value as SortOptionId));
}

function readSelectedValues<T extends string>(
  values: string[],
  allowedValues: readonly T[],
  fallback: T[]
) {
  const selectedValues = values.filter((value): value is T =>
    allowedValues.includes(value as T)
  );

  return selectedValues.length > 0 ? selectedValues : fallback;
}

function getSearchState(searchParams: URLSearchParams): SearchFilterState {
  const hasAnyParam = searchParams.toString().length > 0;
  const query = searchParams.get("q")?.trim() || (hasAnyParam ? "" : defaultSearchQuery);
  const rawType = searchParams.get("type");
  const type: SearchResultType = isSearchResultType(rawType) ? rawType : "food";
  const openOnly = searchParams.has("open")
    ? searchParams.get("open") === "1"
    : !hasAnyParam;
  const priceIds = readSelectedValues(
    searchParams.getAll("price"),
    priceFilters.map((filter) => filter.id),
    hasAnyParam ? [] : ["50-100"]
  );
  const areaIds = readSelectedValues(
    searchParams.getAll("area"),
    areaFilters.map((filter) => filter.id),
    hasAnyParam ? [] : ["ninh-kieu"]
  );
  const rawSort = searchParams.get("sort");
  const sort: SortOptionId = isSortOption(rawSort) ? rawSort : "rating";

  return {
    query,
    type,
    openOnly,
    priceIds,
    areaIds,
    sort,
  };
}

function getCurrentPage(searchParams: URLSearchParams) {
  const rawPage = Number(searchParams.get("page"));

  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function SearchFilterPage({
  user,
  initialQuery,
}: SearchFilterPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
  });

  const filterState = useMemo(() => {
    const state = getSearchState(new URLSearchParams(searchParams.toString()));

    return initialQuery && !searchParams.has("q")
      ? { ...state, query: initialQuery }
      : state;
  }, [initialQuery, searchParams]);
  const currentPage = getCurrentPage(new URLSearchParams(searchParams.toString()));
  const filteredResults = useMemo(
    () => sortSearchResults(filterSearchResults(searchResultItems, filterState), filterState.sort),
    [filterState]
  );
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / defaultPageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleResults = filteredResults.slice(
    (page - 1) * defaultPageSize,
    page * defaultPageSize
  );
  const activeFilters = [
    ...(filterState.openOnly ? [{ id: "open", label: "Đang mở cửa" }] : []),
    ...filterState.priceIds.map((id) => ({ id, label: getFilterLabel(id) })),
    ...filterState.areaIds.map((id) => ({ id, label: getFilterLabel(id) })),
  ];

  const updateParams = (
    mutator: (params: URLSearchParams) => void,
    options: { replace?: boolean } = {}
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    mutator(nextParams);
    nextParams.delete("page");

    if (filterState.query && !nextParams.has("q")) {
      nextParams.set("q", filterState.query);
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString ? `/search?${queryString}` : "/search";

    if (options.replace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  };

  const updatePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(nextPage));

    router.push(`/search?${nextParams.toString()}`, { scroll: false });
  };

  const handleSectionNavigate = (sectionId: string) => {
    router.push(`/#${sectionId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleTypeChange = (type: SearchResultType) => {
    updateParams((params) => {
      params.set("type", type);
    });
  };

  const handleSortChange = (event: SelectChangeEvent<SortOptionId>) => {
    updateParams((params) => {
      params.set("sort", event.target.value);
    });
  };

  const handleOpenChange = (checked: boolean) => {
    updateParams((params) => {
      params.set("open", checked ? "1" : "0");
    });
  };

  const toggleMultiFilter = (
    key: "price" | "area",
    value: PriceFilterId | AreaFilterId,
    checked: boolean
  ) => {
    updateParams((params) => {
      const currentValues = params.getAll(key).filter((item) => item !== value);

      params.delete(key);

      if (checked) {
        currentValues.push(value);
      }

      currentValues.forEach((item) => params.append(key, item));
    });
  };

  const removeFilter = (id: string) => {
    updateParams((params) => {
      if (id === "open") {
        params.set("open", "0");
        return;
      }

      const targetKey = priceFilters.some((filter) => filter.id === id)
        ? "price"
        : "area";
      const currentValues = params
        .getAll(targetKey)
        .filter((value) => value !== id);

      params.delete(targetKey);
      currentValues.forEach((value) => params.append(targetKey, value));
    });
  };

  const clearFilters = () => {
    updateParams((params) => {
      params.delete("price");
      params.delete("area");
      params.set("open", "0");
    });
  };

  const showPlaceholder = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const resultLabel =
    filterState.type === "food" ? "món ăn" : "nhà hàng";
  const locationLabel =
    filterState.areaIds.length === 1
      ? `${getFilterLabel(filterState.areaIds[0])}, Cần Thơ`
      : "Cần Thơ";

  return (
    <div className="search-filter-page">
      <CustomerHeader
        user={user}
        searchValue={filterState.query}
        onPlaceholder={showPlaceholder}
        onSectionNavigate={handleSectionNavigate}
      />

      <main className="search-filter-main">
        <aside className="search-filter-sidebar" aria-label="Bộ lọc tìm kiếm">
          <FilterPanel
            openOnly={filterState.openOnly}
            selectedPriceIds={filterState.priceIds}
            selectedAreaIds={filterState.areaIds}
            onOpenChange={handleOpenChange}
            onPriceChange={(id, checked) => toggleMultiFilter("price", id, checked)}
            onAreaChange={(id, checked) => toggleMultiFilter("area", id, checked)}
          />
        </aside>

        <section className="search-filter-shell" aria-labelledby="search-title">
          <div className="search-heading">
            <p className="search-heading__eyebrow">
              Tìm kiếm quanh Ninh Kiều, Cần Thơ
            </p>
            <h1 id="search-title">
              {filterState.query
                ? `Kết quả cho "${filterState.query}"`
                : "Kết quả tìm kiếm"}
            </h1>
            <p>
              Tìm thấy {filteredResults.length} {resultLabel} tại {locationLabel}
            </p>
          </div>

          <div className="search-filter-mobile-panel">
            <FilterPanel
              openOnly={filterState.openOnly}
              selectedPriceIds={filterState.priceIds}
              selectedAreaIds={filterState.areaIds}
              onOpenChange={handleOpenChange}
              onPriceChange={(id, checked) => toggleMultiFilter("price", id, checked)}
              onAreaChange={(id, checked) => toggleMultiFilter("area", id, checked)}
              compact
            />
          </div>

          <div className="search-results-toolbar">
            <div className="search-result-tabs" role="tablist" aria-label="Loại kết quả">
              <button
                type="button"
                role="tab"
                aria-selected={filterState.type === "food"}
                className={filterState.type === "food" ? "is-active" : ""}
                onClick={() => handleTypeChange("food")}
              >
                Món ăn
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterState.type === "restaurant"}
                className={filterState.type === "restaurant" ? "is-active" : ""}
                onClick={() => handleTypeChange("restaurant")}
              >
                Nhà hàng
              </button>
            </div>

            <label className="search-sort-control">
              <span>Sắp xếp:</span>
              <FormControl size="small">
                <Select<SortOptionId>
                  value={filterState.sort}
                  onChange={handleSortChange}
                  inputProps={{ "aria-label": "Sắp xếp kết quả tìm kiếm" }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </label>
          </div>

          {activeFilters.length > 0 ? (
            <div className="search-active-filters" aria-label="Bộ lọc đang áp dụng">
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  onDelete={() => removeFilter(filter.id)}
                  deleteIcon={<CloseOutlinedIcon />}
                  className="search-active-chip"
                />
              ))}
              <button type="button" onClick={clearFilters}>
                Xóa tất cả
              </button>
            </div>
          ) : null}

          {visibleResults.length > 0 ? (
            <div className="search-results-grid">
              {visibleResults.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  onAction={() =>
                    showPlaceholder(
                      item.type === "food"
                        ? "Tính năng thêm vào giỏ sẽ được triển khai ở sprint tiếp theo."
                        : "Trang nhà hàng chi tiết đang được hoàn thiện cho quán này."
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="search-empty-state">
              <TuneOutlinedIcon />
              <h2>Không tìm thấy kết quả phù hợp</h2>
              <p>Thử bỏ bớt bộ lọc hoặc tìm món ăn, nhà hàng khác.</p>
              <Button variant="contained" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="search-pagination" aria-label="Phân trang kết quả">
              <IconButton
                aria-label="Trang trước"
                disabled={page === 1}
                onClick={() => updatePage(page - 1)}
              >
                <ChevronLeftOutlinedIcon />
              </IconButton>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === page ? "is-active" : ""}
                    onClick={() => updatePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                )
              )}
              <IconButton
                aria-label="Trang sau"
                disabled={page === totalPages}
                onClick={() => updatePage(page + 1)}
              >
                <ChevronRightOutlinedIcon />
              </IconButton>
            </nav>
          ) : null}
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <Link className="home-footer__brand" href="/">
            EatNow
          </Link>
          <div className="home-footer__links">
            <button
              type="button"
              onClick={() => showPlaceholder("Trang giới thiệu sẽ được bổ sung sau.")}
            >
              Về chúng tôi
            </button>
            <button
              type="button"
              onClick={() => showPlaceholder("Điều khoản sẽ được bổ sung sau.")}
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

type FilterPanelProps = {
  openOnly: boolean;
  selectedPriceIds: PriceFilterId[];
  selectedAreaIds: AreaFilterId[];
  onOpenChange: (checked: boolean) => void;
  onPriceChange: (id: PriceFilterId, checked: boolean) => void;
  onAreaChange: (id: AreaFilterId, checked: boolean) => void;
  compact?: boolean;
};

function FilterPanel({
  openOnly,
  selectedPriceIds,
  selectedAreaIds,
  onOpenChange,
  onPriceChange,
  onAreaChange,
  compact = false,
}: FilterPanelProps) {
  return (
    <div className={`search-filter-card${compact ? " is-compact" : ""}`}>
      <h2>
        <TuneOutlinedIcon />
        Bộ lọc
      </h2>

      <div className="search-filter-group">
        <h3>Trạng thái</h3>
        <FormControlLabel
          control={
            <Checkbox
              checked={openOnly}
              onChange={(event) => onOpenChange(event.target.checked)}
            />
          }
          label="Đang mở cửa"
        />
      </div>

      <div className="search-filter-group">
        <h3>Giá cả</h3>
        {priceFilters.map((filter) => (
          <FormControlLabel
            key={filter.id}
            control={
              <Checkbox
                checked={selectedPriceIds.includes(filter.id)}
                onChange={(event) => onPriceChange(filter.id, event.target.checked)}
              />
            }
            label={filter.label}
          />
        ))}
      </div>

      <div className="search-filter-group">
        <h3>Khu vực (Cần Thơ)</h3>
        {areaFilters.map((filter) => (
          <FormControlLabel
            key={filter.id}
            control={
              <Checkbox
                checked={selectedAreaIds.includes(filter.id)}
                onChange={(event) => onAreaChange(filter.id, event.target.checked)}
              />
            }
            label={filter.label}
          />
        ))}
      </div>
    </div>
  );
}

type SearchResultCardProps = {
  item: SearchResultItem;
  onAction: () => void;
};

function SearchResultCard({ item, onAction }: SearchResultCardProps) {
  const actionLabel =
    item.type === "food" ? "Thêm vào giỏ" : "Xem nhà hàng";
  const isOutlinedAction = item.id === "pho-tai-nam" || item.type === "restaurant";

  return (
    <article className="search-result-card">
      <div className="search-result-card__media">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 760px) 100vw, 360px"
        />
        <span className="search-rating-pill">
          <StarOutlinedIcon fontSize="small" />
          {item.rating.toFixed(1)}
        </span>
      </div>

      <div className="search-result-card__body">
        <div className="search-result-card__title-row">
          <h2>{item.name}</h2>
          <strong>{formatSearchCurrency(item.price)}</strong>
        </div>
        <div className="search-result-card__meta">
          <StorefrontOutlinedIcon fontSize="small" />
          {item.restaurantSlug ? (
            <Link
              className="search-result-card__restaurant-link"
              href={`/restaurants/${item.restaurantSlug}`}
            >
              {item.restaurantName}
            </Link>
          ) : (
            <span>{item.restaurantName}</span>
          )}
        </div>
        <p className="search-result-card__description">{item.description}</p>
        <div className="search-result-card__tags">
          <span>{item.districtLabel}</span>
          <span>{item.deliveryMinutes} phút</span>
          <span className={item.isOpen ? "is-open" : "is-closed"}>
            {item.isOpen ? "Đang mở cửa" : "Đang đóng cửa"}
          </span>
        </div>
        {item.type === "restaurant" && item.restaurantSlug ? (
          <Link
            className="search-result-card__action is-outlined"
            href={`/restaurants/${item.restaurantSlug}`}
          >
            <StorefrontOutlinedIcon fontSize="small" />
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={`search-result-card__action${
              isOutlinedAction ? " is-outlined" : ""
            }`}
            onClick={onAction}
          >
            <AddShoppingCartOutlinedIcon fontSize="small" />
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
