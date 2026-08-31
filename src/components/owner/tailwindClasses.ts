import type { OwnerMetric, OwnerOrder } from "@/components/owner/ownerFlowData";

type OwnerTone = NonNullable<OwnerMetric["tone"]> | "neutral";
type OwnerOrderTone = OwnerOrder["statusTone"];

export function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ownerCardBaseClassName =
  "border border-[rgba(221,193,180,0.55)] bg-white shadow-[0_4px_12px_rgba(119,87,77,0.08)]";

const ownerInlineButtonBaseClassName =
  "inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 font-extrabold";

export function shellClassName(isMenuOpen: boolean) {
  return joinClasses("min-h-screen bg-[#f9f9fc] text-[#1a1c1e]", isMenuOpen && "overflow-hidden");
}

export const sidebarClassName =
  "fixed inset-y-0 left-0 z-[80] flex min-h-screen w-[240px] flex-col gap-[18px] border-r border-[#ddc1b4] bg-white px-3.5 pb-4 pt-6 shadow-[12px_0_24px_rgba(119,87,77,0.04)] max-lg:-translate-x-[105%] max-lg:transition-transform max-lg:duration-200 data-[menu-open=true]:translate-x-0";

export const sidebarBrandClassName = "flex items-center gap-2.5 px-2.5 pb-[18px]";
export const sidebarBrandIconClassName = "text-[30px] text-[#7a3000]";
export const sidebarBrandTitleClassName = "m-0 text-[15px] font-extrabold leading-[1.1] text-[#7a3000]";
export const sidebarBrandSubtitleClassName = "text-[11px] leading-[1.2] text-[#5a4136]";
export const sidebarNavClassName = "flex flex-1 flex-col gap-1.5";
export const sidebarBottomClassName = "flex flex-col gap-2.5 border-t border-[#ddc1b4] pt-4";
export const sidebarIconClassName = "flex-none text-current";
export const sidebarBadgeClassName =
  "ml-auto min-w-[22px] rounded-full bg-[#ba1a1a] text-center text-[11px] font-extrabold leading-[18px] text-white";
export const sidebarCtaClassName =
  "inline-flex min-h-[34px] items-center justify-center gap-2 rounded-[7px] bg-[#923900] px-3.5 py-2 font-extrabold text-white shadow-[0_4px_12px_rgba(119,87,77,0.08)]";
export const sidebarProfileClassName = "flex items-center gap-[9px] px-2 pt-1";
export const sidebarAvatarClassName =
  "grid size-[30px] place-items-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#fff1ec,#e7bdb1)] text-[11px] font-extrabold text-[#7a3000] shadow-[0_0_0_1px_rgba(221,193,180,0.55)]";
export const sidebarProfileNameClassName = "m-0 text-[13px] leading-[1.15] text-[#1a1c1e]";
export const sidebarProfileIdClassName = "text-[10px] text-[#5a4136]";
export function backdropClassName(isMenuOpen: boolean) {
  return joinClasses(
    "fixed inset-0 z-[70] border-0 bg-[rgba(26,28,30,0.36)] lg:hidden",
    isMenuOpen ? "block" : "hidden"
  );
}
export const mobileBarClassName =
  "fixed inset-x-0 top-0 z-[60] hidden h-16 items-center justify-between border-b border-[rgba(221,193,180,0.55)] bg-white px-4 max-lg:flex";
export const mobileIconButtonClassName =
  "inline-grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-white text-[#5a4136]";
export const mobileBrandTitleClassName = "m-0 font-extrabold text-[#7a3000]";
export const mobileBrandSubtitleClassName = "m-0 text-xs text-[#5a4136]";
export const mobileBadgeClassName =
  "grid h-6 min-w-6 place-items-center rounded-full bg-[#ba1a1a] font-extrabold text-white";
export const mainClassName = "min-h-screen bg-[#f9f9fc] lg:ml-[240px] max-lg:pb-[74px] max-lg:pt-16";
export const bottomNavClassName =
  "fixed inset-x-0 bottom-0 z-[60] hidden grid-cols-4 gap-1 rounded-t-[18px] border-t border-[rgba(221,193,180,0.55)] bg-white px-2.5 pb-2.5 pt-2 shadow-[0_-8px_24px_rgba(119,87,77,0.1)] max-lg:grid";

export function sidebarLinkClassName(active: boolean) {
  return joinClasses(
    "flex min-h-[38px] items-center gap-4 rounded-[7px] px-[13px] py-2 text-sm font-medium text-[#5a4136] transition-colors duration-150 hover:bg-[#f3f3f6] hover:text-[#7a3000]",
    active && "bg-[#ffd3c6] font-extrabold text-[#7a594f] hover:bg-[#ffd3c6]"
  );
}

export function bottomNavLinkClassName(active: boolean) {
  return joinClasses(
    "grid place-items-center gap-[3px] rounded-[14px] px-0.5 py-1.5 text-[11px] font-bold text-[#5a4136]",
    active && "bg-[#ffd3c6] text-[#7a594f]"
  );
}

export const pageClassName =
  "mx-auto w-full max-w-[1280px] px-8 pb-12 pt-[34px] max-lg:px-4 max-lg:py-6 max-lg:pb-8";
export const reviewsPageClassName =
  "mx-auto w-full max-w-none px-8 pb-12 pt-0 max-lg:px-4 max-lg:py-6 max-lg:pb-8";
export const settingsPageClassName = "mx-auto w-full max-w-none p-0";
export const pageHeaderClassName =
  "mb-7 flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch [&_h1]:m-0 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-[1.12] [&_h1]:text-[#1a1c1e] [&_p]:mt-2 [&_p]:text-base [&_p]:text-[#5a4136] max-lg:[&_h1]:text-[28px]";
export const splitPageHeaderClassName =
  "mb-7 flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-stretch [&_h1]:m-0 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-[1.12] [&_h1]:text-[#1a1c1e] [&_p]:mt-2 [&_p]:text-base [&_p]:text-[#5a4136] max-lg:[&_h1]:text-[28px]";
export const headingClassName = "m-0 text-4xl font-extrabold leading-[1.12] text-[#1a1c1e] max-lg:text-[28px]";
export const accentHeadingClassName =
  "m-0 text-4xl font-extrabold leading-[1.12] text-[#7a3000] max-lg:text-[28px]";
export const descriptionClassName = "mt-2 text-base text-[#5a4136]";
export const headerActionsClassName = "flex items-center gap-3.5 max-lg:items-stretch";
export const roundButtonClassName =
  "inline-grid size-[46px] cursor-pointer place-items-center rounded-full border-0 bg-white text-[#5a4136] shadow-[0_4px_12px_rgba(119,87,77,0.08)]";

export function cardClassName(extra?: string) {
  return joinClasses(ownerCardBaseClassName, "rounded-xl", extra);
}

export const cardHeaderClassName =
  "flex items-center justify-between gap-4 border-b border-[rgba(221,193,180,0.35)] p-6 [&_a]:border-0 [&_a]:bg-transparent [&_a]:font-bold [&_a]:text-[#7a3000] [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[#7a3000] [&_h2]:m-0 [&_h2]:text-[27px] [&_h2]:font-extrabold [&_h2]:text-[#1a1c1e]";
export const cardHeaderTitleClassName = "m-0 text-[27px] font-extrabold text-[#1a1c1e]";
export const cardHeaderAccentTitleClassName = "m-0 text-xl font-extrabold text-[#7a3000]";
export const cardHeaderActionClassName = "border-0 bg-transparent font-bold text-[#7a3000]";

export const metricGridClassName =
  "mb-7 grid grid-cols-4 gap-[18px] max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1";

export function metricCardClassName(_tone: OwnerTone) {
  void _tone;
  return cardClassName(
    "min-h-28 p-5 [&_span]:block [&_span]:text-[15px] [&_span]:text-[#5a4136] [&_strong]:mt-2 [&_strong]:block [&_strong]:text-[28px] [&_strong]:font-extrabold [&_strong]:leading-[1.05]"
  );
}

export const metricLabelClassName = "block text-[15px] text-[#5a4136]";

export function metricValueClassName(tone: OwnerTone) {
  return joinClasses("mt-2 block text-[28px] font-extrabold leading-[1.05] text-[#1a1c1e]", tone === "primary" && "text-[#7a3000]");
}

export function metricNoteClassName(tone: OwnerTone) {
  return joinClasses("mt-3.5 flex items-center gap-[5px] text-[13px] text-[#5a4136] [&_svg]:text-base", (tone === "success" || tone === "primary") && "text-[#27865c]");
}

export const dashboardGridClassName = "grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-7 max-[1180px]:grid-cols-1";
export const dashboardPanelClassName = cardClassName("min-h-[520px] overflow-hidden");
export const stackedListClassName = "flex flex-col gap-3.5 p-4";

export function dashboardOrderClassName(isHighlighted: boolean) {
  return joinClasses(
    "flex items-center justify-between gap-4 rounded-[10px] bg-white p-4 shadow-[0_4px_12px_rgba(119,87,77,0.05)] max-[640px]:flex-col max-[640px]:items-stretch [&_strong]:block [&_strong]:text-lg [&_strong]:text-[#1a1c1e] [&_p]:mt-1 [&_p]:text-[#5a4136]",
    isHighlighted ? "border-2 border-[#ff6b00]" : "border border-[rgba(221,193,180,0.45)]"
  );
}

export const dashboardOrderIdentityClassName = "flex items-center gap-4 max-[640px]:items-start";

export function dashboardOrderNumberClassName(isHighlighted: boolean) {
  return joinClasses(
    "grid size-[58px] place-items-center rounded-[9px] text-2xl font-extrabold",
    isHighlighted ? "bg-[#ff6b00] text-white" : "bg-[#e2e2e5] text-[#5a4136]"
  );
}

export const itemTitleClassName = "block text-lg font-bold text-[#1a1c1e]";
export const mutedParagraphClassName = "mt-1 text-[#5a4136]";
export const dashboardOrderStatusClassName = "flex flex-col items-end gap-1.5 max-[640px]:items-start";

export function statusChipClassName(tone: OwnerOrderTone) {
  const toneClassNames: Record<OwnerOrderTone, string> = {
    new: "bg-[#ffb693] text-[#7a3000]",
    preparing: "bg-[#bfdbff] text-[#0062a1]",
    pickup: "bg-[#ffdbd0] text-[#7a594f]",
    done: "bg-[#d8f3e5] text-[#27865c]",
  };

  return joinClasses(
    "inline-flex items-center rounded-full border-0 px-2.5 py-[7px] text-[11px] font-extrabold uppercase leading-none text-[#5a4136]",
    toneClassNames[tone]
  );
}

export const popularItemClassName = "grid grid-cols-[80px_1fr] items-center gap-4";
export const popularImageWrapClassName = "relative size-20 overflow-hidden rounded-lg";
export const imageFillClassName = "h-full w-full object-cover";
export const popularRankClassName = "absolute left-0 top-0 bg-[#7a3000] px-[7px] py-1 text-[11px] font-extrabold text-white";

export const liveControlClassName = "relative flex-none";
export const livePillBaseClassName =
  "inline-flex cursor-pointer items-center gap-[9px] rounded-full border border-[#ddc1b4] bg-white px-4 py-[9px] text-sm font-extrabold text-[#1a1c1e] transition duration-150 hover:-translate-y-px hover:border-[rgba(122,48,0,0.45)] hover:shadow-[0_8px_18px_rgba(122,48,0,0.14)] aria-expanded:-translate-y-px aria-expanded:border-[rgba(122,48,0,0.45)] aria-expanded:shadow-[0_8px_18px_rgba(122,48,0,0.14)] [&_svg]:text-lg [&_svg]:text-[#5a4136]";

export function liveLightClassName(status: "open" | "paused") {
  return joinClasses(
    "relative inline-block size-5 flex-none rounded-full before:absolute before:in-1 before:z-[1] before:rounded-[inherit] before:bg-current after:absolute after:inset-0 after:rounded-[inherit] after:bg-current after:opacity-[0.34]",
    status === "open"
      ? "text-[#7a3000] after:animate-[ownerLiveGlow_1.6s_ease-in-out_infinite]"
      : "text-[#8a7267]"
  );
}

export const liveMenuClassName =
  "absolute right-0 top-[calc(100%+8px)] z-30 min-w-[212px] overflow-hidden rounded-[14px] border border-[rgba(221,193,180,0.55)] bg-white p-1.5 shadow-[0_12px_24px_rgba(119,87,77,0.08)]";

export function liveMenuItemClassName(selected: boolean) {
  return joinClasses(
    "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent p-2.5 text-left text-[#1a1c1e] hover:bg-[#fff0eb]",
    selected && "bg-[#fff0eb]"
  );
}

export function liveMenuLightClassName(status: "open" | "paused") {
  return joinClasses(
    "size-3.5 flex-none rounded-full",
    status === "open"
      ? "bg-[#7a3000] shadow-[0_0_0_5px_rgba(220,167,131,0.45)]"
      : "bg-[#8a7267] shadow-[0_0_0_5px_rgba(138,114,103,0.18)]"
  );
}

export const liveMenuTextTitleClassName = "block text-[13px] leading-[18px]";
export const liveMenuTextDescriptionClassName = "block text-[11px] leading-4 text-[#5a4136]";

export const ordersPageClassName = "min-h-screen bg-[#f9f9fc]";
export const stickyHeaderClassName =
  "sticky top-0 z-20 flex items-center justify-between gap-3.5 border-b border-[rgba(221,193,180,0.45)] bg-white px-7 py-5 max-lg:static max-lg:flex-col max-lg:items-stretch max-lg:bg-[#f9f9fc] max-lg:px-4 max-lg:py-[18px] [&_h1]:m-0 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-[1.12] [&_h1]:text-[#1a1c1e] [&_p]:mt-2 [&_p]:text-base [&_p]:text-[#5a4136] max-lg:[&_h1]:text-[28px]";
export const toolbarClassName = "flex items-center gap-3.5 max-lg:items-stretch";
export const searchFieldClassName =
  "flex min-h-11 items-center gap-2.5 rounded-[13px] border border-transparent bg-[#eeeeef] px-3.5 text-[#5a4136] focus-within:border-[#7a3000] focus-within:bg-white [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-[#1a1c1e] [&_input]:outline-0";
export const toolbarSearchFieldClassName = joinClasses(searchFieldClassName, "w-80 max-lg:w-full");
export const menuSearchFieldClassName = joinClasses(searchFieldClassName, "min-h-[54px] border-[#ddc1b4] bg-[#f9f9fc] [&_input]:w-full");
export const reviewSearchFieldClassName = joinClasses(searchFieldClassName, "w-full max-w-[560px] rounded-full border-[#ddc1b4] bg-[#f9f9fc] [&_input]:w-full");
export const settingsSearchFieldClassName = joinClasses(searchFieldClassName, "w-[280px] max-lg:w-full");
export const filterButtonClassName =
  "relative inline-grid size-12 cursor-pointer place-items-center rounded-full border border-[#ddc1b4] bg-white text-[#5a4136]";
export const filterButtonDotClassName = "absolute right-2 top-2 size-[9px] rounded-full bg-[#ff6b00]";
export const ordersShellClassName = "grid min-h-[calc(100vh-94px)] grid-cols-[minmax(0,1fr)_374px] max-[1180px]:grid-cols-1";
export const ordersListPaneClassName = "overflow-hidden border-r border-[rgba(221,193,180,0.45)] bg-[#f9f9fc]";
export const tabsClassName = "flex gap-2.5 max-[640px]:overflow-x-auto";
export const tabListClassName =
  "flex gap-2.5 max-[640px]:overflow-x-auto [&_button]:inline-flex [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-full [&_button]:border [&_button]:border-[#ddc1b4] [&_button]:bg-white [&_button]:px-[18px] [&_button]:py-[9px] [&_button]:font-bold [&_button]:text-[#1a1c1e]";
export const scrollTabsClassName = joinClasses(
  tabListClassName,
  "overflow-x-auto whitespace-nowrap px-7 pb-2.5 pt-[18px] max-lg:px-4"
);

export function tabButtonClassName(active: boolean, review = false) {
  return joinClasses(
    "inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[#ddc1b4] bg-white px-[18px] py-[9px] font-bold text-[#1a1c1e]",
    active && (review ? "bg-[#ffd3c6] text-[#7a594f]" : "border-transparent bg-[#ff6b00] text-white")
  );
}

export const tabBadgeClassName =
  "inline-grid size-[22px] place-items-center rounded-full bg-white text-xs text-[#7a3000]";
export const filterTagsClassName = "flex items-center gap-2.5 px-7 pb-5 pt-2 text-[#5a4136] max-lg:px-4";
export const filterTagClassName = "rounded-full bg-[#ffd3c6] px-[11px] py-1.5 text-[#7a594f]";
export const ordersListClassName = "flex flex-col gap-[18px] px-7 pb-10 pt-6 max-lg:px-4";

export function orderCardClassName(selected?: boolean) {
  return joinClasses(
    "rounded-2xl bg-white p-5 shadow-[0_12px_24px_rgba(119,87,77,0.08)]",
    selected ? "border-2 border-[#ff6b00]" : "border border-transparent"
  );
}

export const orderCardTopClassName =
  "flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2.5";
export const orderCardTopInnerClassName = "flex items-center gap-2.5";
export const orderCardTitleClassName = "text-[22px] text-[#1a1c1e]";
export const orderTimeClassName = "inline-flex items-center gap-[5px] text-[13px] text-[#5a4136] [&_svg]:text-base";
export const orderCardMainClassName =
  "mt-[22px] flex items-center gap-3.5 border-b border-[rgba(221,193,180,0.45)] pb-[18px] max-[640px]:flex-col max-[640px]:items-stretch";
export const letterAvatarClassName =
  "grid size-11 place-items-center rounded-full bg-[#eeeeef] text-lg font-extrabold text-[#5a4136]";
export const orderMetaClassName = "mt-[3px] text-[#5a4136]";
export const orderMoneyClassName = "ml-auto text-right max-[640px]:ml-0 max-[640px]:w-full max-[640px]:text-left";
export const orderMoneyValueClassName = "block text-2xl font-bold text-[#1a1c1e]";
export const orderPaymentStatusClassName = "text-[13px] font-bold text-[#ba1a1a]";
export const orderCardActionsClassName =
  "mt-4 flex items-center gap-2.5 max-[640px]:flex-col max-[640px]:items-stretch [&_button]:min-h-[42px] [&_button]:flex-1 [&_button]:cursor-pointer [&_button]:rounded-lg [&_button]:font-extrabold [&_button:first-child]:border-0 [&_button:first-child]:bg-[#923900] [&_button:first-child]:text-white [&_button:last-child]:border [&_button:last-child]:border-[#ddc1b4] [&_button:last-child]:bg-white [&_button:last-child]:text-[#5a4136]";
export const orderPrimaryActionClassName =
  "min-h-[42px] flex-1 cursor-pointer rounded-lg border-0 bg-[#923900] font-extrabold text-white";
export const orderSecondaryActionClassName =
  "min-h-[42px] flex-1 cursor-pointer rounded-lg border border-[#ddc1b4] bg-white font-extrabold text-[#5a4136]";
export const orderWideActionClassName =
  "mt-4 inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#ddc1b4] bg-white font-extrabold text-[#5a4136]";
export const orderDriverClassName =
  "mt-4 flex items-center justify-between text-[13px] text-[#5a4136]";
export const orderDetailPaneClassName =
  "sticky top-0 flex h-screen flex-col gap-[22px] overflow-y-auto bg-white px-6 pb-[118px] pt-[26px] max-[1180px]:static max-[1180px]:h-auto max-lg:px-4 max-lg:pb-12 max-lg:pt-[22px]";
export const orderDetailHeadlineClassName = "flex items-center justify-between";
export const orderDetailHeadlineInnerClassName = "flex items-center gap-2.5";
export const orderDetailMetaClassName = "-mt-3 text-[13px] text-[#5a4136]";
export const detailCardClassName = "rounded-[18px] border border-[rgba(221,193,180,0.55)] bg-[#f9f9fc] p-5";
export const overlineLabelClassName = "block text-[13px] font-extrabold uppercase tracking-[0.05em] text-[#5a4136]";
export const customerRowClassName = "my-4 flex items-center gap-3.5";
export const customerNameClassName = "text-xl font-bold";
export const customerPhoneClassName = "mt-[3px] inline-flex items-center gap-1.5 text-[#5a4136] [&_svg]:text-base";
export const customerAddressClassName = "flex gap-[9px] border-t border-[rgba(221,193,180,0.45)] pt-4 leading-6 text-[#5a4136]";
export const detailSectionClassName = "space-y-3.5";
export const detailSectionTitleClassName = "mb-3.5 text-[13px] font-extrabold uppercase tracking-[0.05em] text-[#5a4136]";
export const orderItemsClassName = "overflow-hidden rounded-2xl border border-[#ddc1b4]";
export const orderItemRowClassName = "flex items-start gap-3 border-t border-[rgba(221,193,180,0.45)] p-4 first:border-t-0";
export const orderItemQuantityClassName = "rounded-[7px] bg-[#ffd3c6] px-[9px] py-[7px] text-lg font-extrabold text-[#ff6b00]";
export const orderItemNoteClassName = "mt-1.5 text-[13px] leading-[1.4] text-[#5a4136]";
export const orderItemPriceClassName = "ml-auto";
export const noteCardClassName = "rounded-2xl border border-[#ffcf5a] bg-[#fff8df] p-[18px] text-[#7a3000]";
export const noteTextClassName = "mt-2.5 italic leading-6 text-[#1a1c1e]";
export const totalCardClassName =
  "rounded-2xl bg-[#f3f3f6] p-[18px] [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:py-1.5 [&>div]:text-[#5a4136] [&>div:last-child]:mt-2 [&>div:last-child]:border-t [&>div:last-child]:border-[rgba(221,193,180,0.55)] [&>div:last-child]:text-lg [&>div:last-child]:font-extrabold [&>div:last-child]:text-[#1a1c1e]";
export const totalRowClassName = "flex items-center justify-between py-1.5 text-[#5a4136]";
export const totalFinalRowClassName = "mt-2 flex items-center justify-between border-t border-[rgba(221,193,180,0.55)] py-1.5 text-lg font-extrabold text-[#1a1c1e]";
export const stickyActionsClassName =
  "fixed bottom-0 right-0 flex w-[374px] items-center gap-3 border-t border-[rgba(221,193,180,0.55)] bg-white px-6 py-[18px] shadow-[0_-8px_24px_rgba(119,87,77,0.08)] max-[1180px]:sticky max-[1180px]:right-auto max-[1180px]:bottom-0 max-[1180px]:mx-[-24px] max-[1180px]:mb-[-118px] max-[1180px]:w-auto max-[640px]:mb-[-48px] [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:rounded-lg [&_button]:font-extrabold [&_button:first-child]:w-[78px] [&_button:first-child]:border [&_button:first-child]:border-[#ddc1b4] [&_button:first-child]:bg-white [&_button:first-child]:text-[#5a4136] [&_button:last-child]:inline-flex [&_button:last-child]:flex-1 [&_button:last-child]:items-center [&_button:last-child]:justify-center [&_button:last-child]:gap-2 [&_button:last-child]:border-0 [&_button:last-child]:bg-[#923900] [&_button:last-child]:text-white";
export const stickyRejectButtonClassName = "min-h-[42px] w-[78px] cursor-pointer rounded-lg border border-[#ddc1b4] bg-white font-extrabold text-[#5a4136]";
export const stickyAcceptButtonClassName = "inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#923900] font-extrabold text-white";

export const primaryPillButtonClassName =
  "inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#923900] px-7 py-2 font-extrabold text-lg text-white shadow-[0_4px_12px_rgba(119,87,77,0.08)] max-[640px]:w-full";
export const menuToolbarClassName = cardClassName("mb-7 grid grid-cols-[1fr_auto] items-center gap-[18px] p-[18px] max-lg:flex max-lg:flex-col max-lg:items-stretch");
export const menuLayoutClassName = "grid grid-cols-[280px_minmax(0,1fr)] gap-7 max-lg:flex max-lg:flex-col";
export const menuCategoriesClassName = cardClassName("self-start p-6");
export const rowBetweenClassName =
  "flex items-center justify-between gap-3.5 [&_button]:inline-grid [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#7a3000]";
export const menuSectionTitleClassName = "m-0 text-2xl font-extrabold text-[#1a1c1e]";
export const transparentIconButtonClassName = "inline-grid cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#7a3000]";
export const categoryListClassName = "mt-5 flex flex-col gap-2.5";

export function categoryButtonClassName(active?: boolean) {
  return joinClasses(
    "flex w-full cursor-pointer items-center justify-between gap-3.5 rounded-[9px] border border-transparent bg-transparent px-3 py-[13px] text-left text-[#1a1c1e]",
    active && "border-[#ddc1b4] bg-[#ffd3c6] font-extrabold text-[#7a594f]"
  );
}

export const categoryLabelClassName = "inline-flex items-center gap-3";
export const categoryCountClassName = "rounded-full bg-[#e2e2e5] px-[9px] py-1 text-[#5a4136]";
export const menuItemsClassName = "flex flex-col gap-[18px]";

export function menuItemCardClassName(isAvailable: boolean) {
  return cardClassName(joinClasses("grid grid-cols-[150px_1fr] gap-[22px] p-5 max-lg:grid-cols-1", !isAvailable && "opacity-[0.58]"));
}

export const menuItemImageClassName = "h-[150px] w-full rounded-[9px] object-cover max-lg:h-[190px]";
export const menuItemContentClassName = "min-w-0";
export const menuItemTopClassName = "flex items-center justify-between gap-3.5 max-[640px]:flex-col max-[640px]:items-stretch";
export const menuItemNameClassName = "mt-2 text-2xl font-extrabold leading-[1.15]";
export const menuItemPriceClassName = "text-2xl font-extrabold text-[#7a3000]";
export const menuItemDescriptionClassName =
  "my-3 mb-6 line-clamp-2 overflow-hidden text-[#5a4136]";
export const hotBadgeClassName =
  "inline-flex items-center gap-1 rounded-full bg-[#ff6b00] px-3 py-[5px] text-[11px] font-extrabold text-white";
export const menuItemFooterClassName =
  "flex items-center justify-between gap-3.5 max-[640px]:flex-col max-[640px]:items-stretch [&_button]:inline-grid [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#7a3000]";
export const switchLabelClassName = "inline-flex cursor-pointer items-center gap-2.5 text-sm font-extrabold text-[#7a3000]";
export const switchInputClassName = "peer sr-only";
export const switchTrackClassName =
  "relative h-[26px] w-11 rounded-full border border-[#ddc1b4] bg-[#f6f6f7] after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-[0_1px_4px_rgba(119,87,77,0.2)] after:transition-transform peer-checked:bg-[#923900] peer-checked:after:translate-x-[18px]";
export const iconButtonGroupClassName = "flex items-center gap-2";

export const addDishPageClassName =
  "relative grid min-h-screen place-items-center overflow-hidden px-6 py-12 before:absolute before:inset-0 before:z-0 before:bg-[rgba(26,28,30,0.38)] before:backdrop-blur-lg max-lg:p-4";
export const addDishBackgroundClassName =
  "absolute inset-x-10 inset-y-[72px] grid grid-cols-3 gap-[18px] opacity-25 blur-sm";
export const addDishFakeCardClassName = "h-[180px] rounded-[18px] bg-white shadow-[0_12px_24px_rgba(119,87,77,0.08)]";
export const addDishModalClassName =
  "relative z-[1] flex w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_48px_rgba(119,87,77,0.18)] max-h-[calc(100vh-72px)] max-lg:max-h-[calc(100vh-110px)]";
export const addDishModalHeaderClassName = "flex items-center justify-between border-b border-[rgba(221,193,180,0.45)] px-6 py-[22px] max-[640px]:px-4";
export const addDishModalTitleClassName = "m-0 text-[28px] font-extrabold";
export const addDishModalCloseClassName = "text-[#5a4136]";
export const addDishModalBodyClassName = "flex flex-col gap-[18px] overflow-y-auto p-6 max-[640px]:px-4";
export const formLabelClassName = "text-[13px] font-extrabold text-[#5a4136]";
export const uploadBoxClassName =
  "grid min-h-[164px] cursor-pointer place-items-center rounded-[9px] border-2 border-dashed border-[#ddc1b4] bg-[#f9f9fc] p-5 text-center text-[#1a1c1e]";
export const uploadIconClassName = "grid size-16 place-items-center rounded-full bg-[#ffd3c6] text-[#7a3000]";
export const uploadHelpClassName = "mt-1.5 text-[#5a4136]";
export const formGridClassName = "grid grid-cols-2 gap-4 max-lg:grid-cols-1";
export const formFieldClassName =
  "flex min-w-0 flex-col gap-2 [&>span]:text-[13px] [&>span]:font-extrabold [&>span]:text-[#5a4136] [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#ddc1b4] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-[#1a1c1e] [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-[#ddc1b4] [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-[#1a1c1e] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#ddc1b4] [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-[#1a1c1e]";
export const formFieldWideClassName = joinClasses(formFieldClassName, "col-span-full");
export const requiredMarkClassName = "text-[#ba1a1a]";
export const formControlClassName = "w-full rounded-lg border border-[#ddc1b4] bg-white px-3.5 py-3 text-[#1a1c1e]";
export const formErrorClassName = "text-xs text-[#ba1a1a]";
export const withSuffixClassName = "relative";
export const suffixClassName = "absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a4136] not-italic";
export const optionHeaderClassName =
  "flex items-center justify-between gap-3.5 [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[7px] [&_button]:rounded-lg [&_button]:border [&_button]:border-[#7a3000] [&_button]:bg-white [&_button]:px-3 [&_button]:py-[9px] [&_button]:font-extrabold [&_button]:text-[#7a3000]";
export const outlineButtonClassName = joinClasses(ownerInlineButtonBaseClassName, "rounded-lg border border-[#7a3000] bg-white px-3 py-[9px] text-[#7a3000]");
export const optionGroupClassName = "overflow-hidden rounded-[9px] border border-[#ddc1b4] bg-[#f9f9fc]";
export const optionGroupSummaryClassName = "flex items-center justify-between gap-3.5 px-4 py-3.5";
export const optionSummaryMetaClassName = "mt-[3px] block text-xs text-[#5a4136]";
export const optionRowClassName = "flex items-center justify-between gap-3.5 border-t border-[rgba(221,193,180,0.45)] px-4 py-3.5";
export const optionRowActionsClassName = "inline-flex gap-2.5 text-[#7a3000] [&_svg:last-child]:text-[#ba1a1a]";
export const optionGroupAddClassName = joinClasses(outlineButtonClassName, "m-4 mt-0");
export const sellToggleClassName = "flex items-center justify-between gap-3.5 border-t border-[rgba(221,193,180,0.45)] pt-1.5";
export const sellToggleHelpClassName = "mt-1 block text-[#5a4136]";
export const addDishFooterClassName = "flex items-center justify-end gap-3.5 border-t border-[rgba(221,193,180,0.45)] bg-[#f9f9fc] px-6 py-[22px] max-[640px]:flex-col max-[640px]:px-4";
export const addDishCancelClassName = "rounded-full border border-[#ddc1b4] px-6 py-[11px] font-extrabold text-[#1a1c1e] max-[640px]:w-full max-[640px]:text-center";
export const addDishSaveClassName = joinClasses(ownerInlineButtonBaseClassName, "rounded-full border-0 bg-[#d09b79] px-[22px] py-[11px] text-white max-[640px]:w-full");

export const periodSelectClassName =
  "w-auto min-w-[132px] rounded-xl border border-[rgba(221,193,180,0.45)] bg-white px-3.5 py-3 text-lg font-bold text-[#1a1c1e] shadow-[0_4px_12px_rgba(119,87,77,0.08)]";
export const revenueMetricCardClassName = cardClassName("min-h-[146px] p-6");
export const revenueMetricHeaderClassName = "flex items-center justify-between gap-3";
export const revenueMetricIconClassName = "size-8 rounded-full bg-[#ffd3c6] p-2 text-[#7a3000]";
export const chartCardClassName = cardClassName("relative mt-[30px] overflow-hidden rounded-3xl pb-[26px] before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(#a04100_1px,transparent_1px)] before:bg-[length:20px_20px] before:opacity-15");
export const tableCardClassName = cardClassName("mt-[30px] overflow-hidden rounded-3xl");
export const chartHeaderClassName = joinClasses(cardHeaderClassName, "relative z-[1] border-b-0");
export const chartClassName = "relative z-[1] grid grid-cols-[54px_1fr] gap-3 px-7 pb-2 max-lg:grid-cols-[42px_1fr] max-lg:px-3";
export const chartAxisClassName = "flex flex-col justify-between pb-[30px] text-xs text-[#5a4136]";
export const chartSvgClassName = "min-h-[300px] w-full max-[640px]:min-h-[220px]";
export const chartLabelsClassName = "col-start-2 flex justify-between text-[13px] text-[#5a4136]";
export const tableWrapClassName =
  "overflow-x-auto [&_table]:w-full [&_table]:min-w-[620px] [&_table]:border-collapse [&_th]:border-t [&_th]:border-[rgba(221,193,180,0.3)] [&_th]:bg-[#f3f3f6] [&_th]:px-6 [&_th]:py-4 [&_th]:text-left [&_th]:text-[13px] [&_th]:font-bold [&_th]:text-[#5a4136] [&_th:last-child]:text-right [&_td]:border-t [&_td]:border-[rgba(221,193,180,0.3)] [&_td]:px-6 [&_td]:py-4 [&_td]:text-left [&_td]:font-semibold [&_td]:text-[#1a1c1e] [&_td:last-child]:text-right";
export const tableClassName = "w-full min-w-[620px] border-collapse";
export const tableHeaderCellClassName = "border-t border-[rgba(221,193,180,0.3)] bg-[#f3f3f6] px-6 py-4 text-left text-[13px] font-bold text-[#5a4136] last:text-right";
export const tableCellClassName = "border-t border-[rgba(221,193,180,0.3)] px-6 py-4 text-left font-semibold text-[#1a1c1e] last:text-right";
export const tableValueCellClassName = joinClasses(tableCellClassName, "text-[#7a3000]");
export const tableStatusClassName = "rounded-full bg-[#ffd3c6] px-2.5 py-1.5 text-[11px] font-extrabold text-[#7a594f]";

export const reviewsTopbarClassName =
  "mb-[42px] -mx-8 -mt-[34px] flex min-h-[78px] items-center justify-end gap-6 bg-white px-7 py-3.5 shadow-[0_4px_12px_rgba(119,87,77,0.08)] max-lg:mx-0 max-lg:mb-6 max-lg:mt-0 max-lg:flex-col max-lg:items-stretch max-lg:shadow-none";
export const reviewsTopbarActionsClassName = "flex items-center gap-3.5 max-lg:justify-end";
export const reviewsTopbarButtonClassName = "relative inline-grid cursor-pointer place-items-center border-0 bg-transparent text-[#5a4136]";
export const notificationDotClassName = "absolute right-0.5 top-0 size-2 rounded-full bg-[#ba1a1a]";
export const reviewAvatarClassName = "grid size-[42px] place-items-center rounded-full bg-[linear-gradient(135deg,#fff1ec,#e7bdb1)] text-[11px] font-extrabold text-[#7a3000]";
export const reviewsLayoutClassName = "grid grid-cols-[380px_minmax(0,1fr)] gap-[30px] max-[1180px]:grid-cols-1";
export const reviewsContentClassName = "min-w-0";
export const ratingCardClassName = cardClassName("sticky top-[94px] flex min-h-[680px] flex-col justify-center p-8 max-[1180px]:static max-[1180px]:min-h-0 max-lg:p-6");
export const ratingTitleClassName = "mb-5 text-2xl font-extrabold";
export const ratingValueClassName = "block text-[56px] leading-none text-[#7a3000]";
export const starsClassName = "inline-flex text-[#7a3000]";
export const ratingNoteClassName = "my-2 mb-5 text-[#5a4136]";
export const ratingBarsClassName = "flex flex-col gap-2";
export const ratingBarClassName = "grid grid-cols-[18px_18px_1fr] items-center gap-2 [&_svg]:w-[15px]";
export const ratingBarTrackClassName = "h-[9px] overflow-hidden rounded-full bg-[#e2e2e5]";
export const ratingBarFillClassName = "block h-full rounded-[inherit] bg-[#7a3000]";
export const reviewHeaderClassName = "mb-6 flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-stretch";
export const reviewActionsClassName =
  "flex items-center gap-3.5 [&_button]:inline-flex [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-xl [&_button]:border [&_button]:border-[#ddc1b4] [&_button]:bg-white [&_button]:px-[18px] [&_button]:py-[9px] [&_button]:font-bold [&_button]:text-[#1a1c1e]";
export const reviewActionButtonClassName = joinClasses(ownerInlineButtonBaseClassName, "rounded-xl border border-[#ddc1b4] bg-white px-[18px] py-[9px] font-bold text-[#1a1c1e]");
export const reviewTabsClassName = joinClasses(tabListClassName, "mb-6 overflow-x-auto");
export const reviewListClassName = "flex flex-col gap-[22px]";
export const reviewCardClassName = cardClassName("p-[26px] px-[30px] max-lg:p-5");
export const reviewCardTopClassName =
  "grid grid-cols-[48px_1fr_auto] items-start gap-4 max-lg:grid-cols-[44px_1fr] [&_h2]:m-0 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_p]:mt-1.5 [&_p]:flex [&_p]:items-center [&_p]:gap-2 [&_p]:text-[#5a4136]";
export const reviewCardTitleClassName = "m-0 text-[22px] font-extrabold";
export const reviewMetaClassName = "mt-1.5 flex items-center gap-2 text-[#5a4136]";
export const reviewBadgesClassName =
  "flex flex-col items-end gap-[7px] max-lg:col-span-full max-lg:flex-row max-lg:items-center [&_mark]:rounded-md [&_mark]:border [&_mark]:border-[rgba(221,193,180,0.55)] [&_mark]:bg-[#ffd3c6] [&_mark]:px-2.5 [&_mark]:py-1.5 [&_mark]:text-xs [&_mark]:text-[#7a594f] [&_span]:rounded-md [&_span]:border [&_span]:border-[rgba(221,193,180,0.55)] [&_span]:bg-[#f3f3f6] [&_span]:px-2.5 [&_span]:py-1.5 [&_span]:text-xs [&_span]:text-[#7a594f]";
export const reviewBadgeClassName = "rounded-md border border-[rgba(221,193,180,0.55)] bg-[#ffd3c6] px-2.5 py-1.5 text-xs text-[#7a594f]";
export const reviewOrderBadgeClassName = joinClasses(reviewBadgeClassName, "bg-[#f3f3f6]");
export const reviewDishesClassName = "my-[18px] flex items-center gap-2.5 rounded-[9px] bg-[#f3f3f6] px-3 py-2.5 text-[#5a4136]";
export const reviewCommentClassName = "m-0 text-[17px] leading-[1.55] text-[#1a1c1e]";
export const reviewFooterClassName = "mt-[22px] flex justify-end border-t border-[rgba(221,193,180,0.45)] pt-3";
export const softPillButtonClassName = joinClasses(ownerInlineButtonBaseClassName, "rounded-full border border-[#ddc1b4] bg-white px-5 py-[9px] text-[#7a3000]");
export const reviewReplyClassName = "ml-5 mt-[22px] rounded-[9px] border-l-4 border-[#7a3000] bg-[#f9f9fc] px-[18px] py-4";
export const reviewReplyHeaderClassName = "flex justify-between gap-3 text-[13px] text-[#7a3000]";
export const reviewReplyTextClassName = "mt-2 leading-6";
export const loadMoreClassName = joinClasses(softPillButtonClassName, "mx-auto mt-6 flex");

export const settingsTopbarClassName = joinClasses(
  stickyHeaderClassName,
  "gap-[18px] [&>button]:inline-grid [&>button]:size-[46px] [&>button]:cursor-pointer [&>button]:place-items-center [&>button]:rounded-full [&>button]:border-0 [&>button]:bg-white [&>button]:text-[#5a4136] [&>button]:shadow-[0_4px_12px_rgba(119,87,77,0.08)]"
);
export const settingsTopbarTitleWrapClassName = "mr-auto";
export const settingsContentClassName = "mx-auto w-full max-w-[1000px] px-7 pb-12 pt-7 max-lg:px-4 max-lg:pb-8 max-lg:pt-5";
export const settingsSectionClassName = cardClassName("mb-[22px] p-6");
export const settingsSectionTitleClassName = "mb-[18px] text-2xl font-extrabold text-[#1a1c1e]";
export const settingsMediaClassName = "relative mb-6 flex items-end gap-[18px] max-lg:grid max-lg:grid-cols-1";
export const coverPhotoClassName =
  "group relative h-[210px] flex-1 overflow-hidden rounded-xl border border-[#ddc1b4] [&_img]:size-full [&_img]:object-cover [&_button]:absolute [&_button]:inset-0 [&_button]:grid [&_button]:size-full [&_button]:place-items-center [&_button]:bg-[rgba(26,28,30,0.44)] [&_button]:text-white [&_button]:opacity-0 [&_button]:transition-opacity [&_button]:duration-150 group-hover:[&_button]:opacity-100";
export const logoPhotoClassName =
  "group relative ml-[-78px] size-[126px] flex-none overflow-hidden rounded-full border-4 border-white shadow-[0_4px_12px_rgba(119,87,77,0.08)] max-lg:ml-5 max-lg:mt-[-72px] max-lg:size-[104px] [&_img]:size-full [&_img]:object-cover [&_button]:absolute [&_button]:inset-0 [&_button]:grid [&_button]:size-full [&_button]:place-items-center [&_button]:bg-[rgba(26,28,30,0.44)] [&_button]:text-white [&_button]:opacity-0 [&_button]:transition-opacity [&_button]:duration-150 group-hover:[&_button]:opacity-100";
export const mediaOverlayButtonClassName = "absolute inset-0 grid size-full place-items-center bg-[rgba(26,28,30,0.44)] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100";
export const sectionHeaderClassName =
  "mb-[18px] flex items-start justify-between gap-3.5 max-[640px]:flex-col max-[640px]:items-stretch [&_button]:inline-flex [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-[9px] [&_button]:border [&_button]:border-[#ddc1b4] [&_button]:bg-white [&_button]:px-[18px] [&_button]:py-[9px] [&_button]:font-bold [&_button]:text-[#7a3000]";
export const sectionDescriptionClassName = "mt-1.5 text-[#5a4136]";
export const hoursListClassName = "flex flex-col gap-3";
export const hoursRowClassName =
  "flex items-center justify-between gap-3.5 rounded-[10px] border border-[rgba(221,193,180,0.55)] bg-[#f9f9fc] px-4 py-3.5 [&_button]:inline-grid [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#7a3000]";
export const hoursMetaClassName = "mt-1 text-[#5a4136]";
export const operationsSectionClassName = cardClassName("mb-[22px] grid gap-3.5 p-6");
export const operationRowClassName = "flex items-center justify-between gap-3.5 rounded-[10px] border border-[rgba(221,193,180,0.55)] bg-[#f9f9fc] px-4 py-3.5";
export const operationStatusClassName = "inline-flex items-center gap-2 font-extrabold text-[#27865c]";
export const staffListClassName = "flex flex-col gap-3";
export const staffRowClassName = "grid grid-cols-[44px_1fr_auto] items-center justify-between gap-3.5 rounded-[10px] border border-[rgba(221,193,180,0.55)] bg-[#f9f9fc] px-4 py-3.5 max-[640px]:grid-cols-[44px_1fr]";
export const staffStatusClassName = "rounded-full bg-[#ffd3c6] px-2.5 py-[7px] text-xs font-extrabold text-[#7a594f] max-[640px]:col-span-full max-[640px]:justify-self-start";
export const settingsActionsClassName =
  "flex justify-end gap-3.5 max-[640px]:flex-col max-[640px]:items-stretch [&_button]:inline-flex [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-full [&_button]:border [&_button]:border-[#ddc1b4] [&_button]:bg-white [&_button]:px-5 [&_button]:py-[9px] [&_button]:font-extrabold [&_button]:text-[#7a3000] [&_button:last-child]:border-transparent [&_button:last-child]:bg-[#923900] [&_button:last-child]:text-white";
export const settingsCancelButtonClassName = softPillButtonClassName;
export const settingsSaveButtonClassName = joinClasses(ownerInlineButtonBaseClassName, "rounded-full border border-transparent bg-[#923900] px-5 py-[9px] text-white");
