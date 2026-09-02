function joinClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const panelShadow = "shadow-[0_12px_24px_rgba(119,87,77,0.08)]";
const liftTransition =
  "transition-[box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(119,87,77,0.14)]";

export const searchFilterPageClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f9fc] text-[#1a1c1e] max-[640px]:pb-[78px]";
export const searchFilterMainClassName =
  "mx-auto grid w-[min(100%,1200px)] flex-1 grid-cols-[260px_minmax(0,1fr)] items-start gap-8 px-6 pb-16 pt-9 max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[640px]:px-4 max-[640px]:pb-11 max-[640px]:pt-6";
export const searchFilterSidebarClassName =
  "sticky top-24 max-[900px]:hidden";
export const searchFilterShellClassName = "min-w-0";

export const searchHeadingClassName = "mb-6";
export const searchHeadingEyebrowClassName =
  "mb-2 mt-0 text-xs font-bold uppercase leading-4 text-[#7a3000]";
export const searchHeadingTitleClassName =
  "m-0 text-[32px] font-bold leading-10 text-[#1a1c1e] max-[640px]:text-[28px] max-[640px]:leading-9";
export const searchHeadingTextClassName =
  "mb-0 mt-1.5 text-sm leading-5 text-[#5a4136]";

export const searchFilterMobilePanelClassName =
  "mb-5 hidden max-[900px]:block";
export function searchFilterCardClassName(compact = false) {
  return joinClassNames(
    `${panelShadow} rounded-3xl bg-white p-5 [&_.MuiCheckbox-root.Mui-checked]:!text-[#7a3000] [&_.MuiCheckbox-root]:!text-[#8e7164] [&_.MuiFormControlLabel-root]:!m-0 [&_.MuiFormControlLabel-root]:min-h-9 [&_.MuiFormControlLabel-root]:text-[#1a1c1e]`,
    compact &&
      "max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:gap-x-[18px] max-[900px]:gap-y-3 max-[640px]:grid-cols-1"
  );
}
export const searchFilterTitleClassName =
  "mb-[18px] mt-0 flex items-center gap-2 text-2xl font-bold leading-8 text-[#1a1c1e] max-[900px]:col-span-full max-[900px]:mb-0";
export const searchFilterTitleIconClassName = "text-[#7a3000]";
export function searchFilterGroupClassName(isFirst = false) {
  if (isFirst) {
    return "grid gap-2 py-[18px] pt-0 max-[900px]:border-t max-[900px]:border-[#e2e2e5] max-[900px]:px-0 max-[900px]:pb-0 max-[900px]:pt-3.5";
  }

  return "grid gap-2 border-t border-[#e2e2e5] py-[18px] max-[900px]:px-0 max-[900px]:pb-0 max-[900px]:pt-3.5";
}
export const searchFilterGroupTitleClassName =
  "m-0 text-lg font-semibold leading-6 text-[#3b2016]";

export const searchResultsToolbarClassName =
  "mb-5 flex items-end justify-between gap-4 border-b border-[#e2e2e5] max-[640px]:items-stretch max-[640px]:flex-col";
export const searchResultTabsClassName =
  "flex items-center gap-1 max-[640px]:border-b max-[640px]:border-[#e2e2e5]";
const searchTypeButtonBaseClassName =
  "min-h-[46px] cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-[18px] py-3 font-[inherit] text-base font-bold leading-5 text-[#5a4136] transition-colors duration-150 hover:border-[#7a3000] hover:text-[#7a3000] data-[active=true]:border-[#7a3000] data-[active=true]:text-[#7a3000] max-[640px]:flex-1";
export function searchTypeButtonClassName(isActive: boolean) {
  return joinClassNames(
    searchTypeButtonBaseClassName,
    isActive && "border-[#7a3000] text-[#7a3000]"
  );
}
export const searchSortControlClassName =
  "inline-flex items-center gap-2.5 text-sm leading-5 text-[#5a4136] max-[640px]:justify-between";
export const searchSortFormControlClassName =
  "max-[640px]:w-full [&_.MuiOutlinedInput-root]:min-w-[190px] [&_.MuiOutlinedInput-root]:rounded-lg [&_.MuiOutlinedInput-root]:bg-white max-[640px]:[&_.MuiOutlinedInput-root]:w-full max-[640px]:[&_.MuiOutlinedInput-root]:min-w-0";

export const searchActiveFiltersClassName =
  "mb-6 flex flex-wrap items-center gap-2.5";
export const searchActiveChipClassName =
  "!rounded-full !bg-[#ffd3c6] !font-bold !text-[#7a594f] [&_.MuiChip-deleteIcon]:!text-[#7a594f]";
export const searchClearFiltersButtonClassName =
  "min-h-8 cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] font-bold leading-[18px] text-[#7a3000] hover:underline";

export const searchResultsGridClassName =
  "grid grid-cols-2 gap-5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1";
export const searchResultCardClassName =
  `${panelShadow} ${liftTransition} flex min-w-0 flex-col overflow-hidden rounded-3xl bg-white text-inherit no-underline`;
export const searchResultMediaClassName =
  "relative min-h-[180px] overflow-hidden bg-[#e2e2e5] max-[640px]:min-h-[190px]";
export const searchResultImageClassName = "object-cover";
export const searchRatingPillClassName =
  "absolute right-3 top-3 inline-flex min-h-8 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-sm font-bold leading-5 text-[#1a1c1e] shadow-[0_6px_12px_rgba(119,87,77,0.12)]";
export const searchRatingIconClassName = "text-[#ffb300]";
export const searchResultBodyClassName =
  "flex min-h-[260px] flex-1 flex-col px-5 pb-5 pt-[18px]";
export const searchResultTitleRowClassName =
  "mb-2 flex items-start justify-between gap-3.5 max-[640px]:flex-col max-[640px]:gap-1";
export const searchResultTitleClassName =
  "m-0 min-w-0 text-xl font-bold leading-7 text-[#1a1c1e]";
export const searchResultPriceClassName =
  "shrink-0 text-xl font-bold leading-7 text-[#7a3000]";
export const searchResultMetaClassName =
  "mb-2.5 flex items-center gap-1.5 text-sm leading-5 text-[#5a4136]";
export const searchResultMetaIconClassName = "text-[#7a3000]";
export const searchResultRestaurantLinkClassName =
  "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-inherit no-underline hover:text-[#7a3000] hover:underline";
export const searchResultDescriptionClassName =
  "mb-3.5 mt-0 line-clamp-2 min-h-10 overflow-hidden text-[13px] leading-5 text-[#5a4136]";
export const searchResultTagsClassName =
  "mb-4 mt-auto flex flex-wrap gap-2";
const searchResultTagBaseClassName =
  "inline-flex min-h-[26px] items-center rounded-full px-2.5 py-[5px] text-xs font-bold leading-4";
export function searchResultStatusTagClassName(isOpen: boolean) {
  return joinClassNames(
    searchResultTagBaseClassName,
    isOpen ? "bg-[#e8f5ee] text-[#27865c]" : "bg-[#ffdad6] text-[#93000a]"
  );
}
export const searchResultTagClassName =
  `${searchResultTagBaseClassName} bg-[#f3f3f6] text-[#5a4136]`;
const searchResultActionBaseClassName =
  "inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#7a3000] px-4 py-2.5 font-[inherit] text-base font-bold leading-5 no-underline transition-[background-color,border-color,color] duration-150";
export function searchResultActionClassName(isOutlined: boolean) {
  return joinClassNames(
    searchResultActionBaseClassName,
    isOutlined
      ? "bg-white text-[#7a3000] hover:bg-[#f3f3f6]"
      : "bg-[#7a3000] text-white hover:border-[#a04100] hover:bg-[#a04100]"
  );
}

export const searchEmptyStateClassName =
  `${panelShadow} grid min-h-80 place-items-center rounded-3xl bg-white px-6 py-12 text-center`;
export const searchEmptyStateIconClassName =
  "text-[42px] text-[#7a3000]";
export const searchEmptyStateTitleClassName =
  "m-0 text-2xl font-bold leading-8 text-[#1a1c1e]";
export const searchEmptyStateTextClassName =
  "m-0 max-w-[420px] text-sm leading-5 text-[#5a4136]";

export const searchPaginationClassName =
  "mt-8 flex justify-center gap-2 max-[640px]:flex-wrap";
export const searchPaginationIconButtonClassName =
  "!h-11 !w-11 !border !border-[#ddc1b4] !bg-white !text-[#1a1c1e]";
const searchPaginationButtonBaseClassName =
  "h-11 w-11 cursor-pointer rounded-full border border-[#ddc1b4] bg-white font-[inherit] font-bold text-[#1a1c1e] data-[active=true]:border-[#7a3000] data-[active=true]:bg-[#7a3000] data-[active=true]:text-white";
export function searchPaginationButtonClassName(isActive: boolean) {
  return joinClassNames(
    searchPaginationButtonBaseClassName,
    isActive && "border-[#7a3000] bg-[#7a3000] text-white"
  );
}
