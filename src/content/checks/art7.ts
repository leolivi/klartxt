import { CMP_SELECTORS } from "@/data/dsgvo/dsgvo-detectors";
import { isElementVisible } from "../utils/dom";
import type { Art7ContentResult } from "@/utils/types/dsgvo-types";

/* ---- Art. 7: Cookie Consent Banner Detection ---- */
// looks for cookie banner in DOM
function isBannerVisible(): boolean {
  const elements = document.querySelectorAll(CMP_SELECTORS.join(','));
  return Array.from(elements).some(el =>
    el instanceof HTMLElement && isElementVisible(el)
  );
}

export function checkArt7(): Art7ContentResult {
  return {
    bannerVisible: isBannerVisible(),
  };
}