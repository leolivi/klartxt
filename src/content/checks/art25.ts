import fingerprintData from "@/data/trackers/fingerprint-domains.json";

/* ---- Art. 25: Privacy by Design ---- */

// Generated from DuckDuckGo Tracker Radar (f >= 2, medium/high fingerprinting score).
// Rebuilt weekly alongside tracker-core.json / tracker-extended.json.
const FINGERPRINT_DOMAIN_SET = new Set<string>(fingerprintData.domains);

// Tiny canvases (width/height <= 2) are a strong DOM-side fingerprinting signal;
// legitimate UI canvases are always larger.
function hasTinyCanvasElement(): boolean {
  return Array.from(document.querySelectorAll("canvas")).some(
    c => c instanceof HTMLCanvasElement && (c.width <= 2 || c.height <= 2)
  );
}

// Checks whether any <script src> on the page loads from a known fingerprinting domain.
function hasFingerprintScript(): boolean {
  return Array.from(document.querySelectorAll("script[src]")).some(s => {
    try {
      const hostname = new URL(s.getAttribute("src") ?? "", location.href).hostname.replace(/^www\./, "");
      const registrable = hostname.split(".").slice(-2).join(".");
      return FINGERPRINT_DOMAIN_SET.has(hostname) || FINGERPRINT_DOMAIN_SET.has(registrable);
    } catch {
      return false;
    }
  });
}

export function checkArt25(): { isHttps: boolean; fingerprintingDetected: boolean } {
  return {
    isHttps: window.location.protocol === "https:",
    fingerprintingDetected: hasTinyCanvasElement() || hasFingerprintScript(),
  };
}
