const primaryText = "text-[#1a1c1e]";
const mutedText = "text-[#5a4136]";
const brandText = "text-[#7a3000]";
const hoverLift =
  "transition-[box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(119,87,77,0.14)]";

export const pageClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f9fc] text-[#1a1c1e] max-[760px]:pb-[78px]";

export const headerClassName =
  "sticky top-0 z-40 border-b border-[rgba(138,114,103,0.18)] bg-[rgba(249,249,252,0.94)] shadow-[0_4px_14px_rgba(119,87,77,0.12)] backdrop-blur-[14px]";
export const headerInnerClassName =
  "mx-auto grid min-h-[68px] w-[min(100%,1200px)] grid-cols-[auto_minmax(230px,1fr)_auto_auto] items-center gap-[18px] px-6 py-2.5 max-[1024px]:grid-cols-[auto_1fr_auto] max-[760px]:w-full max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pb-3.5 max-[760px]:pt-2.5";
export const headerBrandGroupClassName =
  "inline-flex min-w-max items-center gap-3";
export const logoClassName =
  "text-[34px] font-bold leading-[44px] text-[#7a3000] no-underline max-[760px]:text-[30px] max-[760px]:leading-[38px]";
export const locationButtonClassName =
  "inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#f3f3f6] px-3 py-2 text-[13px] font-semibold text-[#5a4136] max-[1024px]:hidden [&_span]:whitespace-nowrap";
export const locationMenuClassName =
  "grid w-[min(360px,calc(100vw-32px))] gap-2.5 p-3";
export const locationMenuHeaderClassName =
  "grid gap-1 px-1 pb-2 pt-1 [&_span]:text-[13px] [&_span]:leading-[18px] [&_span]:text-[#5a4136] [&_strong]:text-[15px] [&_strong]:font-extrabold [&_strong]:leading-[22px] [&_strong]:text-[#1a1c1e]";
export const locationMenuListClassName =
  "grid max-h-[292px] gap-1.5 overflow-y-auto";
const locationOptionBaseClassName =
  "flex min-h-[74px] items-start gap-2.5 whitespace-normal rounded-lg border border-[rgba(138,114,103,0.2)] p-2.5 data-[active=true]:border-[#ffb49c] data-[active=true]:bg-[#fff0ea] [&_.MuiListItemIcon-root]:min-w-7 [&_.MuiListItemIcon-root]:pt-[3px] [&_.MuiListItemIcon-root]:text-[#7a3000]";
export function locationOptionClassName(isActive: boolean) {
  return `${locationOptionBaseClassName} ${
    isActive ? "border-[#ffb49c] bg-[#fff0ea]" : ""
  }`;
}
export const locationOptionNameClassName =
  "block [overflow-wrap:anywhere] text-sm font-extrabold leading-5 text-[#1a1c1e]";
export const locationOptionSecondaryClassName =
  "line-clamp-2 overflow-hidden [overflow-wrap:anywhere] text-[13px] leading-[18px] text-[#5a4136]";
export const locationChipClassName =
  "!h-6 !shrink-0 !rounded-full !bg-[#d8f2dc] !text-[11px] !font-extrabold !text-[#226738]";
export const locationMenuStateClassName =
  "grid min-h-[88px] place-items-center gap-2.5 rounded-lg bg-[#f9f9fc] p-4 text-center [&_a]:text-[13px] [&_a]:font-extrabold [&_a]:leading-5 [&_a]:text-[#7a3000] [&_a]:no-underline [&_p]:m-0 [&_p]:text-[13px] [&_p]:leading-[18px] [&_p]:text-[#5a4136]";
export const locationMenuLoadingClassName =
  "grid min-h-[88px] grid-cols-[auto_auto] place-items-center justify-center gap-2.5 rounded-lg bg-[#f9f9fc] p-4 text-center text-[13px] leading-[18px] text-[#5a4136]";
export const locationManageClassName =
  "flex min-h-9 items-center justify-center rounded-lg bg-[#fff0ea] text-[13px] font-extrabold leading-5 text-[#7a3000] no-underline";

export const searchFormClassName =
  "flex min-h-11 min-w-0 items-center overflow-hidden rounded-full border border-[#8e7164] bg-white shadow-[0_4px_12px_rgba(119,87,77,0.08)] focus-within:border-[#7a3000] focus-within:shadow-[0_0_0_3px_rgba(255,107,0,0.22)] max-[1024px]:max-w-none max-[760px]:order-3 max-[760px]:col-span-full";
export const searchInputClassName =
  "min-w-0 flex-1 pl-[18px] text-sm text-[#1a1c1e]";
export const searchButtonClassName = "!text-[#7a3000]";
export const navClassName =
  "inline-flex items-center gap-[18px] max-[1024px]:hidden";
export function navItemClassName(isActive: boolean) {
  return `inline-flex min-h-11 items-center justify-center border-0 border-b-2 bg-transparent py-2 text-[15px] font-semibold leading-6 no-underline transition-colors duration-150 hover:border-[#7a3000] hover:text-[#7a3000] ${
    isActive
      ? "border-[#7a3000] text-[#7a3000]"
      : "border-transparent text-[#1a1c1e]"
  }`;
}
export const topActionsClassName =
  "inline-flex min-w-0 items-center gap-3 max-[420px]:gap-2";
export const cartLinkClassName = "text-[#7a3000]";
export const avatarButtonClassName = "!p-0.5";
export const avatarClassName =
  "!h-10 !w-10 !border-2 !border-[#ddc1b4] !bg-[linear-gradient(135deg,#7a3000,#ff6b00)] !text-white";
export const accountMenuLinkClassName = "text-inherit no-underline";
export const accountMenuLogoutClassName =
  "flex min-h-11 w-full cursor-pointer items-center gap-4 border-0 bg-transparent px-4 py-2 text-left font-[inherit] text-[#ba1a1a] hover:bg-[rgba(186,26,26,0.08)]";
export const authActionsClassName =
  "inline-flex min-w-0 items-center gap-2 max-[760px]:gap-1.5";
export const loginButtonClassName =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#7a3000] px-4 py-2.5 text-[15px] font-bold text-white no-underline shadow-[0_8px_18px_rgba(122,48,0,0.2)] max-[760px]:min-w-0 max-[760px]:px-2.5 max-[760px]:text-[13px]";
export const registerButtonClassName =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-[#8e7164] px-4 py-2.5 text-[15px] font-bold text-[#7a3000] no-underline max-[760px]:min-w-0 max-[760px]:px-2.5 max-[760px]:text-[13px]";

export const mainClassName =
  "mx-auto flex w-[min(100%,1200px)] flex-col gap-14 px-6 pb-12 pt-8 max-[760px]:gap-[42px] max-[760px]:px-4 max-[760px]:pb-10 max-[760px]:pt-6";
export const heroClassName =
  "relative flex min-h-[400px] items-center overflow-hidden rounded-3xl bg-[#e2e2e5] shadow-[0_12px_28px_rgba(119,87,77,0.16)] max-[760px]:min-h-[320px]";
export const heroMediaClassName =
  "absolute inset-0 after:absolute after:inset-0 after:z-[1] after:bg-[linear-gradient(90deg,rgba(249,249,252,0.94)_0%,rgba(249,249,252,0.76)_42%,rgba(249,249,252,0.16)_100%)] after:content-[''] max-[760px]:after:bg-[linear-gradient(90deg,rgba(249,249,252,0.96),rgba(249,249,252,0.72))]";
export const heroImageClassName =
  "object-cover object-[center_right] max-[760px]:object-center";
export const heroContentClassName =
  "relative z-[2] max-w-[540px] px-16 py-14 max-[760px]:px-6 max-[760px]:py-8 max-[420px]:px-5 max-[420px]:py-7";
export const heroEyebrowClassName =
  "m-0 mb-2 text-[13px] font-bold uppercase text-[#7a3000]";
export const heroTitleClassName =
  "m-0 text-[44px] font-bold leading-[52px] text-[#7a3000] max-[760px]:text-[32px] max-[760px]:leading-10";
export const heroCopyClassName =
  "mb-6 mt-3 text-base font-semibold leading-6 text-[#1a1c1e]";

export const sectionClassName = "scroll-mt-[92px]";
export const sectionHeadingClassName =
  "mb-6 flex items-center justify-between gap-4";
export const sectionTitleClassName =
  "m-0 text-2xl font-bold leading-8 text-[#7a3000]";
export const sectionActionClassName =
  "min-h-10 cursor-pointer rounded-full border-0 bg-transparent px-3 py-2 text-sm font-bold text-[#7a3000] hover:bg-[rgba(122,48,0,0.08)]";
export const categoryGridClassName =
  "grid grid-cols-4 gap-4 max-[760px]:grid-cols-2";
export const categoryCardClassName = `grid min-h-[116px] cursor-pointer place-items-center gap-2.5 rounded-xl border-0 bg-white p-4 font-[inherit] font-medium text-[#1a1c1e] shadow-[0_6px_14px_rgba(119,87,77,0.12)] max-[420px]:min-h-[106px] ${hoverLift}`;
export const categoryIconClassName =
  "grid h-16 w-16 place-items-center rounded-full bg-[#ffd3c6] text-[#7a594f] [&_svg]:text-[34px]";

export const flashHeadingClassName =
  "mb-[18px] flex items-center justify-between gap-4 max-[760px]:mb-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2.5";
export const flashTitleGroupClassName =
  "flex min-w-0 flex-wrap items-center gap-3.5 max-[760px]:gap-2.5";
export const flashCountdownClassName =
  "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[#a04100] px-3 py-[7px] text-sm font-black leading-[18px] text-white shadow-[0_8px_16px_rgba(122,48,0,0.18)] [&_svg]:text-base";
export const flashGridClassName =
  "grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-4";
export const flashCardClassName =
  "group overflow-hidden rounded-xl bg-white shadow-[0_6px_14px_rgba(119,87,77,0.12)] transition-[box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(119,87,77,0.14)]";
export const flashHitareaClassName =
  "grid w-full cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-inherit";
export const flashMediaClassName =
  "relative h-[136px] overflow-hidden bg-[#e2e2e5] max-[760px]:h-[180px]";
export const flashImageClassName =
  "object-cover transition-transform duration-[220ms] group-hover:scale-[1.04]";
export const flashBadgeClassName =
  "absolute left-2.5 top-2.5 inline-flex min-h-5 items-center rounded-full bg-[#7a3000] px-2 py-[3px] text-[11px] font-black leading-[14px] text-white";
export const flashBodyClassName = "grid gap-1.5 px-3.5 pb-3 pt-2.5";
export const flashCardTitleClassName =
  "m-0 text-base font-bold leading-[22px] text-[#1a1c1e]";
export const flashRestaurantNameClassName =
  "-mt-0.5 mb-0 text-xs font-semibold leading-4 text-[#5a4136]";
export const flashPriceRowClassName =
  "flex items-baseline gap-2 [&_span]:text-xs [&_span]:leading-4 [&_span]:text-[#8e7164] [&_span]:line-through [&_strong]:text-lg [&_strong]:font-black [&_strong]:leading-[22px] [&_strong]:text-[#a04100]";
export const flashMeterClassName = "grid gap-[5px]";
export const flashMeterTextClassName =
  "flex items-center justify-between gap-2 text-[11px] font-bold leading-[14px] text-[#5a4136] [&_span:last-child]:text-[#7a3000]";
export const flashProgressClassName =
  "h-[5px] overflow-hidden rounded-full bg-[#eadfd8] [&_span]:block [&_span]:h-full [&_span]:rounded-[inherit] [&_span]:bg-[#7a3000]";
export const flashBuyButtonClassName =
  "mt-1 inline-flex min-h-8 items-center justify-center rounded-md bg-[#7a3000] text-[13px] font-black leading-[18px] text-white group-hover:bg-[#a04100]";

export const restaurantGridClassName =
  "grid grid-cols-4 gap-5 max-[1024px]:grid-cols-2 max-[760px]:grid-cols-1";
export const restaurantCardClassName =
  "group overflow-hidden rounded-xl bg-white text-inherit no-underline shadow-[0_6px_14px_rgba(119,87,77,0.12)] transition-[box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(119,87,77,0.14)]";
export const restaurantCardLinkClassName = "block text-inherit no-underline";
export const cardMediaClassName =
  "relative h-32 overflow-hidden bg-[#e2e2e5]";
export const cardImageClassName =
  "object-cover transition-transform duration-[220ms] group-hover:scale-105";
export const ratingClassName =
  "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-[#a04100] shadow-[0_4px_10px_rgba(119,87,77,0.16)]";
export const restaurantBodyClassName = "px-4 pb-4 pt-3.5";
export const restaurantTitleClassName =
  "m-0 text-base font-medium leading-6 text-[#1a1c1e]";
export const restaurantMetaClassName =
  "mt-1.5 flex items-center gap-1 text-[11px] leading-[14px] text-[#5a4136]";

export const foodGridClassName =
  "grid grid-cols-6 gap-4 max-[1024px]:grid-cols-3 max-[760px]:grid-cols-2";
export const foodCardClassName = `group cursor-pointer ${hoverLift}`;
export const foodMediaClassName =
  "relative aspect-square overflow-hidden rounded-xl bg-[#e2e2e5]";
export const foodTitleClassName =
  "m-0 mt-2 text-center text-xs font-semibold leading-4 text-[#1a1c1e]";

export const foodbotClassName =
  "group fixed bottom-6 right-6 z-[35] grid h-14 w-14 cursor-pointer place-items-center rounded-full border-0 bg-[#7a3000] text-white shadow-[0_14px_26px_rgba(119,87,77,0.28)] transition-[background-color,transform] duration-[180ms] hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#a04100] max-[760px]:bottom-[92px] max-[760px]:right-4";
export const foodbotLabelClassName =
  "pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#2f3133] px-2.5 py-1.5 text-xs font-semibold text-[#f0f0f3] opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100";

export const bottomNavClassName =
  "hidden max-[760px]:fixed max-[760px]:bottom-3 max-[760px]:left-3 max-[760px]:right-3 max-[760px]:z-30 max-[760px]:grid max-[760px]:min-h-16 max-[760px]:grid-cols-3 max-[760px]:gap-1.5 max-[760px]:rounded-3xl max-[760px]:bg-white max-[760px]:p-2 max-[760px]:shadow-[0_14px_28px_rgba(119,87,77,0.2)]";
export function bottomNavButtonClassName(isActive = false) {
  return `grid min-h-12 min-w-0 cursor-pointer place-items-center gap-px rounded-full border-0 bg-transparent font-[inherit] text-[11px] leading-[14px] [&_svg]:text-xl ${
    isActive ? "bg-[#ffd3c6] text-[#7a594f]" : "text-[#5a4136]"
  }`;
}

export const footerClassName =
  "mt-auto border-t border-[rgba(138,114,103,0.12)] bg-[#e8e8ea]";
export const footerInnerClassName =
  "mx-auto flex min-h-[76px] w-[min(100%,1200px)] flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-[18px] max-[760px]:flex-col max-[760px]:justify-center max-[760px]:text-center";
export const footerBrandClassName =
  "shrink-0 text-2xl font-bold leading-8 text-[#7a3000] no-underline";
export const footerCopyClassName =
  "m-0 flex-auto text-center text-sm leading-5 text-[#5a4136]";
export const footerLinksClassName =
  "flex shrink-0 flex-wrap items-center gap-6";
export const footerButtonClassName =
  "cursor-pointer border-0 bg-transparent text-sm leading-5 text-[#5a4136] hover:text-[#7a3000]";

export const beforeShellClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f9fc] text-[#1a1c1e]";
export const beforeHeaderClassName =
  "sticky top-0 z-50 border-b border-[rgba(138,114,103,0.18)] bg-[rgba(249,249,252,0.96)] shadow-[0_4px_14px_rgba(119,87,77,0.12)] backdrop-blur-[14px]";
export const beforeHeaderInnerClassName =
  "mx-auto flex min-h-[68px] w-[min(100%,1200px)] items-center justify-between gap-6 px-6 py-2.5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2.5 max-[760px]:px-4 max-[760px]:pb-3.5 max-[760px]:pt-2.5";
export const beforeBrandGroupClassName =
  "inline-flex min-w-0 items-center gap-6 max-[760px]:w-full max-[760px]:justify-between max-[760px]:gap-3";
export const beforeLocationClassName =
  "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#f3f3f6] px-3 py-[7px] text-[13px] font-bold leading-[18px] text-[#5a4136] max-[420px]:hidden [&_span]:whitespace-nowrap";
export const beforeActionsClassName =
  "inline-flex shrink-0 items-center justify-end gap-3 max-[760px]:w-full max-[420px]:grid max-[420px]:grid-cols-1";
export const beforeLoginLinkClassName =
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full px-[18px] py-[9px] text-sm font-extrabold leading-5 text-[#1a1c1e] no-underline max-[760px]:flex-1";
export const beforeRegisterLinkClassName =
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#7a3000] px-[18px] py-[9px] text-sm font-extrabold leading-5 text-white no-underline shadow-[0_8px_18px_rgba(122,48,0,0.2)] max-[760px]:flex-1";
export const beforeMainClassName =
  "mx-auto flex w-[min(100%,1200px)] flex-1 flex-col gap-[72px] px-6 pb-16 pt-8 max-[1024px]:gap-14 max-[760px]:gap-11 max-[760px]:px-4 max-[760px]:pb-12 max-[760px]:pt-6";
export const beforeHeroClassName =
  "relative flex min-h-[376px] items-center overflow-hidden rounded-xl bg-[#e2e2e5] shadow-[0_16px_32px_rgba(119,87,77,0.18)] max-[760px]:min-h-[324px]";
export const beforeHeroImageClassName =
  "object-cover transition-transform duration-[220ms]";
export const beforeHeroOverlayClassName =
  "absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(249,249,252,0.95)_0%,rgba(249,249,252,0.72)_38%,rgba(249,249,252,0.08)_78%)] max-[760px]:bg-[linear-gradient(90deg,rgba(249,249,252,0.96),rgba(249,249,252,0.7))]";
export const beforeHeroContentClassName =
  "relative z-[2] grid max-w-[520px] gap-3 px-16 py-12 max-[760px]:px-6 max-[760px]:py-8";
export const beforeHeroTitleClassName =
  "m-0 text-[44px] font-extrabold leading-[52px] text-[#7a3000] max-[760px]:text-[34px] max-[760px]:leading-[42px]";
export const beforeHeroCopyClassName =
  "m-0 text-base font-semibold leading-6 text-[#1a1c1e]";
export const beforeHeroActionsClassName =
  "mt-1.5 inline-flex items-center gap-3 max-[420px]:grid max-[420px]:grid-cols-1";
export const beforeSecondaryCtaClassName =
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-[#7a3000] bg-white px-[18px] py-[9px] text-sm font-extrabold leading-5 text-[#7a3000] no-underline max-[420px]:w-full";
export const beforePrimaryCtaClassName =
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#7a3000] px-[18px] py-[9px] text-sm font-extrabold leading-5 text-white no-underline shadow-[0_8px_18px_rgba(122,48,0,0.2)] max-[420px]:w-full";
export const beforeSectionClassName =
  "grid gap-11 max-[760px]:gap-7";
export const beforeSectionHeadingClassName =
  "mx-auto grid max-w-[640px] gap-3 text-center max-[760px]:text-left";
export const beforeSectionTitleClassName =
  "m-0 text-[28px] font-extrabold leading-9 text-[#7a3000]";
export const beforeSectionCopyClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const beforeCategoryGridClassName =
  "grid grid-cols-4 gap-6 max-[1024px]:grid-cols-2 max-[760px]:grid-cols-1";
export const beforeCategoryCardClassName =
  "group grid min-w-0 gap-2.5";
export const beforeCategoryMediaClassName =
  "relative aspect-square overflow-hidden rounded-lg bg-[#e2e2e5] shadow-[0_10px_22px_rgba(119,87,77,0.14)]";
export const beforeCategoryImageClassName =
  "object-cover transition-transform duration-[220ms] group-hover:scale-105";
export const beforeCategoryTitleClassName =
  "m-0 text-[17px] font-extrabold leading-6 text-[#7a3000]";

export const beforePartnerSectionClassName =
  "grid grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)] items-center gap-12 rounded-3xl bg-[#f3f3f6] px-16 py-14 max-[1024px]:grid-cols-2 max-[1024px]:p-10 max-[760px]:grid-cols-1 max-[760px]:gap-7 max-[760px]:px-5 max-[760px]:py-7";
export const beforePartnerCopyClassName = "grid gap-[22px]";
export const beforePartnerListClassName =
  "grid max-w-[480px] grid-cols-2 gap-x-6 gap-y-[18px] max-[760px]:grid-cols-1";
export const beforePartnerCardClassName =
  "inline-flex min-h-[72px] items-center gap-3.5 rounded-lg bg-white px-[18px] py-3.5 shadow-[0_8px_18px_rgba(119,87,77,0.08)] [&_strong]:text-sm [&_strong]:font-bold [&_strong]:leading-5 [&_strong]:text-[#5a4136]";
export const beforePartnerIconClassName =
  "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#ffdbcc] text-[#7a3000]";
export const beforePartnerMediaClassName =
  "grid grid-cols-2 items-center gap-[22px] max-[420px]:grid-cols-1";
export function beforePartnerImageClassName(isOffset: boolean) {
  return `group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e2e2e5] shadow-[0_10px_22px_rgba(119,87,77,0.16)] ${
    isOffset ? "mt-[34px] max-[420px]:mt-0" : ""
  }`;
}

export const beforeFaqSectionClassName = "grid gap-11";
export const beforeFaqHeadingClassName =
  "grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] items-start gap-8 max-[1024px]:grid-cols-1 max-[760px]:gap-5";
export const beforeFaqLargeTitleClassName =
  "m-0 max-w-[360px] text-[40px] font-extrabold leading-[48px] text-[#7a3000] max-[760px]:text-[32px] max-[760px]:leading-10";
export const beforeFaqTabsClassName =
  "flex flex-wrap justify-end gap-x-5 gap-y-3 max-[1024px]:justify-start max-[760px]:gap-2";
export function beforeFaqTabClassName(isActive = false) {
  return `min-h-9 cursor-pointer rounded-full border bg-transparent px-[18px] py-2 font-[inherit] text-[13px] font-bold leading-[18px] ${
    isActive
      ? "border-[#7a3000] bg-[#ffdbcc] text-[#351000]"
      : "border-transparent text-[#5a4136]"
  }`;
}
export const beforeFaqCardClassName =
  "grid grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] gap-9 rounded-[18px] bg-white px-16 pb-12 pt-14 shadow-[0_14px_32px_rgba(119,87,77,0.14)] max-[1024px]:grid-cols-2 max-[1024px]:p-10 max-[760px]:grid-cols-1 max-[760px]:gap-7 max-[760px]:px-5 max-[760px]:py-7";
export const beforeFaqListClassName =
  "grid content-start gap-[18px]";
export function beforeFaqQuestionClassName(isActive = false) {
  return `min-h-12 cursor-pointer rounded-lg border-0 px-5 py-3 text-left font-[inherit] text-lg font-extrabold leading-6 max-[760px]:text-base max-[760px]:leading-[22px] ${
    isActive
      ? "bg-[#7a3000] text-white shadow-[0_8px_18px_rgba(122,48,0,0.2)]"
      : "bg-transparent text-[#1a1c1e]"
  }`;
}
export const beforeWorkflowGridClassName =
  "grid grid-cols-3 gap-[18px] max-[1024px]:grid-cols-1";
export const beforeWorkflowCardClassName =
  "grid justify-items-center gap-3 rounded-xl bg-[#e8e8ea] px-4 py-[22px] text-center [&_svg]:text-[58px] [&_svg]:text-[#7a3000]";
export const beforeWorkflowTitleClassName =
  "m-0 text-lg font-extrabold leading-6 text-[#7a3000]";
export const beforeFaqDescriptionClassName =
  "col-span-full mt-2.5 border-t border-[#ddc1b4] px-[76px] pt-8 text-center text-sm leading-5 text-[#5a4136] max-[760px]:px-0 max-[760px]:pt-6";
export const beforeFoodbotClassName =
  "group fixed bottom-6 right-6 z-[45] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#7a3000] text-white no-underline shadow-[0_14px_28px_rgba(119,87,77,0.28)] max-[760px]:bottom-4 max-[760px]:right-4 [&_svg]:text-[26px]";
export const beforeFoodbotLabelClassName =
  "pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#2f3133] px-2.5 py-[7px] text-xs font-bold leading-4 text-[#f0f0f3] opacity-0 transition-opacity duration-[160ms] group-hover:opacity-100";
export const beforeFooterClassName = "mt-auto bg-[#e2e2e5]";
export const beforeFooterInnerClassName =
  "mx-auto grid min-h-[78px] w-[min(100%,1200px)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-6 py-[18px] max-[1024px]:grid-cols-1 max-[1024px]:justify-items-center max-[1024px]:text-center";
export const beforeFooterBrandClassName =
  "text-[22px] font-extrabold leading-7 text-[#7a3000] no-underline";
export const beforeFooterNavClassName =
  "flex flex-wrap justify-center gap-[18px]";
export const beforeFooterButtonClassName =
  "cursor-pointer border-0 bg-transparent text-xs leading-4 text-[#5a4136]";
export const beforeFooterCopyClassName =
  "m-0 text-xs leading-4 text-[#5a4136]";

export { brandText, mutedText, primaryText };
