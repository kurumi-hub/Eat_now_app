const pageText = "text-[#1a1c1e]";
const mutedText = "text-[#5a4136]";
const brandText = "text-[#7a3000]";
const panelBorder = "border border-[rgba(221,193,180,0.42)]";
const softShadow = "shadow-[0_8px_18px_rgba(119,87,77,0.08)]";
const liftTransition =
  "transition-[border-color,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:border-[#ffb693] hover:shadow-[0_14px_28px_rgba(119,87,77,0.14)]";

function joinClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export const restaurantListPageClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f9fc] text-[#1a1c1e] max-[640px]:pb-[92px]";
export const restaurantListMainClassName =
  "mx-auto w-[min(100%,1200px)] flex-1 px-6 pb-14 pt-8 max-[900px]:pt-7 max-[640px]:px-4 max-[640px]:pb-10 max-[640px]:pt-6";
export const restaurantListIntroClassName = "grid gap-3";
export const restaurantListBreadcrumbClassName =
  "flex items-center gap-2 text-sm leading-5 text-[#5a4136] max-[640px]:text-[13px] max-[640px]:leading-[18px] [&_a]:text-inherit [&_a]:no-underline hover:[&_a]:text-[#7a3000] [&_svg]:text-base [&_svg]:text-[#77574d] [&_span]:font-semibold [&_span]:text-[#1a1c1e]";
export const restaurantListTitleClassName =
  "m-0 text-[44px] font-extrabold leading-[52px] text-[#1a1c1e] max-[900px]:text-4xl max-[900px]:leading-[44px] max-[640px]:text-[32px] max-[640px]:leading-10";
export const restaurantListIntroTextClassName =
  "m-0 text-base leading-6 text-[#1a1c1e]";
export const restaurantListCountClassName =
  "font-extrabold text-[#7a3000]";
export const restaurantCategorySectionClassName = "mt-[18px]";
export const restaurantCategoryTitleClassName =
  "mb-4 mt-0 text-lg font-semibold leading-6 text-[#1a1c1e]";
export const restaurantCategoryRailClassName =
  "flex gap-6 overflow-x-auto pb-1 [scrollbar-width:none] max-[640px]:gap-[18px] [&::-webkit-scrollbar]:hidden";
const restaurantListCategoryButtonBaseClassName =
  "group grid min-w-[72px] shrink-0 cursor-pointer place-items-center gap-2 border-0 bg-transparent p-0 font-[inherit] text-xs font-bold leading-4 text-[#5a4136] transition-colors duration-150 hover:text-[#7a3000] data-[active=true]:text-[#7a3000]";
export function restaurantListCategoryButtonClassName(isActive: boolean) {
  return joinClassNames(
    restaurantListCategoryButtonBaseClassName,
    isActive && "text-[#7a3000]"
  );
}
export const restaurantCategoryIconClassName =
  "grid h-16 w-16 place-items-center rounded-full border border-[#ddc1b4] bg-white text-[#77574d] shadow-[0_4px_10px_rgba(119,87,77,0.08)] transition-[background-color,border-color,color,transform] duration-150 group-hover:-translate-y-px group-hover:border-[#7a3000] group-hover:bg-[#ffd3c6] group-hover:text-[#7a3000] group-data-[active=true]:-translate-y-px group-data-[active=true]:border-[#7a3000] group-data-[active=true]:bg-[#ffd3c6] group-data-[active=true]:text-[#7a3000] [&_svg]:text-[32px]";

export const restaurantListFilterPanelClassName =
  "my-10 mb-8 flex items-center justify-between gap-4 rounded-xl border border-[#ddc1b4] bg-white p-4 shadow-[0_6px_14px_rgba(119,87,77,0.08)] max-[900px]:items-stretch max-[900px]:flex-col max-[640px]:my-[34px] max-[640px]:mb-7 max-[640px]:p-3.5";
export const restaurantListFilterChipsClassName =
  "flex min-w-0 flex-wrap items-center gap-2.5";
const restaurantFilterChipBaseClassName =
  "inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-[#ddc1b4] bg-[#f9f9fc] px-4 py-2 font-[inherit] text-[15px] font-bold leading-5 text-[#3b2016] transition-[background-color,border-color,color] duration-150 hover:border-[#7a3000] hover:bg-[#ffdbd0] hover:text-[#7a3000] data-[active=true]:border-[#7a3000] data-[active=true]:bg-[#ffdbd0] data-[active=true]:text-[#7a3000] max-[640px]:min-h-9 max-[640px]:px-3.5 max-[640px]:text-sm max-[640px]:leading-[18px] [&_svg]:text-lg";
export function restaurantFilterChipClassName(
  isActive: boolean,
  isControl = false
) {
  return joinClassNames(
    restaurantFilterChipBaseClassName,
    isControl && "bg-[#fffdfc]",
    isActive && "border-[#7a3000] bg-[#ffdbd0] text-[#7a3000]"
  );
}
export const restaurantFilterDividerClassName =
  "mx-1.5 h-7 w-px bg-[#ddc1b4] max-[900px]:hidden";
export const restaurantSortControlClassName =
  "inline-flex shrink-0 items-center gap-2.5 text-[15px] font-medium leading-5 text-[#5a4136] max-[900px]:w-full max-[900px]:justify-between";
export const restaurantSortSelectClassName =
  "min-h-10 cursor-pointer rounded-lg border border-[#ddc1b4] bg-[#f9f9fc] px-3.5 py-2 pr-9 font-[inherit] font-bold text-[#1a1c1e] max-[900px]:flex-1";

export const restaurantResultsSectionClassName = "scroll-mt-[92px]";
export const restaurantResultsHeadingClassName =
  "mb-[18px] flex items-end justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col max-[640px]:gap-1";
export const restaurantResultsTitleClassName =
  "m-0 text-[28px] font-extrabold leading-9 text-[#1a1c1e] max-[640px]:text-2xl max-[640px]:leading-8";
export const restaurantResultsCountClassName =
  "text-sm leading-5 text-[#1a1c1e]";
export const restaurantListGridClassName =
  "grid grid-cols-4 gap-6 max-[1100px]:grid-cols-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-[18px]";
export const restaurantListCardClassName =
  `group overflow-hidden rounded-xl border border-[#e2e2e5] bg-white shadow-[0_6px_14px_rgba(119,87,77,0.08)] ${liftTransition}`;
export const restaurantListCardHitareaClassName =
  "flex min-h-full w-full cursor-pointer flex-col border-0 bg-transparent p-0 text-left font-[inherit] text-inherit no-underline focus-visible:outline focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[rgba(255,107,0,0.34)]";
export const restaurantListCardMediaClassName =
  "relative aspect-video overflow-hidden bg-[#e2e2e5]";
export const restaurantListCardImageClassName =
  "object-cover transition-transform duration-[280ms] group-hover:scale-[1.04]";
export function restaurantListTagClassName(
  tone: "deal" | "shipping" | "favorite" | undefined
) {
  const toneClassNames = {
    deal: "bg-[#ba1a1a]",
    shipping: "bg-[#0062a1]",
    favorite: "bg-[#7a3000]",
  };

  return joinClassNames(
    "absolute left-3 top-3 inline-flex min-h-6 items-center rounded px-2 py-1 text-xs font-extrabold leading-4 text-white",
    toneClassNames[tone || "deal"]
  );
}
export const restaurantListFavoriteClassName =
  "absolute right-3 top-3 grid h-[34px] w-[34px] place-items-center rounded-full border border-[rgba(221,193,180,0.72)] bg-white/90 text-[#3b2016] shadow-[0_6px_14px_rgba(119,87,77,0.16)]";
export const restaurantListCardBodyClassName =
  "flex flex-1 flex-col gap-[7px] p-4";
export const restaurantListCardTitleClassName =
  "m-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-extrabold leading-6 text-[#1a1c1e] max-[640px]:whitespace-normal";
export const restaurantListCardRatingClassName =
  "flex min-w-0 items-center gap-[5px] text-[13px] leading-[18px] text-[#5a4136] [&_strong]:font-extrabold [&_strong]:text-[#1a1c1e]";
export const restaurantRatingIconClassName =
  "shrink-0 text-[#a04100]";
export const restaurantListCuisineClassName =
  "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap";
export const restaurantListCardMetaClassName =
  "flex items-center justify-between gap-2.5 text-xs leading-4 text-[#5a4136]";
export const restaurantListMetaItemClassName =
  "inline-flex min-w-0 items-center gap-[5px] whitespace-nowrap [&_svg]:shrink-0 [&_svg]:text-[15px]";
export const restaurantListFeeClassName =
  "text-[13px] font-extrabold leading-[18px] text-[#7a3000]";
export const restaurantListStatusClassName =
  "m-0 flex items-center gap-1.5 text-xs leading-4 text-[#5a4136]";
export const restaurantListStatusDotClassName =
  "h-1.5 w-1.5 shrink-0 rounded-full bg-[#19a85b]";
export const restaurantListMoreRowClassName =
  "mt-8 flex justify-center";
export const restaurantListMoreButtonClassName =
  "min-h-12 cursor-pointer rounded-full border-0 bg-[#a04100] px-[34px] py-3 font-[inherit] text-base font-extrabold leading-5 text-white shadow-[0_8px_18px_rgba(122,48,0,0.22)] transition-[background-color,transform] duration-[180ms] hover:-translate-y-px hover:bg-[#7a3000]";
export const restaurantListEmptyClassName =
  "grid min-h-[280px] place-items-center rounded-2xl border border-[rgba(221,193,180,0.58)] bg-white p-8 text-center text-[#5a4136] shadow-[0_8px_18px_rgba(119,87,77,0.08)]";
export const restaurantListEmptyIconClassName =
  "mb-2 h-[46px] w-[46px] text-[#7a3000]";
export const restaurantListEmptyTitleClassName =
  "m-0 text-[22px] font-extrabold leading-[30px] text-[#1a1c1e]";
export const restaurantListEmptyTextClassName =
  "mb-[18px] mt-1.5 text-sm leading-5 text-[#5a4136]";
export const restaurantListEmptyButtonClassName =
  "min-h-10 cursor-pointer rounded-full border-0 bg-[#7a3000] px-[18px] py-2.5 font-[inherit] text-sm font-extrabold leading-[18px] text-white";
export const restaurantListBottomNavClassName =
  "hidden max-[640px]:fixed max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:right-3 max-[640px]:z-40 max-[640px]:grid max-[640px]:min-h-16 max-[640px]:grid-cols-5 max-[640px]:gap-1 max-[640px]:rounded-3xl max-[640px]:bg-white max-[640px]:p-2 max-[640px]:shadow-[0_14px_28px_rgba(119,87,77,0.2)]";

export const restaurantDetailPageClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f8f7] text-[#1a1c1e] max-[640px]:pb-[92px]";
export const restaurantDetailMainClassName =
  "mx-auto w-[min(100%,1200px)] flex-1 px-6 pb-14 pt-6 max-[900px]:pt-6 max-[640px]:px-4 max-[640px]:pb-10 max-[640px]:pt-5";
export const restaurantHeroClassName =
  "group grid min-h-[306px] grid-cols-[280px_minmax(0,1fr)] gap-6 rounded-xl border border-[rgba(221,193,180,0.34)] bg-white p-6 shadow-[0_12px_24px_rgba(119,87,77,0.08)] max-[900px]:grid-cols-1 max-[640px]:gap-4 max-[640px]:p-3.5";
export const restaurantHeroMediaClassName =
  "relative aspect-square w-[280px] overflow-hidden rounded-xl bg-[#e2e2e5] shadow-[0_8px_18px_rgba(119,87,77,0.1)] max-[900px]:w-full max-[900px]:max-w-none max-[900px]:aspect-[16/10] max-[640px]:aspect-square";
export const restaurantHeroImageClassName =
  "object-cover transition-transform duration-[220ms] group-hover:scale-[1.04]";
export const restaurantHeroBodyClassName = "min-w-0 py-1";
export const restaurantHeroToplineClassName =
  "flex items-start justify-between gap-6 max-[640px]:flex-col";
export const restaurantHeroIdentityClassName =
  "grid min-w-0 gap-1.5";
export const restaurantHeroTitleClassName =
  "m-0 text-[32px] font-extrabold leading-10 text-[#1a1c1e] max-[640px]:text-[28px] max-[640px]:leading-9";
export const restaurantRatingLineClassName =
  "flex items-center gap-1 text-sm leading-5 text-[#5a4136] [&_strong]:font-extrabold [&_strong]:text-[#1a1c1e]";
export const restaurantHeroAddressClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const restaurantOpenStatusClassName =
  "text-sm font-extrabold leading-5 text-[#7a3000]";
export const restaurantDetailActionsClassName =
  "flex items-center gap-2.5 text-[#7a3000]";
export const restaurantDetailActionButtonClassName =
  "grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-inherit transition-colors duration-150 hover:bg-[#ffdbcc] hover:text-[#a04100] [&_svg]:text-[22px]";
export const restaurantServiceRowClassName =
  "mt-3.5 flex flex-wrap items-center gap-2";
export const restaurantServicePillClassName =
  "min-h-6 rounded-full bg-[#ffd3c6] px-2.5 py-1 text-xs font-extrabold leading-4 text-[#7a594f]";
export const restaurantSectionClassName = "mt-8";
export const restaurantSectionTitleClassName =
  "mb-4 mt-0 text-2xl font-bold leading-8 text-[#1a1c1e]";
export const restaurantVoucherStripClassName =
  "flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [scroll-snap-type:x_proximity] [&::-webkit-scrollbar]:hidden";
export const restaurantVoucherCardClassName =
  "flex min-w-[280px] items-center justify-between gap-[18px] rounded-xl border border-[#ffb693] bg-[#ffdbcc] p-4 text-[#2c160e] [scroll-snap-align:start] max-[640px]:min-w-[244px]";
export const restaurantVoucherTextClassName = "grid gap-1";
export const restaurantVoucherTitleClassName =
  "text-base font-extrabold leading-[22px] text-[#a04100]";
export const restaurantVoucherSubtitleClassName =
  "text-[13px] leading-[18px] text-[#5d4037]";
export const restaurantVoucherButtonClassName =
  "min-h-8 shrink-0 cursor-pointer rounded-full border-0 bg-[#a04100] px-3.5 py-1.5 font-[inherit] text-[13px] font-extrabold leading-[18px] text-white";
export const restaurantMenuSearchClassName =
  "relative mt-7 flex min-h-[42px] items-center gap-2.5 rounded-full border border-[rgba(142,113,100,0.42)] bg-white px-4 text-[#5a4136] shadow-[0_6px_14px_rgba(119,87,77,0.06)] [&_svg]:shrink-0 [&_svg]:text-lg";
export const restaurantMenuSearchInputClassName =
  "min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-sm leading-5 text-[#1a1c1e] outline-none placeholder:text-[rgba(90,65,54,0.62)]";
export const restaurantCategoryPillsClassName =
  "sticky top-[78px] z-30 -mx-1 mt-7 flex gap-2.5 overflow-x-auto bg-[rgba(249,248,247,0.94)] px-1 py-2.5 backdrop-blur-xl [scrollbar-width:none] max-[640px]:top-28 [&::-webkit-scrollbar]:hidden";
const restaurantCategoryPillBaseClassName =
  "min-h-[42px] shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-[#8e7164] bg-white px-[18px] py-[9px] font-[inherit] text-sm font-extrabold leading-5 text-[#3b2016] transition-[background-color,border-color,box-shadow,color] duration-150 hover:border-[#a04100] hover:bg-[#a04100] hover:text-white hover:shadow-[0_8px_18px_rgba(160,65,0,0.18)] data-[active=true]:border-[#a04100] data-[active=true]:bg-[#a04100] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(160,65,0,0.18)]";
export function restaurantCategoryPillClassName(isActive: boolean) {
  return joinClassNames(
    restaurantCategoryPillBaseClassName,
    isActive &&
      "border-[#a04100] bg-[#a04100] text-white shadow-[0_8px_18px_rgba(160,65,0,0.18)]"
  );
}
export const restaurantMenuColumnClassName = "min-w-0";
export const restaurantMenuSectionClassName = "mt-8 scroll-mt-[152px]";
export function restaurantMenuGridClassName(compact: boolean) {
  return compact
    ? "grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[420px]:grid-cols-1"
    : "grid grid-cols-2 gap-4 max-[900px]:grid-cols-1";
}
export function restaurantMenuCardClassName(
  compact: boolean,
  isAvailable: boolean
) {
  return joinClassNames(
    `group rounded-xl border border-[rgba(226,226,229,0.85)] bg-white shadow-[0_8px_18px_rgba(119,87,77,0.08)] ${liftTransition}`,
    compact
      ? "grid gap-2 p-2"
      : "grid min-h-[132px] grid-cols-[minmax(0,1fr)_120px] gap-4 p-4 max-[640px]:grid-cols-[minmax(0,1fr)_92px] max-[640px]:gap-3 max-[640px]:p-3 max-[420px]:grid-cols-1",
    !isAvailable && "opacity-[0.62]"
  );
}
export function restaurantMenuMediaClassName(
  compact: boolean,
  isPlaceholder = false
) {
  return joinClassNames(
    "relative overflow-hidden rounded-[10px]",
    compact
      ? "aspect-square h-auto w-full"
      : "order-2 h-[120px] w-[120px] max-[640px]:h-[92px] max-[640px]:w-[92px] max-[420px]:order-none max-[420px]:h-auto max-[420px]:w-full max-[420px]:aspect-[16/10]",
    isPlaceholder
      ? "grid place-items-center bg-[#e8e8ea] text-[rgba(90,65,54,0.32)]"
      : "bg-[#e2e2e5]"
  );
}
export const restaurantMenuImageClassName =
  "object-cover transition-transform duration-[220ms] group-hover:scale-[1.04]";
export const restaurantMenuPlaceholderIconClassName = "text-[34px]";
export const restaurantMenuCardContentClassName =
  "grid min-w-0 gap-2";
export const restaurantMenuCardTitleRowClassName =
  "flex flex-wrap items-center gap-1.5";
export function restaurantMenuItemTitleClassName(compact: boolean) {
  return compact
    ? "m-0 text-sm font-extrabold leading-5 text-[#1a1c1e]"
    : "m-0 text-base font-extrabold leading-[22px] text-[#1a1c1e]";
}
export const restaurantMenuItemDescriptionClassName =
  "m-0 line-clamp-2 overflow-hidden text-[13px] leading-[18px] text-[#5a4136] max-[640px]:text-xs max-[640px]:leading-[17px]";
export const restaurantMenuBadgeClassName =
  "inline-flex min-h-[18px] items-center rounded bg-[#ffdbcc] px-1.5 py-0.5 text-[10px] font-black uppercase leading-[14px] text-[#7a3000]";
export const restaurantMenuSaleBadgeClassName =
  "inline-flex min-h-[18px] items-center rounded-full bg-[#a04100] px-1.5 py-0.5 text-[10px] font-black uppercase leading-[14px] text-white";
export function restaurantMenuFooterClassName(compact: boolean) {
  return compact
    ? "mt-auto grid gap-2"
    : "mt-auto flex items-center justify-between gap-2.5";
}
export const restaurantMenuPriceRowClassName =
  "inline-flex min-w-0 flex-wrap items-baseline gap-2";
export const restaurantMenuPriceValueClassName =
  "text-lg font-black leading-[22px] text-[#a04100]";
export const restaurantMenuOriginalPriceClassName =
  "text-xs leading-4 text-[#8e7164] line-through";
export const restaurantCustomizationPriceRowClassName =
  "inline-flex min-w-0 flex-wrap items-baseline gap-2";
export const restaurantCustomizationPriceValueClassName =
  "text-xl font-extrabold leading-[26px] text-[#7a3000]";
export const restaurantCustomizationOriginalPriceClassName =
  "text-[15px] leading-5 text-[#8e7164] line-through";
export const restaurantCustomizationDiscountClassName =
  "rounded-full bg-[#a04100] px-2 py-[3px] text-xs font-black leading-4 text-white";
export const restaurantMenuSaleMeterClassName = "grid gap-1.5";
export const restaurantCustomizationSaleMeterClassName = "grid gap-1.5";
export const restaurantMenuSaleMeterTextClassName =
  "flex items-center justify-between gap-2 text-xs font-extrabold leading-4 text-[#7a3000]";
export const restaurantMenuSaleProgressClassName =
  "h-1.5 overflow-hidden rounded-full bg-[#ead9d0]";
export const restaurantMenuSaleProgressBarClassName =
  "block h-full rounded-[inherit] bg-[#7a3000]";
export function restaurantAddButtonClassName(compact: boolean) {
  return compact
    ? "inline-flex min-h-[26px] w-full cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border-0 bg-[#eeeef0] px-2.5 py-1 font-[inherit] text-[11px] font-extrabold leading-[14px] text-[#5a4136] disabled:cursor-not-allowed disabled:opacity-[0.58]"
    : "inline-flex min-h-8 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border-0 bg-[#a04100] px-3.5 py-1.5 font-[inherit] text-[13px] font-extrabold leading-[18px] text-white disabled:cursor-not-allowed disabled:opacity-[0.58]";
}
export const restaurantMenuUnavailableClassName =
  "inline-flex min-h-[18px] w-fit items-center rounded bg-[#ffdad6] px-1.5 py-0.5 text-[10px] font-black uppercase leading-[14px] text-[#93000a]";
export const restaurantMenuEmptyClassName =
  "mt-7 rounded-xl border border-dashed border-[#ddc1b4] bg-white p-6 text-center text-[#5a4136]";
export const restaurantSectionHeadingClassName =
  "mb-4 flex items-center justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col";
export const restaurantReviewSummaryClassName =
  "flex items-center gap-1 text-sm leading-5 text-[#5a4136] [&_strong]:text-[#1a1c1e]";
export const restaurantReviewGridClassName =
  "grid grid-cols-3 gap-4 max-[900px]:grid-cols-1";
export const restaurantReviewCardClassName =
  "rounded-xl border border-[rgba(226,226,229,0.9)] bg-white p-4 shadow-[0_8px_18px_rgba(119,87,77,0.08)]";
export const restaurantReviewHeaderClassName =
  "mb-3 flex items-center gap-2.5";
export function restaurantReviewAvatarClassName(
  tone: "primary" | "secondary" | "tertiary"
) {
  const toneClassNames = {
    primary: "bg-[#a04100]",
    secondary: "bg-[#77574d]",
    tertiary: "bg-[#0062a1]",
  };

  return joinClassNames(
    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-black text-white",
    toneClassNames[tone]
  );
}
export const restaurantReviewIdentityClassName = "min-w-0";
export const restaurantReviewNameClassName =
  "block text-[13px] leading-[18px] text-[#1a1c1e]";
export const restaurantReviewTimeClassName =
  "ml-auto whitespace-nowrap text-[11px] leading-[14px] text-[#5a4136]";
export const restaurantReviewStarsClassName =
  "flex items-center gap-0 text-[13px] text-[#a04100]";
export const restaurantReviewTextClassName =
  "m-0 text-[13px] leading-5 text-[#5a4136]";
export const restaurantInfoCardClassName =
  "grid gap-[18px] rounded-xl border border-[rgba(226,226,229,0.9)] bg-white p-5 shadow-[0_8px_18px_rgba(119,87,77,0.08)]";
export const restaurantInfoRowClassName =
  "flex items-start gap-3";
export const restaurantInfoIconClassName =
  "mt-0.5 text-xl text-[#a04100]";
export const restaurantInfoTitleClassName =
  "mb-[3px] block text-sm font-extrabold leading-5 text-[#1a1c1e]";
export const restaurantInfoDescriptionClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";

export const restaurantCustomizationOverlayClassName =
  "fixed inset-0 z-[80] grid h-[100dvh] place-items-center overflow-hidden bg-[rgba(18,18,18,0.58)] p-4 max-[640px]:items-end max-[640px]:p-0";
export const restaurantCustomizationModalClassName =
  "relative flex max-h-[calc(100dvh-32px)] w-[min(100%,560px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_26px_60px_rgba(30,18,12,0.34)] max-[640px]:max-h-[92dvh] max-[640px]:w-full max-[640px]:rounded-t-3xl max-[640px]:rounded-b-none";
export const restaurantCustomizationCloseClassName =
  "absolute right-3.5 top-3.5 z-[2] grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-0 bg-white/95 text-[#3b2016] hover:bg-[#ffdbcc] hover:text-[#a04100]";
export const restaurantCustomizationBodyClassName =
  "flex min-h-0 flex-col gap-5 overflow-y-auto px-7 pt-7 [scrollbar-gutter:stable] max-[640px]:px-4 max-[640px]:py-[22px]";
export const restaurantCustomizationHeaderClassName = "grid gap-3";
export const restaurantCustomizationTitleClassName =
  "m-0 text-2xl font-extrabold leading-8 text-[#1a1c1e]";
export const restaurantCustomizationDescriptionClassName =
  "mb-0 mt-1 text-sm leading-5 text-[#5a4136]";
export const restaurantCustomizationSectionClassName = "grid gap-2.5";
export const restaurantCustomizationPreferenceSectionClassName =
  "grid gap-2";
export const restaurantCustomizationSectionTitleClassName =
  "m-0 text-[15px] font-extrabold leading-[22px] text-[#1a1c1e]";
export const restaurantCustomizationOptionsClassName = "grid gap-2";
export const restaurantCustomizationOptionClassName =
  "grid min-h-[46px] cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-[#e2e2e5] bg-[#f9f8f7] px-3 py-2.5 text-[#3b2016] hover:border-[#ffb693] hover:bg-[#fff7f3] [&_input]:accent-[#a04100]";
export const restaurantCustomizationOptionLabelClassName =
  "min-w-0 text-sm font-bold leading-5";
export const restaurantCustomizationOptionPriceClassName =
  "text-sm leading-5 text-[#7a3000]";
export const restaurantCustomizationPreferencesClassName =
  "grid grid-cols-2 gap-x-3 gap-y-2 max-[640px]:grid-cols-1";
export const restaurantCustomizationPreferenceClassName =
  "flex min-h-9 cursor-pointer items-center gap-2 text-[13px] font-bold leading-[18px] text-[#3b2016] [&_input]:h-4 [&_input]:w-4 [&_input]:shrink-0 [&_input]:accent-[#a04100] [&_span]:min-w-0";
export const restaurantCustomizationEmptyClassName =
  "m-0 rounded-xl bg-[#f3f3f6] p-3 text-[13px] leading-[18px] text-[#5a4136]";
export const restaurantCustomizationNoteClassName = "grid gap-2";
export const restaurantCustomizationNoteLabelClassName =
  "text-[15px] font-extrabold leading-[22px] text-[#1a1c1e]";
export const restaurantCustomizationTextareaClassName =
  "w-full resize-y rounded-xl border border-[#ddc1b4] bg-[#f9f8f7] p-3 font-[inherit] text-sm leading-5 text-[#1a1c1e] outline-none focus:border-[#a04100] focus:shadow-[0_0_0_3px_rgba(160,65,0,0.12)]";
export const restaurantCustomizationFooterClassName =
  "sticky bottom-0 -mx-7 mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 border-t border-[#e2e2e5] bg-white px-7 pb-5 pt-4 shadow-[0_-12px_24px_rgba(30,18,12,0.08)] max-[640px]:-mx-4 max-[640px]:grid-cols-1 max-[640px]:px-4 max-[640px]:pb-[18px] max-[640px]:pt-3.5";
export const restaurantCustomizationQuantityClassName =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ddc1b4] bg-[#f9f8f7] px-2 py-1";
export const restaurantCustomizationQuantityButtonClassName =
  "grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#5a4136] hover:bg-[#ffdbcc] hover:text-[#a04100] disabled:cursor-not-allowed disabled:opacity-[0.42]";
export const restaurantCustomizationQuantityValueClassName =
  "min-w-7 text-center text-base font-extrabold leading-[22px] text-[#1a1c1e]";
export const restaurantCustomizationSubmitClassName =
  "min-h-12 cursor-pointer rounded-full border-0 bg-[#a04100] px-5 py-3 font-[inherit] text-[15px] font-black leading-[22px] text-white hover:bg-[#7a3000]";
export const restaurantBottomNavClassName =
  "hidden max-[640px]:fixed max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:right-3 max-[640px]:z-40 max-[640px]:grid max-[640px]:min-h-16 max-[640px]:grid-cols-5 max-[640px]:gap-1 max-[640px]:rounded-3xl max-[640px]:bg-white max-[640px]:p-2 max-[640px]:shadow-[0_14px_28px_rgba(119,87,77,0.2)]";
export function restaurantBottomNavButtonClassName(isActive = false) {
  return joinClassNames(
    "grid min-h-12 min-w-0 cursor-pointer place-items-center gap-px rounded-full border-0 bg-transparent p-1 font-[inherit] text-[10px] leading-[13px] text-[#5a4136] [&_svg]:text-[19px]",
    isActive && "bg-[#ffd3c6] text-[#7a594f]"
  );
}

export { brandText, mutedText, pageText, panelBorder, softShadow };
