import { BANNER_FALLBACK_SELECTORS, CMP_SELECTORS } from "@/data/dsgvo/dsgvo-detectors";
import type { Art7ContentResult } from "@/utils/types/dsgvo-types";
import { isElementVisible } from "../utils/dom";

/* ---- Art. 7: Cookie Consent Banner Detection ---- */
// looks for cookie banner in DOM
function isBannerVisible(): boolean {
  const cmpElements = document.querySelectorAll(CMP_SELECTORS.join(","));
  if (Array.from(cmpElements).some(el => el instanceof HTMLElement && isElementVisible(el))) {
    return true;
  }
  // fallbacks for banners not covered by Consent-O-Matic rules
  const fallbackElements = document.querySelectorAll(BANNER_FALLBACK_SELECTORS.join(","));
  return Array.from(fallbackElements).some(el => {
    if (!(el instanceof HTMLElement) || !isElementVisible(el)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width >= 200 && rect.height >= 50;
  });
}

export function checkArt7(): Art7ContentResult {
  return {
    bannerVisible: isBannerVisible(),
  };
}
