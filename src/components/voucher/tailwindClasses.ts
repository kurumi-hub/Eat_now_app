import type { PromoTone, VoucherStatus, VoucherTone } from "./voucherData";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const toneText: Record<VoucherTone | PromoTone, string> = {
  primary: "text-[#D94720]",
  info: "text-[#005F9D]",
  disabled: "text-[#9E9E9E]",
  muted: "text-[#9E9E9E]",
};

const toneBackground: Record<VoucherTone | PromoTone, string> = {
  primary: "bg-[#FFF0E6]",
  info: "bg-[#E6F3FF]",
  disabled: "bg-[#eeeef0]",
  muted: "bg-[#eeeef0]",
};

export const voucherPageClassName =
  "flex min-h-screen flex-col bg-[#fff8f4] font-sans text-[#1a1c1e]";

export const voucherMainClassName =
  "mx-auto w-full max-w-[1200px] flex-1 px-4 py-8";

export const voucherHeroClassName =
  "relative mb-8 flex min-h-[240px] items-center justify-between overflow-hidden rounded-[24px] bg-[#FFEAE0] max-[640px]:min-h-[210px]";

export const voucherHeroContentClassName =
  "relative z-[2] flex-1 p-12 max-[640px]:p-7 [&_h1]:mb-4 [&_h1]:text-[2.5rem] [&_h1]:font-bold [&_h1]:text-[#7a3000] max-[640px]:[&_h1]:text-4xl [&_p]:text-lg [&_p]:text-[#5a4136] max-[640px]:[&_p]:text-base";

export const voucherHeroVisualClassName =
  "absolute right-0 top-0 h-full w-2/5 bg-[linear-gradient(135deg,transparent_0%,rgba(255,107,0,0.1)_100%)]";

export const voucherToolbarClassName = "mb-10";

export const voucherSearchBarClassName =
  "mb-6 flex items-center rounded-xl border border-[#ddc1b4] bg-white px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-[640px]:flex-wrap max-[640px]:gap-3";

export const voucherSearchIconClassName = "mr-3 text-[#8e7164]";

export const voucherSearchInputClassName =
  "min-w-0 flex-1 border-0 bg-transparent text-base text-[#1a1c1e] outline-none placeholder:text-[#8e7164] max-[640px]:basis-[calc(100%-44px)]";

export const voucherApplyButtonClassName =
  "cursor-pointer rounded-lg border-0 bg-[#7a3000] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#a04100] max-[640px]:w-full";

export const voucherFiltersClassName = "flex flex-wrap gap-3";

export function voucherFilterChipClassName(isActive = false) {
  return cx(
    "cursor-pointer rounded-full border border-[#ddc1b4] bg-transparent px-4 py-2 font-medium text-[#5a4136] transition-all hover:border-[#8e7164] data-[active=true]:border-[#7a3000] data-[active=true]:bg-[#7a3000] data-[active=true]:text-white",
    isActive && "border-[#7a3000] bg-[#7a3000] text-white"
  );
}

export const voucherSectionClassName =
  "mb-12 [&>h2]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#1a1c1e]";

export const voucherSectionHeaderClassName =
  "mb-6 flex items-center justify-between gap-4 [&_h2]:mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1a1c1e]";

export const voucherSeeAllButtonClassName =
  "cursor-pointer border-0 bg-transparent font-semibold text-[#7a3000]";

export const voucherGridClassName =
  "grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1";

export function voucherCardClassName(isInactive = false) {
  return cx(
    "relative flex overflow-hidden rounded-xl border border-[#eeeef0] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] before:absolute before:left-[-10px] before:top-1/2 before:z-10 before:h-5 before:w-5 before:-translate-y-1/2 before:rounded-full before:bg-[#fff8f4] before:content-[''] after:absolute after:left-[110px] after:top-1/2 after:z-10 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-[#fff8f4] after:content-[''] data-[status=used]:opacity-70 data-[status=expired]:opacity-70 max-[640px]:min-h-[190px]",
    isInactive && "opacity-70"
  );
}

export function voucherCardLeftClassName(tone: VoucherTone) {
  return cx(
    "flex w-[120px] shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-[#ddc1b4] p-4 text-center",
    toneBackground[tone]
  );
}

export function voucherIconToneClassName(tone: VoucherTone | PromoTone) {
  return cx("flex items-center justify-center [&_svg]:h-9 [&_svg]:w-9", toneText[tone]);
}

export function voucherIconBackgroundClassName(tone: VoucherTone | PromoTone) {
  return toneBackground[tone];
}

export function voucherCodeClassName(tone: VoucherTone) {
  return cx("break-all text-sm font-bold", toneText[tone]);
}

export const voucherCardRightClassName =
  "relative flex flex-1 flex-col px-5 py-4";

export const voucherCardInfoClassName = "mb-3 flex-1";

export function voucherCardTitleClassName(status: VoucherStatus) {
  return cx(
    "mb-1 mt-0 text-lg font-bold text-[#1a1c1e] data-[status=expired]:text-[#8e7164] data-[status=expired]:line-through",
    status === "expired" && "text-[#8e7164] line-through"
  );
}

export function voucherCardDescriptionClassName(isInactive = false) {
  return cx(
    "m-0 text-sm text-[#5a4136]",
    isInactive && "text-[#8e7164]"
  );
}

export const voucherCardFooterClassName =
  "mt-auto flex items-center justify-between gap-3";

export function voucherCardExpiryClassName(isUrgent = false) {
  return cx(
    "text-xs text-[#8e7164] data-[urgent=true]:font-semibold data-[urgent=true]:text-[#ba1a1a]",
    isUrgent && "font-semibold text-[#ba1a1a]"
  );
}

export const voucherCardUseButtonClassName =
  "cursor-pointer rounded-md border-0 bg-[#7a3000] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#a04100]";

export function voucherBadgeClassName(status: VoucherStatus) {
  return cx(
    "absolute right-3 top-3 rounded px-2 py-1 text-xs font-semibold",
    status === "used" && "bg-[#f9f9fc] text-[#5a4136]",
    status === "expired" && "bg-[#ffdad6] text-[#ba1a1a]"
  );
}

export const voucherEmptyStateClassName =
  "col-span-full px-12 py-12 text-center text-[#8e7164]";

export const voucherEmptyIconClassName =
  "mx-auto mb-4 block opacity-50 [&_svg]:h-12 [&_svg]:w-12";

export const voucherPromoGridClassName =
  "grid grid-cols-4 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1";

export const voucherPromoCardClassName =
  "flex flex-col overflow-hidden rounded-2xl border border-[#eeeef0] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]";

export function voucherPromoHeaderClassName(tone: PromoTone) {
  return cx(
    "relative flex h-[120px] items-center justify-center overflow-hidden",
    toneBackground[tone]
  );
}

export function voucherPromoIconClassName(tone: PromoTone) {
  return cx(
    "absolute -bottom-5 -right-5 flex rotate-[-15deg] opacity-20 [&_svg]:h-[100px] [&_svg]:w-[100px]",
    toneText[tone]
  );
}

export function voucherPromoLabelClassName(tone: PromoTone) {
  return cx("relative z-[1] text-2xl font-extrabold", toneText[tone]);
}

export const voucherPromoBodyClassName =
  "flex flex-1 flex-col p-5 [&_h3]:mb-2 [&_h3]:mt-0 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#1a1c1e] [&_p]:mb-5 [&_p]:mt-0 [&_p]:text-sm [&_p]:text-[#5a4136]";

export function voucherPromoCtaClassName(isAvailable = true) {
  return cx(
    "mt-auto w-full cursor-pointer rounded-lg border-0 bg-[#7a3000] p-2.5 font-semibold text-white hover:bg-[#a04100] disabled:cursor-not-allowed disabled:bg-[#eeeef0] disabled:text-[#8e7164] data-[available=false]:cursor-not-allowed data-[available=false]:bg-[#eeeef0] data-[available=false]:text-[#8e7164]",
    !isAvailable && "cursor-not-allowed bg-[#eeeef0] text-[#8e7164] hover:bg-[#eeeef0]"
  );
}
