import type { SxProps, Theme } from "@mui/material/styles";

const panelClassName =
  "rounded-3xl border border-[rgba(221,193,180,0.42)] bg-white shadow-[0_12px_24px_rgba(119,87,77,0.08)]";
const textDark = "text-[#3b2016]";
const textMain = "text-[#1a1c1e]";
const textMuted = "text-[#70645d]";

export const pageClassName =
  "flex min-h-screen flex-col overflow-x-hidden bg-[#f9f9fc] text-[#1a1c1e]";
export const shellClassName =
  "mx-auto block w-[min(100%,1200px)] flex-1 px-6 pb-14 pt-10 max-[640px]:px-4 max-[640px]:pb-11 max-[640px]:pt-6";
export const layoutGridClassName =
  "grid grid-cols-[280px_minmax(0,1fr)] items-start gap-6 max-[1024px]:grid-cols-[250px_minmax(0,1fr)] max-[900px]:grid-cols-1";
export const mainColumnClassName = "min-w-0";
export const contentClassName = "min-w-0";

export const headerClassName =
  "mb-7 flex items-start justify-between gap-5 max-[640px]:mb-[18px]";
export const headerEyebrowClassName =
  "m-0 mb-1.5 text-[13px] font-bold uppercase leading-[18px] text-[#d94720]";
export const headerTitleClassName =
  "m-0 text-[32px] font-bold leading-10 text-[#1a1c1e] max-[640px]:text-[28px] max-[640px]:leading-9";
export const headerDescriptionClassName =
  "mt-2 max-w-[760px] text-base leading-6 text-[#3b2016]";
export const headerActionsClassName = "shrink-0";

export const sidebarClassName =
  "sticky top-24 flex flex-col gap-4 max-[900px]:hidden";
export const sidebarSummaryClassName =
  `${panelClassName} flex flex-col items-center gap-2 px-[18px] py-6 text-center`;
export const sidebarAvatarWrapClassName =
  "relative mb-2 grid h-[104px] w-[104px] place-items-center";
export const sidebarAvatarClassName =
  "!h-24 !w-24 !border-4 !border-[#f9f9fc] !bg-[linear-gradient(135deg,#7a3000,#ff6b00)] !text-[30px] !font-bold !text-white !shadow-[0_8px_18px_rgba(119,87,77,0.16)]";
export const sidebarVerifiedClassName =
  "absolute bottom-2 right-1 z-[2] grid h-[34px] w-[34px] place-items-center rounded-full border-[3px] border-white bg-[#7a3000] text-white shadow-[0_6px_12px_rgba(122,48,0,0.22)]";
export const sidebarNameClassName =
  "max-w-full [overflow-wrap:anywhere]";
export const sidebarEmailClassName =
  "max-w-full [overflow-wrap:anywhere]";
export const roleChipClassName =
  "!h-[26px] !rounded-full !bg-[#ffd3c6] !text-[11px] !font-bold !uppercase !tracking-normal !text-[#8a3a20] [&_.MuiChip-label]:!px-3";
export const sidebarNavClassName =
  `${panelClassName} overflow-hidden py-2`;
export const sidebarLinksClassName = "flex flex-col";
export function sidebarLinkClassName(isSelected: boolean) {
  return `flex min-h-[54px] items-center gap-3.5 px-[18px] py-3 text-[15px] font-semibold leading-[22px] no-underline hover:bg-[#f3f3f6] hover:text-[#7a3000] data-[selected=true]:bg-[#fff0eb] data-[selected=true]:text-[#7a3000] ${
    isSelected ? "bg-[#fff0eb] text-[#7a3000]" : "text-[#3b2016]"
  }`;
}
export const sidebarDividerClassName =
  "!my-2 !border-[rgba(221,193,180,0.42)]";
export const sidebarLogoutClassName =
  "!min-h-[52px] !justify-start !rounded-none !px-[18px] !py-3";
export const mobileNavClassName =
  "mb-5 hidden rounded-[20px] border border-[rgba(221,193,180,0.48)] bg-white shadow-[0_8px_18px_rgba(119,87,77,0.06)] max-[900px]:block";
export const mobileNavSx: SxProps<Theme> = {
  "& .MuiTabs-flexContainer": { minHeight: 52 },
  "& .MuiTab-root": {
    minHeight: 52,
    color: "#3b2016",
    fontWeight: 700,
    textTransform: "none",
  },
};

export const profileCardClassName = `${panelClassName} overflow-hidden`;
export const profileFeedbackClassName = "!mx-10 !mb-0 !mt-6 max-[640px]:!mx-[18px] max-[640px]:!mt-[18px]";
export const profileAvatarSectionClassName =
  "border-b border-[rgba(221,193,180,0.5)] px-10 pb-8 pt-9 max-[1024px]:px-7 max-[640px]:px-[18px] max-[640px]:py-[22px]";
export const profileSectionTitleClassName = "!mb-[26px]";
export const profileAvatarActionsClassName =
  "flex items-center gap-7 max-[640px]:items-start max-[640px]:flex-col";
export const profileAvatarPreviewClassName =
  "!h-16 !w-16 !shrink-0 !border-[5px] !border-[#ffd3c6] !bg-[linear-gradient(135deg,#7a3000,#ff6b00)] !text-[22px] !font-bold !text-white";
export const hiddenInputClassName = "hidden";
export const profileAvatarButtonsClassName =
  "flex flex-wrap gap-4 max-[640px]:w-full [&_.MuiButton-root]:max-[640px]:flex-[1_1_100%]";
export const profileInfoSectionClassName =
  "px-10 pb-9 pt-8 max-[1024px]:px-7 max-[640px]:px-[18px] max-[640px]:py-[22px]";
export const profileFormGridClassName =
  "grid grid-cols-2 gap-x-7 gap-y-[26px] max-[640px]:grid-cols-1";
export const profileFieldClassName =
  "flex min-w-0 flex-col gap-2";
export const profileFieldLabelClassName =
  "ml-1 text-[13px] font-bold leading-[18px] text-[#3b2016]";
export const profileReadonlyValueClassName =
  "flex min-h-14 items-center gap-2.5 rounded-2xl border border-[#ddc1b4] bg-[#e8e8ea] px-[18px] text-base leading-6 text-[#3b2016] [overflow-wrap:anywhere] [&_svg]:shrink-0 [&_svg]:text-[22px] [&_svg]:text-[#8a7267]";
export const profileStatusDotClassName =
  "h-2.5 w-2.5 shrink-0 rounded-full bg-[#12b981]";
export const profileActionsFooterClassName =
  "mt-14 flex justify-end gap-3 border-t border-[rgba(221,193,180,0.5)] pt-7 max-[640px]:mt-9 max-[640px]:w-full max-[640px]:flex-col-reverse [&_.MuiButton-root]:max-[640px]:flex-[1_1_100%]";
export const profileFieldSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    border: "1px solid #ddc1b4",
    borderRadius: 16,
    color: "#3b2016",
    background: "#fffdfc",
    fontSize: 16,
    lineHeight: "24px",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: 0 },
  "& .MuiOutlinedInput-input": {
    color: "#3b2016",
    fontSize: 16,
    lineHeight: "24px",
    padding: "15px 18px",
  },
  "& .MuiFormHelperText-root": { margin: "6px 4px 0" },
};

export const settingsStackClassName =
  "flex flex-col gap-5 [&_.MuiAlert-root]:rounded-2xl";
export const settingsSectionCardClassName =
  `${panelClassName} overflow-hidden p-7 max-[640px]:px-[18px] max-[640px]:py-[22px]`;
export const settingsCardHeaderClassName =
  "mb-6 flex items-start gap-3.5 max-[640px]:flex-col";
export const settingsCardHeaderCenterClassName =
  "mb-6 flex items-center gap-3.5 max-[640px]:items-start max-[640px]:flex-col [&>div]:min-w-0 [&>div]:flex-auto";
export const settingsCardIconClassName =
  "grid h-[42px] w-[42px] shrink-0 place-items-center rounded-2xl bg-[#fff0eb] text-[#7a3000] [&_svg]:text-2xl";
export const settingsEyebrowClassName =
  "m-0 mb-1 text-xs font-extrabold uppercase leading-4 text-[#d94720]";
export const settingsTitleClassName =
  "!m-0 !font-[var(--font-baloo),var(--font-be-vietnam),sans-serif] !text-[22px] !font-extrabold !leading-[30px] !text-[#1a1c1e] max-[760px]:!text-xl max-[760px]:!leading-7";
export const settingsSoftChipClassName =
  "!ml-auto !h-[30px] !rounded-full !bg-[#fff0eb] !text-xs !font-extrabold !text-[#7a3000] max-[640px]:!ml-0";
export const settingsActionsRowClassName =
  "mt-6 flex justify-end gap-3 max-[640px]:mt-9 max-[640px]:w-full max-[640px]:flex-col-reverse [&_.MuiButton-root]:max-[640px]:flex-[1_1_100%]";

export const securityFormGridClassName =
  "grid grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)] gap-x-5 gap-y-[18px] max-[1024px]:grid-cols-1 [&>.MuiFormControl-root]:col-start-1";
export const securityStrengthCardClassName =
  "col-start-2 row-span-3 row-start-1 min-w-0 rounded-[18px] border border-[rgba(221,193,180,0.55)] bg-[#fff8f5] p-[18px] max-[1024px]:col-start-1 max-[1024px]:row-auto";
export const securityStrengthHeadingClassName =
  "flex justify-between gap-3 text-sm leading-5 text-[#3b2016] [&_strong]:text-[#7a3000]";
export const securityStrengthMeterClassName =
  "!my-3.5 !mb-4 !h-2 !rounded-full !bg-[#f1d8ce] [&_.MuiLinearProgress-bar]:!rounded-full [&_.MuiLinearProgress-bar]:!bg-[#d94720]";
export const securityChecklistClassName =
  "m-0 flex list-none flex-col gap-2.5 p-0";
export function securityChecklistItemClassName(isDone: boolean) {
  return `flex items-center gap-2 text-[13px] font-bold leading-[18px] ${
    isDone ? "text-[#0f9f62] [&_svg]:text-[#0f9f62]" : "text-[#8a7267] [&_svg]:text-[#c7b3aa]"
  }`;
}
export const securityActionsClassName =
  "col-span-full mt-1.5 flex justify-end gap-3 max-[640px]:mt-9 max-[640px]:w-full max-[640px]:flex-col-reverse [&_.MuiButton-root]:max-[640px]:flex-[1_1_100%]";
export const securitySessionListClassName =
  "flex items-center justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col";
export const securitySessionCardClassName =
  "flex min-w-0 flex-auto items-center justify-between gap-[18px] rounded-[18px] border border-[rgba(221,193,180,0.55)] bg-[#fffdfc] px-[18px] py-4 max-[640px]:items-start max-[640px]:flex-col [&_div]:flex [&_div]:min-w-0 [&_div]:flex-col [&_div]:gap-1";
export const compactStrongClassName =
  "text-sm font-extrabold leading-5 text-[#3b2016]";
export const compactMutedClassName =
  "text-[13px] leading-5 text-[#70645d]";

export const preferencesGridClassName =
  "grid grid-cols-3 gap-3.5 max-[1024px]:grid-cols-1";
export const preferenceToggleCardClassName =
  "grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[18px] border border-[rgba(221,193,180,0.55)] bg-[#fffdfc] p-4 max-[640px]:flex max-[640px]:items-start max-[640px]:flex-col";
export const preferenceToggleIconClassName = settingsCardIconClassName;
export const preferenceDisplayGridClassName =
  "grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-end gap-[18px] max-[640px]:grid-cols-1";
export const preferenceFieldClassName =
  "flex min-w-0 flex-col gap-2";
export const preferenceSegmentClassName =
  "!w-full !rounded-2xl !border !border-[rgba(221,193,180,0.7)] !bg-[#fffdfc] !p-1 max-[640px]:!flex-col max-[640px]:!items-stretch [&_.Mui-selected]:!bg-[#7a3000] [&_.Mui-selected]:!text-white [&_.MuiToggleButton-root]:!min-h-11 [&_.MuiToggleButton-root]:!flex-1 [&_.MuiToggleButton-root]:!rounded-xl [&_.MuiToggleButton-root]:!border-0 [&_.MuiToggleButton-root]:!font-extrabold [&_.MuiToggleButton-root]:!normal-case [&_.MuiToggleButton-root]:!text-[#3b2016]";
export const settingsInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    color: "#3b2016",
    background: "#fffdfc",
  },
};

export const addressBookLayoutClassName =
  "grid grid-cols-[minmax(0,1fr)_minmax(380px,1.05fr)] items-start gap-5 max-[1024px]:grid-cols-1";
export const addressCardListClassName = "flex flex-col gap-3";
export function addressCardClassName(isDefault: boolean) {
  return `flex min-w-0 flex-col gap-3.5 rounded-[18px] border border-[rgba(221,193,180,0.55)] bg-[#fffdfc] p-4 data-[default=true]:border-[rgba(15,159,98,0.32)] data-[default=true]:bg-[#fcfffd] ${
    isDefault ? "border-[rgba(15,159,98,0.32)] bg-[#fcfffd]" : ""
  }`;
}
export const addressBodyClassName = "min-w-0";
export const addressToplineClassName =
  "mb-2 flex items-start justify-between gap-3 [&_strong]:min-w-0 [&_strong]:[overflow-wrap:anywhere]";
export const addressDefaultChipClassName =
  "!h-[26px] !rounded-full !bg-[#ccebd8] !text-[11px] !font-extrabold !text-[#0f5132]";
export const addressTextClassName =
  "m-0 block text-[13px] leading-5 text-[#70645d] [overflow-wrap:anywhere]";
export const addressPhoneClassName =
  "m-0 mt-1 block text-[13px] font-bold leading-5 text-[#70645d]";
export const addressNoteClassName =
  "m-0 mt-1.5 block text-[13px] leading-5 text-[#8a7267]";
export const addressActionsClassName =
  "flex flex-wrap gap-1.5 border-t border-[rgba(221,193,180,0.45)] pt-3 [&_.MuiButton-root]:min-w-0 [&_.MuiButton-root]:whitespace-nowrap [&_.MuiButton-root]:px-2.5";
export const addressEmptyStateClassName =
  "grid min-h-[220px] place-items-center content-center gap-2 rounded-[18px] border border-dashed border-[rgba(122,48,0,0.28)] bg-[#fff8f5] p-7 text-center [&_p]:m-0 [&_p]:max-w-xs [&_p]:text-[13px] [&_p]:leading-5 [&_p]:text-[#70645d] [&_svg]:text-[34px] [&_svg]:text-[#7a3000]";
export const addressFormGridClassName =
  "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1";
export const wideFieldClassName = "col-span-full";
export const addressDefaultToggleClassName = "mt-4 text-[#3b2016]";

export const sellerPageClassName = "flex flex-col gap-5";
export const sellerPanelClassName = panelClassName;
export const sellerHeroPanelClassName =
  `${panelClassName} grid grid-cols-[minmax(0,1fr)_280px] items-stretch gap-[22px] overflow-hidden p-7 max-[1024px]:grid-cols-1 max-[760px]:p-5`;
export const sellerHeroCopyClassName = "min-w-0";
export const sellerHeroIconClassName =
  "mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-2xl bg-[#fff0eb] text-[#7a3000] [&_svg]:text-[28px]";
export const sellerEyebrowClassName =
  "m-0 mb-1.5 text-xs font-extrabold uppercase leading-4 tracking-normal text-[#d94720]";
export const sellerHeroTitleClassName =
  "!m-0 !font-[var(--font-baloo),var(--font-be-vietnam),sans-serif] !text-[30px] !font-extrabold !leading-[38px] !text-[#1a1c1e] max-[760px]:!text-[26px] max-[760px]:!leading-[34px]";
export const sellerSectionTitleClassName =
  "!m-0 !font-[var(--font-baloo),var(--font-be-vietnam),sans-serif] !text-[22px] !font-extrabold !leading-[30px] !text-[#1a1c1e] max-[760px]:!text-xl max-[760px]:!leading-7";
export const sellerCopyClassName =
  "text-sm leading-[22px] text-[#70645d]";
export const sellerHeroCopyTextClassName =
  "mt-2.5 max-w-[620px] text-sm leading-[22px] text-[#70645d]";
export const sellerStatusCardClassName =
  "flex min-w-0 flex-col justify-center gap-2.5 bg-[#fff8f5] p-[18px] max-[1024px]:justify-start";
export const sellerStatusLabelClassName =
  "text-[13px] font-extrabold leading-[18px] text-[#3b2016]";
export function sellerStatusChipClassName(
  tone: "neutral" | "warning" | "success" | "error"
) {
  const toneClassNames = {
    neutral: "!bg-[#f1ebe7] !text-[#3b2016]",
    warning: "!bg-[#ffe4b8] !text-[#3b2016]",
    success: "!bg-[#ccebd8] !text-[#0f5132]",
    error: "!bg-[#ffd8d8] !text-[#8a1c1c]",
  };

  return `!h-[30px] !w-fit !rounded-full !font-extrabold !tracking-normal ${toneClassNames[tone]}`;
}
export const sellerStatusNoteClassName =
  "m-0 border-t border-[rgba(221,193,180,0.6)] pt-2 text-sm leading-[22px] text-[#70645d]";
export const sellerFeedbackClassName = "!rounded-2xl";
export const sellerPortalCardClassName =
  `${panelClassName} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] px-6 py-[22px] max-[1024px]:grid-cols-1 max-[760px]:p-5`;
export const sellerPortalRestaurantsClassName =
  "flex flex-wrap justify-end gap-2 max-[1024px]:justify-start [&_span]:inline-flex [&_span]:min-h-[30px] [&_span]:items-center [&_span]:rounded-full [&_span]:bg-[#fff0eb] [&_span]:px-3 [&_span]:py-[5px] [&_span]:text-[13px] [&_span]:font-extrabold [&_span]:text-[#7a3000]";
export const sellerPortalLinkClassName =
  "col-start-2 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[14px] bg-[#7a3000] px-4 py-2.5 text-sm font-extrabold text-white no-underline hover:bg-[#9a3b00] max-[1024px]:col-auto max-[1024px]:w-fit max-[760px]:w-full";
export const sellerApplicationLayoutClassName =
  "grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 max-[1024px]:grid-cols-1";
export const sellerApplicationFormClassName =
  `${panelClassName} overflow-hidden`;
export const sellerFormSectionClassName =
  "border-b border-[rgba(221,193,180,0.5)] px-7 py-[26px] max-[760px]:p-5";
export const sellerSectionHeadingClassName =
  "mb-5 flex items-start gap-3 [&>svg]:mt-0.5 [&>svg]:h-[26px] [&>svg]:w-[26px] [&>svg]:shrink-0 [&>svg]:text-[#7a3000]";
export const sellerFormGridClassName =
  "grid grid-cols-2 gap-[18px] max-[760px]:grid-cols-1";
export const sellerFormActionsClassName =
  "flex flex-wrap justify-end gap-3 px-7 pb-[26px] pt-[22px] max-[760px]:flex-col max-[760px]:p-5 [&_.MuiButton-root]:min-h-11 [&_.MuiButton-root]:rounded-[14px] [&_.MuiButton-root]:font-extrabold [&_.MuiButton-root]:normal-case [&_.MuiButton-root]:max-[760px]:w-full";
export const sellerSideColumnClassName =
  "flex min-w-0 flex-col gap-5";
export const sellerSideCardClassName =
  `${panelClassName} p-[22px] max-[760px]:p-5`;
export const sellerChecklistClassName =
  "mt-3.5 flex flex-col gap-3";
export const sellerChecklistItemClassName =
  "flex items-center gap-2.5 [&_p]:m-0 [&_p]:text-sm [&_p]:font-bold [&_p]:leading-5 [&_p]:text-[#3b2016]";
export function sellerChecklistIconClassName(isDone: boolean) {
  return `grid h-7 w-7 shrink-0 place-items-center rounded-full ${
    isDone ? "bg-[#0f8a4c] text-white" : "bg-[#f3f3f6] text-[#8a7267]"
  }`;
}
export const sellerTimelineClassName =
  "m-0 flex list-none flex-col gap-3.5 p-0";
export const sellerTimelineItemClassName =
  "relative pl-[18px] before:absolute before:left-0 before:top-[7px] before:h-2 before:w-2 before:rounded-full before:bg-[#d94720] before:content-[''] [&_p]:m-0 [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-[22px] [&_p]:text-[#70645d] [&_span]:block [&_span]:text-sm [&_span]:font-extrabold [&_span]:leading-5 [&_span]:text-[#3b2016] [&_time]:block [&_time]:text-xs [&_time]:leading-[18px] [&_time]:text-[#8a7267]";
export const sellerEmptyNoteClassName =
  "m-0 text-sm leading-[22px] text-[#70645d]";
export const sellerInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    minHeight: 54,
    borderRadius: 16,
    background: "#fffdfc",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ddc1b4",
  },
  "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
    color: "#3b2016",
  },
};

export { panelClassName, textDark, textMain, textMuted };
