import type { SxProps, Theme } from "@mui/material/styles";

export const pageShellClassName =
  "grid min-h-screen w-full place-items-center overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,184,77,0.18),transparent_34%),linear-gradient(120deg,rgba(255,248,244,0.92),rgba(255,255,255,0.86)),var(--eatnow-background)] px-6 py-8 max-[960px]:px-[18px] max-[960px]:py-6 max-[720px]:items-start max-[720px]:px-4 max-[420px]:p-4";

export const cardClassNames = {
  login:
    "grid w-[min(100%,1120px)] min-h-[568px] grid-cols-[minmax(390px,0.95fr)_minmax(440px,1fr)] overflow-hidden rounded-[var(--eatnow-radius-dialog)] border border-[rgba(234,223,216,0.76)] bg-[var(--eatnow-surface)] shadow-[var(--eatnow-shadow-3)] max-[960px]:min-h-[620px] max-[960px]:grid-cols-[minmax(280px,0.78fr)_minmax(390px,1fr)] max-[720px]:min-h-0 max-[720px]:grid-cols-1 max-[720px]:rounded-[var(--eatnow-radius-large-card)]",
  register:
    "grid w-[min(100%,1180px)] min-h-[704px] grid-cols-[minmax(360px,0.93fr)_minmax(430px,1fr)] overflow-hidden rounded-[var(--eatnow-radius-dialog)] border border-[rgba(234,223,216,0.76)] bg-[var(--eatnow-surface)] shadow-[var(--eatnow-shadow-3)] max-[960px]:min-h-[620px] max-[960px]:grid-cols-[minmax(280px,0.78fr)_minmax(390px,1fr)] max-[720px]:min-h-0 max-[720px]:grid-cols-1 max-[720px]:rounded-[var(--eatnow-radius-large-card)]",
};

export const brandPanelClassName =
  "relative isolate min-h-full overflow-hidden bg-[#2d211c] max-[720px]:hidden";
export const brandImageClassName = "object-cover object-center";
export const brandOverlayClassName =
  "absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(17,13,10,0.08)_0%,rgba(17,13,10,0.3)_48%,rgba(17,13,10,0.78)_100%),linear-gradient(90deg,rgba(17,13,10,0.28),transparent_60%)]";
export const brandContentClassName =
  "absolute bottom-11 left-10 right-10 z-[2] text-white max-[960px]:bottom-[34px] max-[960px]:left-7 max-[960px]:right-7";
export const wordmarkClassName =
  "inline-flex items-center gap-2 text-[32px] font-extrabold leading-none text-[var(--eatnow-primary)] max-[960px]:text-[28px] max-[720px]:text-[26px]";
export const mobileBrandClassName = "mb-6 hidden max-[720px]:block";
export const brandTaglineClassName =
  "m-0 mt-7 max-w-[390px] text-[28px] font-extrabold leading-9 text-white max-[960px]:text-[25px] max-[960px]:leading-[33px]";
export const brandSubtitleClassName =
  "m-0 mt-4 max-w-[390px] text-[15px] font-semibold leading-[23px] text-[rgba(255,255,255,0.92)]";

export const formPanelClassNames = {
  login:
    "grid min-h-full min-w-0 place-items-center bg-[var(--eatnow-surface)] px-8 py-11 max-[960px]:px-7 max-[960px]:py-10 max-[720px]:px-[18px] max-[720px]:pb-8 max-[720px]:pt-7 max-[420px]:px-4",
  register:
    "grid min-h-full min-w-0 place-items-center bg-[var(--eatnow-surface)] px-8 py-[52px] max-[960px]:px-7 max-[960px]:py-10 max-[720px]:px-[18px] max-[720px]:pb-8 max-[720px]:pt-7 max-[420px]:px-4",
};
export const formContentClassNames = {
  login: "w-[min(100%,420px)] max-[720px]:w-full",
  register: "w-[min(100%,460px)] max-[720px]:w-full",
};

export const formClassName = "w-full";
export const registerFormClassName = "w-full max-w-[430px] max-[720px]:max-w-none";
export const recoveryFormClassName = "w-full max-w-[420px] max-[720px]:max-w-none";
export const titleClassName =
  "m-0 mb-2 text-[32px] font-extrabold leading-10 text-[var(--eatnow-text-primary)] max-[720px]:text-[28px] max-[720px]:leading-9";
export const descriptionClassName = "m-0 text-[var(--eatnow-text-secondary)]";
export const fieldRowClassName =
  "mb-1.5 flex min-h-6 items-center justify-between gap-4";
export const fieldLabelClassName =
  "text-[13px] font-bold leading-[18px] text-[var(--eatnow-text-primary)]";
export const inlineLinkClassName =
  "font-bold text-[var(--eatnow-primary-dark)]";
export const textLinkClassName =
  "font-bold text-[var(--eatnow-primary-dark)] underline underline-offset-[3px] hover:text-[var(--eatnow-primary)]";
export const iconLinkClassName =
  "inline-flex items-center justify-center gap-1.5 font-bold text-[var(--eatnow-primary-dark)] underline underline-offset-[3px] hover:text-[var(--eatnow-primary)]";
export const buttonLinkClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-[var(--eatnow-radius-control)] bg-[var(--eatnow-primary)] px-[18px] py-3 text-center font-bold text-white shadow-[0_12px_26px_rgba(217,71,32,0.18)] hover:bg-[var(--eatnow-primary-dark)]";
export const otpCopyClassName =
  "text-center text-sm leading-[22px] text-[var(--eatnow-text-secondary)]";
export const otpActionsClassName = "flex flex-col items-center gap-3";
export const recoveryActionsClassName =
  "flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-center";
export const centeredRecoveryActionsClassName =
  "flex items-center justify-center gap-3 max-[720px]:flex-col";

export const formSx: SxProps<Theme> = {
  "& .MuiFormControlLabel-root": {
    alignItems: "flex-start",
    marginLeft: "-8px",
  },
  "& .MuiFormControlLabel-label": {
    color: "var(--eatnow-text-secondary)",
    fontSize: "14px",
    lineHeight: "22px",
    paddingTop: "9px",
  },
  "& .MuiDivider-root": {
    color: "var(--eatnow-text-secondary)",
  },
  "& .MuiDivider-root::before, & .MuiDivider-root::after": {
    borderColor: "var(--eatnow-border)",
  },
};

export const recoveryNoteSx: SxProps<Theme> = {
  "& .MuiAlert-message": {
    color: "var(--eatnow-text-secondary)",
    fontSize: "14px",
    lineHeight: "22px",
  },
};
