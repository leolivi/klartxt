import { CMP_SELECTORS } from "@/data/dsgvo/dsgvo-detectors";
import { isElementVisible } from "./dom";

let bannerShownReported = false;
let interactionReported = false;

export function reportBannerShown(): void {
  if (bannerShownReported) return;
  bannerShownReported = true;
  chrome.runtime.sendMessage({ type: "CONSENT_BANNER_SHOWN" }).catch(() => {});
}

export function reportInteraction(): void {
  if (interactionReported) return;
  interactionReported = true;
  chrome.runtime.sendMessage({ type: "CONSENT_BANNER_INTERACTED" }).catch(() => {});
}

export function findBannerElement(): HTMLElement | null {
  for (const sel of CMP_SELECTORS) {
    const el = document.querySelector(sel);
    if (el instanceof HTMLElement && isElementVisible(el)) return el;
  }
  return null;
}

export function attachInteractionListener(banner: HTMLElement): void {
  banner.addEventListener("click", reportInteraction, { once: true });
}

export function observeConsent(): void {
  // check banner on initial load
  const banner = findBannerElement();
  if (banner != null) {
    reportBannerShown();
    attachInteractionListener(banner);
    return;
  }
  // in @observeDomChanges.ts the banner is also observed
}