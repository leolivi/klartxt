import { PRIVACY_PATTERNS } from "@/data/dsgvo/dsgvo-detectors";

/* ---- Art. 13/14: Datenschutzerklärung vorhanden ---- */
export function checkArt13_14(): boolean {
  return Array.from(document.querySelectorAll("a[href]")).some((a) => {
    const href = a.getAttribute("href") ?? "";
    const text = a.textContent ?? "";
    return PRIVACY_PATTERNS.test(href) || PRIVACY_PATTERNS.test(text);
  });
}