function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const routeNoticePageClassName =
  "grid min-h-screen place-items-center bg-[var(--eatnow-background)] px-4 py-12 text-[var(--eatnow-text-primary)]";

export const routeNoticeCardClassName =
  "w-full max-w-[560px] rounded-[var(--eatnow-radius-large-card)] border border-[var(--eatnow-border)] bg-[var(--eatnow-surface)] p-8 text-center shadow-[var(--eatnow-shadow-1)] max-[600px]:p-[22px]";

export const routeNoticeEyebrowClassName =
  "mb-2 text-[13px] font-bold uppercase text-[var(--eatnow-primary)]";

export const routeNoticeTitleClassName =
  "m-0 text-[32px] font-bold leading-10 text-[var(--eatnow-text-primary)] max-[600px]:text-[26px] max-[600px]:leading-[34px]";

export const routeNoticeMessageClassName =
  "mx-auto mt-3 max-w-[440px] text-base leading-6 text-[var(--eatnow-text-secondary)]";

export const routeNoticeActionsClassName =
  "mt-6 flex flex-wrap justify-center gap-3";

export function routeNoticeButtonClassName(
  variant: "primary" | "secondary" = "secondary"
) {
  return cx(
    "inline-flex min-h-11 items-center justify-center rounded-[var(--eatnow-radius-pill)] border border-[var(--eatnow-primary)] px-[18px] py-2.5 text-[15px] font-bold text-[var(--eatnow-primary)] no-underline transition-colors hover:bg-[rgba(217,71,32,0.08)] data-[variant=primary]:bg-[var(--eatnow-primary)] data-[variant=primary]:text-white data-[variant=primary]:hover:border-[var(--eatnow-primary-dark)] data-[variant=primary]:hover:bg-[var(--eatnow-primary-dark)]",
    variant === "primary" &&
      "bg-[var(--eatnow-primary)] text-white hover:border-[var(--eatnow-primary-dark)] hover:bg-[var(--eatnow-primary-dark)]"
  );
}
