export const NAVIGATION_START_EVENT = "eatnow:navigation-start";

export function signalNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
  }
}
