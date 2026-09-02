function joinClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const orderPageBaseClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(208,228,255,0.45),transparent_30%),#f9f9fc] text-[#1a1c1e]";
const orderPanelClassName =
  "rounded-3xl border border-[rgba(221,193,180,0.42)] bg-white shadow-[0_14px_34px_rgba(119,87,77,0.08)]";
const orderActionBaseClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold leading-5 no-underline";

export function orderPageClassName(tone: "default" | "error" = "default") {
  return joinClassNames(
    orderPageBaseClassName,
    tone === "error" &&
      "bg-[radial-gradient(circle_at_center,rgba(255,218,214,0.65),transparent_38%),#f9f9fc]"
  );
}

export const orderCheckoutMainClassName =
  "mx-auto w-[min(100%,1200px)] px-6 pb-[72px] pt-[42px] max-[900px]:pt-8 max-[640px]:px-4 max-[640px]:pb-12 max-[640px]:pt-6";
export const orderCheckoutTitleRowClassName =
  "mb-7 flex items-center gap-3.5 max-[640px]:mb-5";
export const orderBackButtonClassName =
  "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#5a4136] shadow-[0_10px_24px_rgba(119,87,77,0.08)] transition-[background-color,color,transform] duration-150 hover:-translate-y-px hover:bg-[#ffd3c6] hover:text-[#7a3000]";
export const orderTitleEyebrowClassName =
  "mb-1 mt-0 block text-[13px] font-bold uppercase leading-[18px] text-[#0062a1]";
export const orderCheckoutTitleClassName =
  "m-0 text-[32px] font-extrabold leading-10 text-[#1a1c1e] max-[640px]:text-[28px] max-[640px]:leading-9";
export const orderCheckoutLayoutClassName =
  "grid grid-cols-[minmax(0,1fr)_370px] items-start gap-7 max-[900px]:grid-cols-1 max-[900px]:gap-6";
export const orderCheckoutColumnClassName =
  "flex flex-col gap-5";
export const orderCheckoutPanelClassName =
  `${orderPanelClassName} grid gap-5 px-6 py-[26px] max-[640px]:px-4 max-[640px]:py-5`;
export const orderPanelHeadingClassName =
  "flex items-center gap-3";
export const orderPanelIconClassName =
  "h-9 w-9 rounded-xl bg-[#ffdbcc] p-[7px] text-[#7a3000]";
export const orderPanelStepClassName =
  "mb-0.5 block text-xs font-bold leading-4 text-[#5a4136]";
export const orderPanelTitleClassName =
  "m-0 text-[22px] font-extrabold leading-[30px] text-[#1a1c1e]";
export const orderCheckoutValidationSummaryClassName =
  "!rounded-[14px] !bg-[#ffdad6] !text-sm !font-semibold !leading-5 !text-[#93000a]";

export const orderFormGridClassName =
  "grid grid-cols-2 gap-[18px] max-[640px]:grid-cols-1";
export const orderFormFieldClassName = "grid gap-2";
export const orderFormLabelClassName =
  "text-[13px] font-bold leading-[18px] text-[#5a4136]";
const orderFormControlBaseClassName =
  "w-full rounded-xl border border-[#8e7164] bg-[#f9f9fc] px-3.5 py-3 text-[15px] leading-[22px] text-[#1a1c1e] outline-none transition-[background-color,border-color,box-shadow] duration-150 focus:border-[#7a3000] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,0,0.2)] data-[invalid=true]:border-[#ba1a1a] data-[invalid=true]:bg-[rgba(255,218,214,0.42)]";
export function orderFormInputClassName(isInvalid = false) {
  return joinClassNames(
    orderFormControlBaseClassName,
    isInvalid && "border-[#ba1a1a] bg-[rgba(255,218,214,0.42)]"
  );
}
export function orderFormTextareaClassName(isInvalid = false) {
  return joinClassNames(
    `${orderFormControlBaseClassName} resize-y`,
    isInvalid && "border-[#ba1a1a] bg-[rgba(255,218,214,0.42)]"
  );
}
export const orderFormErrorClassName =
  "m-0 text-xs font-semibold leading-4 text-[#ba1a1a]";

export const orderPaymentOptionsClassName = "flex flex-col gap-3.5";
const orderPaymentOptionBaseClassName =
  "grid cursor-pointer select-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border-[1.5px] border-[#ddc1b4] bg-[#f9f9fc] px-5 py-4 transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#a04100] hover:bg-[#f3f3f6] data-[selected=true]:border-2 data-[selected=true]:border-[#7a3000] data-[selected=true]:bg-[rgba(255,211,198,0.35)] data-[selected=true]:shadow-[0_4px_14px_rgba(122,48,0,0.08)] max-[640px]:grid-cols-[auto_minmax(0,1fr)]";
export function orderPaymentOptionClassName(isSelected: boolean) {
  return joinClassNames(
    orderPaymentOptionBaseClassName,
    isSelected &&
      "border-2 border-[#7a3000] bg-[rgba(255,211,198,0.35)] shadow-[0_4px_14px_rgba(122,48,0,0.08)]"
  );
}
export const orderPaymentInputClassName = "hidden";
export function orderPaymentIconClassName(isSelected: boolean) {
  return joinClassNames(
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#5a4136] shadow-[0_2px_8px_rgba(119,87,77,0.06)] transition-[background-color,color] duration-200",
    isSelected && "bg-[#7a3000] text-white"
  );
}
export const orderPaymentInfoClassName =
  "min-w-0 [&_small]:mt-[3px] [&_small]:block [&_small]:text-[13px] [&_small]:leading-[18px] [&_small]:text-[#5a4136] [&_strong]:block [&_strong]:text-base [&_strong]:font-semibold [&_strong]:leading-[22px] [&_strong]:text-[#1a1c1e]";
export function orderPaymentRadioClassName(isSelected: boolean) {
  return joinClassNames(
    "flex shrink-0 items-center text-[#8e7164] max-[640px]:col-start-2",
    isSelected && "text-[#7a3000]"
  );
}

export const orderSummaryCardClassName =
  `${orderPanelClassName} sticky top-[100px] grid gap-5 p-6 max-[900px]:static max-[640px]:p-4`;
export const orderSummaryHeadingClassName =
  "flex items-center gap-3";
export const orderSummaryListClassName =
  "grid gap-3.5 border-y border-[#e2e2e5] py-4";
export const orderSummaryGroupClassName =
  "grid gap-3 border-t border-dashed border-[#ddc1b4] pt-3.5 first:border-t-0 first:pt-0";
export const orderSummaryRestaurantClassName =
  "inline-flex min-w-0 items-center gap-2 text-sm font-bold leading-5 text-[#7a3000] no-underline";
export const orderSummaryGroupItemsClassName = "grid gap-3";
export const orderSummaryItemClassName =
  "grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3";
export const orderSummaryItemMediaClassName =
  "relative h-14 w-14 overflow-hidden rounded-xl bg-[#e2e2e5]";
export const orderSummaryItemImageClassName = "object-cover";
export const orderSummaryItemTitleClassName =
  "m-0 text-sm font-bold leading-5 text-[#1a1c1e]";
export const orderSummaryItemMetaClassName =
  "mt-0.5 block text-xs leading-4 text-[#5a4136]";
export const orderSummaryItemOptionsClassName =
  "mt-1 block text-[11px] font-bold leading-[15px] text-[#7a3000]";
export const orderSummaryItemNoteClassName =
  "mt-1 block text-[11px] leading-[15px] text-[#7a594f]";
export const orderSummaryItemPriceClassName =
  "whitespace-nowrap text-sm font-bold leading-5 text-[#1a1c1e]";
export const orderSummaryRowsClassName = "grid gap-3";
export const orderSummaryRowClassName =
  "flex items-center justify-between gap-4 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:whitespace-nowrap [&_strong]:text-sm [&_strong]:font-bold [&_strong]:leading-5 [&_strong]:text-[#1a1c1e]";
export const orderSummaryDiscountRowClassName =
  "flex items-center justify-between gap-4 [&_span]:text-sm [&_span]:font-bold [&_span]:leading-5 [&_span]:text-[#2e7d32] [&_strong]:whitespace-nowrap [&_strong]:text-sm [&_strong]:font-bold [&_strong]:leading-5 [&_strong]:text-[#2e7d32]";
export const orderDiscountTextClassName = "!font-bold !text-[#2e7d32]";

export const orderVoucherSectionClassName =
  "flex flex-col gap-2.5 border-t border-[#e2e2e5] pt-3.5";
export const orderVoucherHeaderClassName =
  "flex items-center gap-2 text-sm font-bold text-[#1a1c1e] [&_svg]:text-lg [&_svg]:text-[#a04100]";
export const orderVoucherAppliedClassName =
  "flex items-center justify-between gap-2.5 rounded-[10px] border border-dashed border-[#ff8a65] bg-[#fff5ee] px-3 py-2.5";
export const orderVoucherAppliedInfoClassName =
  "flex min-w-0 items-center gap-2.5 [&_div]:flex [&_div]:min-w-0 [&_div]:flex-col [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [&_small]:text-xs [&_small]:text-[#5a4136] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-xs [&_span]:text-[#5a4136] [&_strong]:text-[13px] [&_strong]:font-bold [&_strong]:text-[#a04100] [&_svg]:shrink-0 [&_svg]:text-xl [&_svg]:text-[#ff5722]";
export const orderVoucherRemoveButtonClassName =
  "flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-1 text-[#8c6e63] transition-colors duration-150 hover:bg-[rgba(160,65,0,0.1)] hover:text-[#ba1a1a]";
export const orderVoucherFormClassName = "flex flex-col gap-2";
export const orderVoucherInputRowClassName =
  "flex items-stretch gap-2";
export function orderVoucherInputClassName(isInvalid = false) {
  return joinClassNames(
    "h-10 min-w-0 flex-1 rounded-lg border border-[#ddc1b4] bg-white px-3 py-2 text-[13px] text-[#1a1c1e] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#a04100] focus:shadow-[0_0_0_2px_rgba(160,65,0,0.15)] data-[invalid=true]:border-[#ba1a1a] data-[invalid=true]:bg-[#fff8f7]",
    isInvalid && "border-[#ba1a1a] bg-[#fff8f7]"
  );
}
export const orderVoucherApplyButtonClassName =
  "h-10 cursor-pointer whitespace-nowrap rounded-lg border-0 bg-[#ff5722] px-4 text-[13px] font-bold text-white transition-[background-color,transform] duration-200 hover:bg-[#e64a19] active:scale-[0.98]";
export const orderVoucherErrorClassName =
  "m-0 text-xs leading-4 text-[#ba1a1a]";
export const orderVoucherPickerLinkClassName =
  "inline-block cursor-pointer border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-[#a04100] transition-colors duration-150 hover:text-[#7a3000] hover:underline";

export const orderSummaryTotalClassName =
  "flex items-center justify-between gap-4 border-t border-dashed border-[#ddc1b4] pt-[18px]";
export const orderSummaryTotalLabelClassName =
  "text-[17px] font-extrabold leading-6 text-[#1a1c1e]";
export const orderSummaryTotalValueClassName =
  "whitespace-nowrap text-[28px] font-black leading-9 text-[#7a3000]";
export const orderSubmitButtonClassName =
  "!min-h-[54px] !rounded-[14px] !bg-[#a04100] !text-base !font-extrabold !normal-case !leading-5 !text-white !shadow-[0_10px_20px_rgba(122,48,0,0.18)] hover:!bg-[#7a3000]";
export const orderCheckoutTermsClassName =
  "m-0 text-center text-xs leading-4 text-[#5a4136]";

export const orderEmptyCardClassName =
  `${orderPanelClassName} grid justify-items-center gap-3 px-6 py-[72px] text-center [&_h2]:m-0 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-8 [&_h2]:text-[#1a1c1e] [&_p]:m-0 [&_p]:max-w-[430px] [&_p]:text-[15px] [&_p]:leading-[22px] [&_p]:text-[#5a4136] [&_svg]:h-[58px] [&_svg]:w-[58px] [&_svg]:text-[#7a3000] max-[640px]:px-4 max-[640px]:py-12`;
export const orderEmptyIconClassName = "h-[58px] w-[58px] text-[#7a3000]";
export const orderEmptyTitleClassName =
  "m-0 text-2xl font-extrabold leading-8 text-[#1a1c1e]";
export const orderEmptyTextClassName =
  "m-0 max-w-[430px] text-[15px] leading-[22px] text-[#5a4136]";

export const orderInformationModalClassName =
  "fixed inset-0 z-[1300] grid place-items-center bg-[rgba(26,28,30,0.38)] p-6";
export const orderInformationCardClassName =
  "w-[min(100%,420px)] rounded-3xl border border-[rgba(221,193,180,0.5)] bg-white px-6 py-[30px] text-center shadow-[0_24px_64px_rgba(37,29,24,0.18)]";
export const orderInformationIconClassName =
  "mb-[18px] inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#d0e4ff] text-[#004a7b] [&_svg]:h-[38px] [&_svg]:w-[38px]";
export const orderInformationTitleClassName =
  "m-0 text-2xl font-extrabold leading-8 text-[#1a1c1e]";
export const orderInformationTextClassName =
  "mb-0 mt-2.5 text-[15px] leading-[22px] text-[#5a4136]";
export const orderInformationPrimaryClassName =
  "!mt-4 !min-h-[46px] !w-full !rounded-full !bg-[#a04100] !font-extrabold !normal-case !text-white hover:!bg-[#7a3000]";
export const orderInformationSecondaryClassName =
  "!mt-4 !min-h-[46px] !w-full !rounded-full !font-extrabold !normal-case !text-[#5a4136]";

export const orderSubmissionOverlayClassName =
  "fixed inset-0 z-[1400] grid place-items-center bg-[rgba(249,249,252,0.82)] p-6 text-center text-[#1a1c1e] backdrop-blur-[10px]";
export const orderSubmissionCardClassName =
  "grid w-[min(100%,400px)] justify-items-center gap-3.5 rounded-[18px] border border-[rgba(255,219,204,0.7)] bg-white/95 px-12 pb-9 pt-8 shadow-[0_28px_70px_rgba(119,87,77,0.16)] max-[640px]:px-6";
export const orderSubmissionSpinnerClassName =
  "relative grid h-[152px] w-[152px] place-items-center rounded-full bg-[rgba(255,247,242,0.86)] before:absolute before:inset-[22px] before:rounded-full before:border-[3px] before:border-[rgba(255,211,198,0.45)] before:border-t-[rgba(122,48,0,0.22)] before:content-[''] before:animate-spin";
export const orderSubmissionSpinnerRingClassName =
  "block h-[104px] w-[104px] animate-spin rounded-full border-4 border-[rgba(255,211,198,0.45)] border-r-[rgba(122,48,0,0.35)] border-t-[#7a3000]";
export const orderSubmissionTitleClassName =
  "m-0 text-[26px] font-black leading-[34px] text-[#7a3000]";
export const orderSubmissionTextClassName =
  "m-0 text-[15px] font-bold leading-[22px] text-[#5a4136]";
export const orderSubmissionProgressClassName =
  "mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#e2e2e5]";
export const orderSubmissionProgressBarClassName =
  "block h-full w-full origin-left animate-[orderSubmissionProgress_3.5s_ease-in-out_infinite] rounded-[inherit] bg-[#7a3000]";

export const orderResultPageClassName =
  "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(208,228,255,0.45),transparent_30%),#f9f9fc] px-6 py-12 text-[#1a1c1e]";
export const orderErrorResultPageClassName =
  "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_center,rgba(255,218,214,0.65),transparent_38%),#f9f9fc] px-6 py-12 text-[#1a1c1e]";
export const orderResultCardClassName =
  `${orderPanelClassName} grid w-[min(100%,560px)] justify-items-center gap-[18px] px-8 py-[38px] text-center max-[640px]:px-5`;
export function orderResultIconClassName(tone: "success" | "error") {
  return joinClassNames(
    "inline-flex h-[82px] w-[82px] items-center justify-center rounded-full [&_svg]:h-12 [&_svg]:w-12",
    tone === "success" ? "bg-[#dff5e8] text-[#27865c]" : "bg-[#ffdad6] text-[#ba1a1a]"
  );
}
export const orderResultTitleClassName =
  "m-0 text-[32px] font-black leading-10 text-[#1a1c1e]";
export const orderResultTextClassName =
  "m-0 max-w-[430px] text-base leading-6 text-[#5a4136]";
export const orderReceiptCardClassName =
  "grid w-full gap-[13px] rounded-[20px] bg-[#f3f3f6] p-5 text-left [&>p]:m-0 [&>p]:text-center [&>p]:text-[#5a4136] [&>svg]:mx-auto [&>svg]:h-[42px] [&>svg]:w-[42px] [&>svg]:text-[#7a3000]";
export const orderReceiptIdClassName =
  "flex justify-between gap-[18px] border-b border-[#e2e2e5] pb-[13px] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:text-lg [&_strong]:leading-6 [&_strong]:text-[#7a3000]";
export const orderReceiptRowClassName =
  "flex justify-between gap-[18px] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:max-w-[60%] [&_strong]:text-right [&_strong]:text-[15px] [&_strong]:font-extrabold [&_strong]:leading-[22px] [&_strong]:text-[#1a1c1e]";
export const orderReceiptAddressRowClassName =
  `${orderReceiptRowClassName} items-start border-t border-[#e2e2e5] pt-[13px]`;
export const orderReceiptPillClassName =
  "inline-flex max-w-none rounded-full bg-[#ffd3c6] px-2.5 py-[3px] text-[#7a594f]";
export const orderResultActionsClassName =
  "flex w-full flex-wrap justify-center gap-3";
export const orderPrimaryActionLinkClassName =
  `${orderActionBaseClassName} bg-[#a04100] text-white shadow-[0_10px_20px_rgba(122,48,0,0.16)] hover:bg-[#7a3000]`;
export const orderSecondaryActionLinkClassName =
  `${orderActionBaseClassName} border-2 border-[#8e7164] bg-transparent text-[#7a3000] hover:bg-[#ffd3c6]`;
export const orderContinueButtonClassName =
  "!min-h-12 !rounded-xl !border-[#8e7164] !px-5 !py-3 !font-extrabold !normal-case !text-[#7a3000]";
export const orderHomeLinkClassName =
  "inline-flex items-center gap-1.5 text-sm font-bold leading-5 text-[#5a4136] hover:text-[#7a3000]";

export const orderVoucherPickerOverlayClassName =
  "fixed inset-0 z-[1400] flex animate-[orderModalFadeIn_0.25s_ease-out] items-center justify-center bg-[rgba(47,49,51,0.5)] p-4 backdrop-blur";
export const orderVoucherPickerModalClassName =
  "flex max-h-[85vh] w-full max-w-[480px] animate-[orderModalSlideUp_0.3s_ease-out] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_48px_rgba(119,87,77,0.16)]";
export const orderVoucherPickerHeaderClassName =
  "flex items-center justify-between border-b border-[#eeeef0] px-5 py-[18px]";
export const orderVoucherPickerTitleClassName =
  "m-0 text-lg font-bold text-[#1a1c1e]";
export const orderVoucherPickerEmptyClassName =
  "px-5 py-8 text-center text-sm text-[#5a4136]";
export const orderVoucherPickerListClassName =
  "flex flex-col gap-3 overflow-y-auto px-5 py-4";
export const orderVoucherPickerItemClassName =
  "flex items-center gap-3 rounded-xl border border-dashed border-[#ddc1b4] bg-[#fff8f4] p-3.5 transition-[background-color,border-color] duration-200 hover:border-[#a04100] hover:bg-[#fff3ec]";
export const orderVoucherPickerItemIconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ffebe0] text-[#a04100] [&_svg]:text-[22px]";
export const orderVoucherPickerItemInfoClassName =
  "flex min-w-0 flex-1 flex-col gap-0.5 [&_code]:rounded [&_code]:bg-[#f0e6e0] [&_code]:px-1 [&_code]:py-px [&_code]:font-bold [&_code]:text-[#7a3000] [&_small]:mt-0.5 [&_small]:text-[11px] [&_small]:text-[#8c6e63] [&_span]:text-xs [&_span]:leading-4 [&_span]:text-[#5a4136] [&_strong]:text-sm [&_strong]:font-bold [&_strong]:text-[#1a1c1e]";
export const orderVoucherPickerItemButtonClassName =
  "!h-[34px] !min-w-16 !rounded-lg !text-xs !font-bold !normal-case [&.MuiButton-contained]:!bg-[#a04100] [&.MuiButton-contained]:!text-white [&.MuiButton-contained:hover]:!bg-[#7a3000]";

export const orderHistoryPageClassName = orderPageBaseClassName;
export const orderDetailPageClassName = orderPageBaseClassName;
export const orderTrackingPageClassName = orderPageBaseClassName;

const orderFlowMainClassName =
  "mx-auto w-[min(100%,1200px)] flex-1 px-6 pb-[76px] pt-[38px] max-[900px]:pt-8 max-[640px]:px-4 max-[640px]:pb-12 max-[640px]:pt-6";
export const orderHistoryMainClassName = orderFlowMainClassName;
export const orderDetailMainClassName = orderFlowMainClassName;
export const orderTrackingMainClassName = orderFlowMainClassName;

export const orderHistoryTitleRowClassName =
  "mb-7 flex items-center justify-between gap-[18px] [&_h1]:m-0 [&_h1]:text-[32px] [&_h1]:font-black [&_h1]:leading-10 [&_h1]:text-[#1a1c1e] max-[640px]:mb-[22px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:[&_h1]:text-[28px] max-[640px]:[&_h1]:leading-9";
export const orderDetailTitleRowClassName =
  "mb-7 flex items-center justify-start gap-[18px] [&_h1]:m-0 [&_h1]:text-[32px] [&_h1]:font-black [&_h1]:leading-10 [&_h1]:text-[#1a1c1e] max-[640px]:mb-[22px] max-[640px]:items-start max-[640px]:[&_h1]:text-[28px] max-[640px]:[&_h1]:leading-9";
export const orderTrackingTitleRowClassName = orderDetailTitleRowClassName;
export const orderFlowTitleEyebrowClassName =
  "mb-1 block text-[13px] font-extrabold uppercase leading-[18px] text-[#0062a1]";
export const orderFlowTitleClassName =
  "m-0 text-[32px] font-black leading-10 text-[#1a1c1e] max-[640px]:text-[28px] max-[640px]:leading-9";
export const orderHistorySubtitleClassName =
  "m-0 mt-2 text-[15px] leading-[22px] text-[#5a4136]";
export const orderTrackingTitleMetaClassName =
  "m-0 mb-1 block text-[13px] font-extrabold leading-[18px] text-[#0062a1] [&_strong]:text-[#004a7b]";

export const orderHistoryCartLinkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ddc1b4] bg-white px-4 py-2.5 text-sm font-extrabold leading-5 text-[#7a3000] no-underline transition-colors duration-150 hover:bg-[#fff4ee] hover:text-[#5a2300]";
export const orderDetailTrackLinkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#a04100] px-[18px] py-3 text-sm font-extrabold leading-5 text-white no-underline shadow-[0_10px_20px_rgba(122,48,0,0.16)] transition-colors duration-150 hover:bg-[#7a3000] max-[900px]:col-span-full max-[640px]:w-full";
export const orderDetailHistoryLinkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ddc1b4] bg-white px-4 py-2.5 text-sm font-extrabold leading-5 text-[#7a3000] no-underline transition-colors duration-150 hover:bg-[#fff4ee] hover:text-[#5a2300] max-[900px]:col-span-full max-[640px]:w-full";
export const orderTrackingDetailLinkClassName = orderDetailHistoryLinkClassName;

export const orderHistoryToolbarClassName =
  "mb-7 flex flex-wrap items-center justify-between gap-4";
export const orderHistoryFilterPanelClassName =
  "flex flex-wrap items-center gap-2";
export function orderHistoryChipClassName(isActive: boolean) {
  return joinClassNames(
    "cursor-pointer rounded-full border border-[#ddc1b4] bg-white px-[18px] py-2 text-[13px] font-semibold text-[#5a4136] shadow-[0_1px_3px_rgba(119,87,77,0.06)] transition-[background-color,border-color,box-shadow,color] duration-150 hover:border-[#8e7164] hover:bg-[#f3f3f6] data-[active=true]:border-transparent data-[active=true]:bg-[#ffd3c6] data-[active=true]:font-bold data-[active=true]:text-[#7a594f] data-[active=true]:shadow-[0_2px_6px_rgba(122,48,0,0.12)]",
    isActive &&
      "border-transparent bg-[#ffd3c6] font-bold text-[#7a594f] shadow-[0_2px_6px_rgba(122,48,0,0.12)]"
  );
}
export const orderHistorySearchClassName =
  "flex min-w-[280px] max-w-xs items-center gap-2 rounded-full border border-[#ddc1b4] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(119,87,77,0.06)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#7a3000] focus-within:shadow-[0_2px_8px_rgba(122,48,0,0.12)] max-[640px]:w-full max-[640px]:max-w-none";
export const orderHistorySearchIconClassName =
  "shrink-0 text-xl text-[#8e7164]";
export const orderHistorySearchInputClassName =
  "w-full border-0 bg-transparent text-[13px] text-[#1a1c1e] outline-none placeholder:text-[13px] placeholder:text-[#8a7267]";

export const orderHistoryBentoGridClassName =
  "grid grid-cols-12 gap-6";
export const orderHistoryLargeCardClassName =
  "col-span-12 flex flex-row gap-6 rounded-[20px] border border-[rgba(221,193,180,0.42)] bg-white p-6 shadow-[0_4px_16px_rgba(119,87,77,0.08)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(119,87,77,0.14)] min-[1024px]:col-span-8 max-[640px]:flex-col max-[640px]:p-4";
export const orderHistoryLargeImageAreaClassName =
  "relative min-h-40 w-[220px] shrink-0 overflow-hidden rounded-[14px] bg-[#eeeef0] max-[640px]:h-auto max-[640px]:w-full max-[640px]:aspect-video";
export const orderHistoryImageClassName = "object-cover";
export const orderHistoryLargeContentClassName =
  "flex min-w-0 flex-1 flex-col justify-between";
export const orderHistoryLargeTopClassName =
  "mb-2 flex items-start justify-between gap-4 max-[640px]:flex-col";
export const orderHistoryLargeTitleGroupClassName = "min-w-0";
export const orderHistoryLargeTitleClassName =
  "m-0 mt-1.5 text-2xl font-bold leading-8 text-[#1a1c1e]";
export const orderHistoryLargePriceClassName =
  "whitespace-nowrap text-[22px] font-extrabold leading-7 text-[#7a3000]";
export const orderHistoryCodeClassName =
  "my-1 text-sm font-medium leading-5 text-[#5a4136]";
export const orderHistoryDateClassName =
  "m-0 flex items-center gap-1 text-sm leading-5 text-[#5a4136]";
export const orderHistoryLargeActionsClassName =
  "mt-4 flex justify-end gap-3 max-[640px]:flex-col";

export function orderHistorySmallCardClassName(isCancelled = false) {
  return joinClassNames(
    "col-span-12 flex flex-col justify-between gap-4 rounded-[20px] border border-[rgba(221,193,180,0.42)] bg-white p-5 shadow-[0_4px_16px_rgba(119,87,77,0.08)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(119,87,77,0.12)] min-[640px]:col-span-6 min-[1024px]:col-span-4 max-[640px]:p-4",
    isCancelled && "opacity-85"
  );
}
export const orderHistoryCardTopClassName =
  "flex items-center justify-between gap-3";
export const orderHistoryCardBodyClassName =
  "flex items-center gap-3.5 max-[640px]:items-start";
export const orderHistorySmallImageContainerClassName =
  "relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[10px] bg-[#eeeef0]";
export const orderHistorySmallInfoClassName = "min-w-0 flex-1";
export const orderHistorySmallTitleClassName =
  "m-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-[22px] text-[#1a1c1e]";
export const orderHistorySmallDateClassName =
  "my-0.5 text-[13px] leading-[18px] text-[#5a4136]";
export const orderHistorySmallPriceClassName =
  "block text-base font-bold leading-[22px] text-[#1a1c1e]";
export const orderHistoryIssueReasonClassName =
  "mt-1 inline-flex items-center gap-1 text-xs font-semibold leading-4 text-[#ba1a1a]";
export const orderHistoryActionsClassName =
  "mt-auto flex gap-2 max-[640px]:flex-col";
export const orderHistoryLargeOutlinedButtonClassName =
  "!rounded-xl !border-2 !border-[#8e7164] !px-6 !py-2 !font-bold !normal-case !text-[#5a4136] hover:!border-[#7a3000] hover:!bg-[#f3f3f6] hover:!text-[#7a3000]";
export const orderHistoryLargeContainedButtonClassName =
  "!rounded-xl !bg-[#a04100] !px-6 !py-2 !font-bold !normal-case !text-white !shadow-[0_4px_14px_rgba(160,65,0,0.25)] hover:!bg-[#7a3000]";
export const orderHistoryOutlinedButtonClassName =
  "!rounded-[10px] !border !border-[#ddc1b4] !py-2 !font-bold !normal-case !text-[#5a4136] hover:!border-[#7a3000] hover:!bg-[#f3f3f6] hover:!text-[#7a3000]";
export const orderHistoryContainedButtonClassName =
  "!rounded-[10px] !bg-[#a04100] !py-2 !font-bold !normal-case !text-white !shadow-[0_2px_8px_rgba(160,65,0,0.2)] hover:!bg-[#7a3000]";

export function orderStatusChipClassName(status: string) {
  const tone =
    status === "delivering"
      ? "bg-[#d0e4ff] text-[#004a7b]"
      : status === "completed"
      ? "bg-[#dff5e8] text-[#1b6f4b]"
      : status === "cancelled" || status === "rejected"
      ? "bg-[#ffdad6] text-[#93000a]"
      : "bg-[#ffdbcc] text-[#7a3000]";

  return joinClassNames(
    "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold leading-4",
    tone
  );
}

export function orderHistoryPaymentPillClassName(kind: "vnpay" | "cod") {
  return joinClassNames(
    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold leading-[14px]",
    kind === "vnpay"
      ? "bg-[#d0e4ff] text-[#004a7b]"
      : "bg-[#eeeef0] text-[#5a4136]"
  );
}

export const orderDetailLayoutClassName =
  "grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[900px]:grid-cols-1";
export const orderTrackingLayoutClassName = orderDetailLayoutClassName;
export const orderDetailContentClassName = "grid gap-[18px]";
export const orderTrackingContentClassName = orderDetailContentClassName;
export const orderDetailSidebarClassName =
  "grid gap-[18px] max-[900px]:grid-cols-2 max-[640px]:grid-cols-1";
export const orderTrackingSidebarClassName = orderDetailSidebarClassName;
export const orderDetailStatusCardClassName =
  `${orderPanelClassName} relative grid gap-4 overflow-hidden p-6 after:absolute after:-right-[60px] after:-top-[60px] after:h-[150px] after:w-[150px] after:rounded-full after:bg-[rgba(255,107,0,0.12)] after:content-[''] max-[640px]:p-4`;
export const orderDetailStatusTopClassName =
  "flex items-start justify-between gap-[18px] max-[640px]:flex-col";
export const orderDetailStatusMetaClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailStatusTitleGroupClassName = "grid gap-1";
export const orderDetailStatusTitleClassName =
  "m-0 text-2xl font-black leading-8 text-[#1a1c1e]";
export const orderDetailStatusNewPillClassName =
  "inline-flex w-fit items-center gap-1 rounded-full bg-[#ffd3c6] px-2.5 py-1 text-xs font-black leading-4 text-[#7a594f]";
export function orderDetailStatusIconClassName(status: string) {
  const tone =
    status === "completed"
      ? "bg-[#dff5e8] text-[#27865c]"
      : status === "cancelled" || status === "rejected"
      ? "bg-[#ffdad6] text-[#ba1a1a]"
      : "bg-[#eeeef0] text-[#8e7164]";

  return joinClassNames(
    "inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full",
    tone
  );
}
export const orderDetailStatusDescriptionClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailCardClassName =
  `${orderPanelClassName} grid gap-[18px] p-[22px] [&_h2]:m-0 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:leading-[30px] [&_h2]:text-[#1a1c1e] [&_p]:m-0 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-[#5a4136] [&_small]:m-0 [&_small]:text-sm [&_small]:leading-5 [&_small]:text-[#5a4136] max-[640px]:p-4 max-[640px]:[&_h2]:text-xl max-[640px]:[&_h2]:leading-7`;
export const orderTrackingCardClassName = orderDetailCardClassName;
export const orderTrackingSummaryCardClassName = orderDetailCardClassName;
export const orderDetailCardTitleClassName =
  "m-0 flex items-center gap-2 text-[22px] font-extrabold leading-[30px] text-[#1a1c1e] max-[640px]:text-xl max-[640px]:leading-7";
export const orderDetailCardTextClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailCardSmallTextClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailTimelineClassName =
  "ml-3 grid gap-[18px] border-l-2 border-[#e2e2e5] pl-[22px]";
export function orderDetailTimelineStepClassName(
  state: "complete" | "current" | "pending"
) {
  return joinClassNames(
    "relative grid grid-cols-[auto_minmax(0,1fr)] gap-3 data-[state=complete]:opacity-100 data-[state=current]:opacity-100",
    state === "pending" && "opacity-75"
  );
}
export function orderDetailTimelineMarkerClassName(
  state: "complete" | "current" | "pending"
) {
  return joinClassNames(
    "absolute left-[-32px] top-0.5 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-[#ddc1b4] bg-white",
    state === "complete" && "border-[#7a3000] bg-[#7a3000] text-white",
    state === "current" &&
      "border-[#ff6b00] bg-[#ffdbcc] text-[#7a3000] shadow-[0_0_0_5px_#ffd3c6]"
  );
}
export const orderDetailTimelineTitleClassName =
  "m-0 mb-1 text-[15px] font-black leading-[22px] text-[#1a1c1e]";
export const orderDetailItemListClassName = "grid gap-3.5";
export const orderDetailItemClassName =
  "grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-[#eeeef0] pt-3.5 first:border-t-0 first:pt-0 max-[640px]:grid-cols-1 max-[640px]:items-start";
export const orderDetailItemImageClassName = "rounded-xl object-cover";
export const orderDetailItemNameClassName =
  "m-0 text-[15px] font-black leading-[22px] text-[#1a1c1e]";
export const orderDetailItemMetaClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailItemNoteClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailItemPriceClassName =
  "whitespace-nowrap text-[#1a1c1e] max-[640px]:justify-self-start";
export const orderDetailTotalRowsClassName = "grid gap-3";
export const orderDetailTotalRowClassName =
  "flex items-center justify-between gap-4 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:whitespace-nowrap [&_strong]:text-sm [&_strong]:font-bold [&_strong]:leading-5 [&_strong]:text-[#1a1c1e]";
export const orderDetailDiscountClassName = "text-[#2e7d32] font-bold";
export const orderDetailTotalClassName =
  "flex items-center justify-between gap-4 border-t border-dashed border-[#ddc1b4] pt-4 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:leading-8 [&_strong]:text-[#7a3000] max-[640px]:flex-col max-[640px]:items-start";
export const orderDetailPaymentNoteClassName =
  "flex items-center gap-2 rounded-xl bg-[#f3f3f6] p-3 font-extrabold text-[#5a4136] [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:font-semibold [&_small]:leading-4 [&_small]:text-[#5a4136]";
export const orderDetailCancelButtonClassName =
  "!min-h-[46px] !rounded-xl !border-[#ba1a1a] !font-black !normal-case !text-[#ba1a1a] hover:!border-[#93000a] hover:!bg-[#fff4f2] max-[900px]:!col-span-full";
export const orderDetailReviewButtonClassName =
  "!min-h-12 !rounded-xl !bg-[#a04100] !font-extrabold !normal-case !text-white !shadow-[0_10px_20px_rgba(122,48,0,0.16)] hover:!bg-[#7a3000]";
export const orderDetailReorderButtonClassName =
  "!min-h-12 !rounded-xl !border-[#8e7164] !font-extrabold !normal-case !text-[#7a3000] hover:!border-[#7a3000] hover:!bg-[#fff4ee]";

export const orderDetailCancelModalClassName =
  "fixed inset-0 z-[1400] grid place-items-center bg-[rgba(47,49,51,0.5)] p-4 backdrop-blur";
export const orderDetailCancelCardClassName =
  `${orderPanelClassName} grid w-[min(100%,420px)] justify-items-center gap-3.5 px-6 py-7 text-center [&_h2]:m-0 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-8 [&_h2]:text-[#1a1c1e] [&_p]:m-0 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-[#5a4136]`;
export const orderDetailCancelIconClassName =
  "inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a]";
export const orderDetailCancelTitleClassName =
  "m-0 text-2xl font-black leading-8 text-[#1a1c1e]";
export const orderDetailCancelTextClassName =
  "m-0 text-sm leading-5 text-[#5a4136]";
export const orderDetailCancelConfirmClassName =
  "!mt-2 !min-h-[46px] !w-full !rounded-full !bg-[#ba1a1a] !font-extrabold !normal-case !text-white hover:!bg-[#93000a]";
export const orderDetailCancelKeepClassName =
  "!min-h-[44px] !w-full !rounded-full !font-extrabold !normal-case !text-[#5a4136]";

export const orderTrackingMapClassName =
  "relative min-h-[380px] overflow-hidden rounded-[22px] border border-[rgba(156,202,255,0.58)] bg-[linear-gradient(135deg,rgba(208,228,255,0.86),rgba(255,247,242,0.94)),#f3f3f6] shadow-[0_18px_38px_rgba(0,74,123,0.1)] max-[640px]:min-h-80";
export const orderTrackingMapCanvasClassName =
  "absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.62)_2px,transparent_2px),linear-gradient(0deg,rgba(255,255,255,0.62)_2px,transparent_2px)] bg-[length:74px_74px]";
export function orderTrackingMapRouteClassName(
  route: "primary" | "secondary"
) {
  return joinClassNames(
    "absolute block h-2 rounded-full bg-[#0062a1] opacity-90",
    route === "primary"
      ? "left-[20%] top-1/2 w-[58%] -rotate-[19deg]"
      : "left-[38%] top-[36%] w-[34%] rotate-[28deg]"
  );
}
export function orderTrackingMapPinClassName(
  pin: "restaurant" | "courier" | "customer"
) {
  const position =
    pin === "restaurant"
      ? "left-[16%] top-[56%] bg-[#ffdbcc] text-[#7a3000] max-[640px]:left-[10%]"
      : pin === "courier"
      ? "left-[55%] top-[36%] bg-[#a04100] text-white"
      : "right-[13%] top-[25%] bg-[#d0e4ff] text-[#004a7b] max-[640px]:right-[8%]";

  return joinClassNames(
    "absolute inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white shadow-[0_12px_24px_rgba(26,28,30,0.16)]",
    position
  );
}
export const orderTrackingEtaCardClassName =
  "absolute left-[22px] top-[22px] grid gap-1 rounded-2xl border border-[#e2e2e5] bg-white/95 px-[18px] py-4 shadow-[0_16px_34px_rgba(26,28,30,0.12)] [&_small]:text-xs [&_small]:leading-4 [&_small]:text-[#5a4136] [&_span]:text-xs [&_span]:font-black [&_span]:uppercase [&_span]:leading-4 [&_span]:text-[#5a4136] [&_strong]:text-[28px] [&_strong]:font-extrabold [&_strong]:leading-[34px] [&_strong]:text-[#7a3000] max-[640px]:left-4 max-[640px]:right-4 max-[640px]:top-4";
export const orderTrackingEtaLabelClassName =
  "text-xs font-black uppercase leading-4 text-[#5a4136]";
export const orderTrackingEtaValueClassName =
  "text-[28px] font-extrabold leading-[34px] text-[#7a3000]";
export const orderTrackingEtaMetaClassName =
  "text-xs leading-4 text-[#5a4136]";
export const orderTrackingCardHeadingClassName =
  "flex items-center justify-between gap-3.5 [&_h2]:m-0 [&_h2]:mt-1 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-8 [&_h2]:text-[#1a1c1e] [&_span]:text-xs [&_span]:font-black [&_span]:uppercase [&_span]:leading-4 [&_span]:text-[#5a4136] [&>svg]:h-12 [&>svg]:w-12 [&>svg]:rounded-2xl [&>svg]:bg-[#ffdbcc] [&>svg]:p-[9px] [&>svg]:text-[#7a3000] max-[640px]:flex-col max-[640px]:items-start";
export const orderTrackingHeadingLabelClassName =
  "text-xs font-black uppercase leading-4 text-[#5a4136]";
export const orderTrackingHeadingTitleClassName =
  "m-0 mt-1 text-2xl font-black leading-8 text-[#1a1c1e]";
export const orderTrackingHeadingIconClassName =
  "h-12 w-12 rounded-2xl bg-[#ffdbcc] p-[9px] text-[#7a3000]";
export const orderTrackingTimelineClassName =
  "ml-3 grid gap-[18px] border-l-2 border-[#e2e2e5] pl-[22px]";
export function orderTrackingTimelineStepClassName(
  state: "complete" | "current" | "pending"
) {
  return joinClassNames(
    "relative grid grid-cols-[auto_minmax(0,1fr)] gap-3 data-[state=complete]:opacity-100 data-[state=current]:opacity-100",
    state === "pending" && "opacity-75"
  );
}
export function orderTrackingTimelineMarkerClassName(
  state: "complete" | "current" | "pending"
) {
  return joinClassNames(
    "absolute left-[-36px] top-[-2px] inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[#ddc1b4] bg-white text-[#8e7164]",
    state === "complete" && "border-[#7a3000] bg-[#7a3000] text-white",
    state === "current" &&
      "border-[#ff6b00] bg-[#ffdbcc] text-[#7a3000] shadow-[0_0_0_5px_#ffd3c6]"
  );
}
export const orderTrackingSummaryHeadingClassName =
  "flex items-center justify-between gap-3.5 border-b border-[#eeeef0] pb-3.5 [&_h2]:m-0 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:leading-[30px] [&_h2]:text-[#1a1c1e] max-[640px]:flex-col max-[640px]:items-start";
export const orderTrackingSupportButtonClassName =
  "!font-black !normal-case !text-[#7a3000]";
export const orderTrackingRestaurantClassName =
  "flex items-center justify-start gap-3.5";
export const orderTrackingRestaurantImageClassName =
  "h-12 w-12 shrink-0 rounded-xl object-cover";
export const orderTrackingRestaurantTitleClassName =
  "m-0 text-sm font-black leading-5 text-[#1a1c1e]";
export const orderTrackingRestaurantTextClassName =
  "m-0 mt-0.5 text-xs leading-4 text-[#5a4136]";
export const orderTrackingItemsClassName =
  "grid gap-3 border-y border-[#eeeef0] py-3.5";
export const orderTrackingItemClassName =
  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5 max-[640px]:grid-cols-1";
export const orderTrackingItemQuantityClassName =
  "rounded-lg bg-[#ffd3c6] px-[7px] py-1 text-xs font-black leading-4 text-[#7a3000]";
export const orderTrackingItemTitleClassName =
  "m-0 text-sm font-black leading-5 text-[#1a1c1e]";
export const orderTrackingItemNoteClassName =
  "m-0 mt-0.5 text-xs leading-4 text-[#5a4136]";
export const orderTrackingItemPriceClassName =
  "whitespace-nowrap text-sm font-bold leading-5 text-[#1a1c1e] max-[640px]:justify-self-start";
export const orderTrackingTotalsClassName = "grid gap-3";
export const orderTrackingTotalRowClassName =
  "flex items-center justify-between gap-4 [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:whitespace-nowrap [&_strong]:text-sm [&_strong]:font-bold [&_strong]:leading-5 [&_strong]:text-[#1a1c1e] max-[640px]:flex-col max-[640px]:items-start";
export const orderTrackingDiscountClassName = orderDetailDiscountClassName;
export const orderTrackingTotalClassName =
  "flex items-center justify-between gap-4 border-t border-dashed border-[#ddc1b4] pt-4 [&_span]:text-sm [&_span]:leading-5 [&_span]:text-[#5a4136] [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:leading-8 [&_strong]:text-[#7a3000] max-[640px]:flex-col max-[640px]:items-start";

export const orderReorderModalClassName =
  "fixed inset-0 z-[1400] flex animate-[orderModalFadeIn_0.25s_ease-out] items-center justify-center bg-[rgba(47,49,51,0.5)] p-4 backdrop-blur";
export const orderReorderCardClassName =
  "flex w-full max-w-[460px] animate-[orderModalSlideUp_0.3s_ease-out] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_48px_rgba(119,87,77,0.16)]";
export const orderReorderHeaderClassName =
  "flex items-start justify-between border-b border-[#eeeef0] px-6 pb-4 pt-5 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-7 [&_h2]:text-[#1a1c1e] [&_p]:m-0 [&_p]:mt-1 [&_p]:text-[13px] [&_p]:leading-[18px] [&_p]:text-[#5a4136]";
export const orderReorderTitleClassName =
  "m-0 text-xl font-bold leading-7 text-[#1a1c1e]";
export const orderReorderTextClassName =
  "m-0 mt-1 text-[13px] leading-[18px] text-[#5a4136]";
export const orderReorderCloseButtonClassName =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#5a4136] transition-colors duration-150 hover:bg-[#f3f3f6] hover:text-[#7a3000]";
export const orderReorderItemsClassName =
  "flex max-h-[380px] flex-col gap-3.5 overflow-y-auto px-6 py-5";
export function orderReorderItemClassName(isAvailable: boolean) {
  return joinClassNames(
    "flex items-center gap-3.5 rounded-[14px] border border-[#eeeef0] bg-[#f9f9fc] p-3 transition-[background-color,border-color,filter,opacity] duration-200 data-[availability=unavailable]:border-[#ddc1b4] data-[availability=unavailable]:bg-[#f3f3f6] data-[availability=unavailable]:opacity-60 data-[availability=unavailable]:grayscale",
    !isAvailable && "border-[#ddc1b4] bg-[#f3f3f6] opacity-60 grayscale"
  );
}
export const orderReorderItemMediaClassName =
  "relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[10px]";
export const orderReorderItemImageClassName = "object-cover";
export const orderReorderItemOverlayClassName =
  "absolute inset-0 z-10 flex items-center justify-center bg-[rgba(26,28,30,0.4)] text-white";
export const orderReorderItemInfoClassName =
  "flex flex-1 items-center justify-between gap-3";
export function orderReorderItemTitleClassName(isAvailable: boolean) {
  return joinClassNames(
    "m-0 text-[15px] font-semibold leading-5 text-[#1a1c1e]",
    !isAvailable && "text-[#8e7164] line-through"
  );
}
export function orderReorderItemPriceClassName(isAvailable: boolean) {
  return joinClassNames(
    "mt-0.5 block text-sm font-bold text-[#7a3000]",
    !isAvailable && "text-[#8e7164] line-through"
  );
}
export function orderReorderBadgeClassName(isAvailable: boolean) {
  return joinClassNames(
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
    isAvailable
      ? "bg-[#dff5e8] text-[#1b6f4b]"
      : "bg-[#ffdad6] text-[#ba1a1a]"
  );
}
export const orderReorderFooterClassName =
  "border-t border-[#eeeef0] bg-[#f9f9fc] px-6 pb-5 pt-4";
export const orderReorderTotalClassName =
  "mb-4 flex items-center justify-between [&_span]:text-[15px] [&_span]:font-medium [&_span]:text-[#5a4136] [&_strong]:text-[22px] [&_strong]:font-extrabold [&_strong]:text-[#7a3000]";
export const orderReorderActionsClassName = "flex gap-3";
export const orderReorderCancelButtonClassName =
  "!min-h-[46px] !flex-1 !rounded-full !border-2 !border-[#8e7164] !text-[15px] !font-bold !normal-case !text-[#5a4136] hover:!border-[#7a3000] hover:!bg-[#f3f3f6] hover:!text-[#7a3000]";
export const orderReorderConfirmButtonClassName =
  "!min-h-[46px] !flex-1 !rounded-full !bg-[#a04100] !text-[15px] !font-bold !normal-case !text-white hover:!bg-[#7a3000]";
