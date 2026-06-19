import fingerprintData from "@/data/trackers/fingerprint-domains.json";

/* ---- Art. 25: Privacy by Design ---- */

// Generated from DuckDuckGo Tracker Radar (DuckDuckGo, Inc., 2025) (f >= 2, medium/high fingerprinting score)
// rebuilt weekly alongside tracker-core.json / tracker-extended.json
const FINGERPRINT_DOMAIN_SET = new Set<string>(Object.keys(fingerprintData.domains));

// Tiny canvases (width/height <= 2) are a strong DOM-side fingerprinting signal
// legitimate UI canvases are always larger.
function hasTinyCanvasElement(): boolean {
  return Array.from(document.querySelectorAll("canvas")).some(
    c => c instanceof HTMLCanvasElement && (c.width <= 2 || c.height <= 2)
  );
}

// checks whether any <script src> on the page loads from a known fingerprinting domain
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

// detects screen property access in inline scripts (only covers inline scripts)
function hasScreenFingerprintingSignal(): boolean {
  return Array.from(document.querySelectorAll("script:not([src])")).some(s =>
    /screen\.(width|height|colorDepth|pixelDepth|availWidth|availHeight)/.test(s.textContent ?? "")
  );
}

// detects timezone API access in inline scripts (Intl.DateTimeFormat, getTimezoneOffset).
function hasTimezoneFingerprintingSignal(): boolean {
  return Array.from(document.querySelectorAll("script:not([src])")).some(s =>
    /Intl\.DateTimeFormat|getTimezoneOffset/.test(s.textContent ?? "")
  );
}

// detects AudioContext fingerprinting in inline scripts, used to extract unique audio processing characteristics.
function hasAudioFingerprintingSignal(): boolean {
  return Array.from(document.querySelectorAll("script:not([src])")).some(s =>
    /new\s+(Offline)?AudioContext/.test(s.textContent ?? "")
  );
}

// detects WebGL renderer info extraction in inline scripts, exposes GPU model and driver.
function hasWebGLFingerprintingSignal(): boolean {
  return Array.from(document.querySelectorAll("script:not([src])")).some(s =>
    /WEBGL_debug_renderer_info|getContext\(["']webgl/.test(s.textContent ?? "")
  );
}

// detects navigator hardware property access in inline scripts (CPU cores, memory, plugins).
function hasNavigatorFingerprintingSignal(): boolean {
  return Array.from(document.querySelectorAll("script:not([src])")).some(s =>
    /navigator\.(hardwareConcurrency|deviceMemory|plugins|mimeTypes)/.test(s.textContent ?? "")
  );
}

export function checkArt25(): { isHttps: boolean; fingerprintingDetected: boolean } {
  return {
    isHttps: window.location.protocol === "https:",
    fingerprintingDetected:
      hasTinyCanvasElement() ||
      hasFingerprintScript() ||
      hasScreenFingerprintingSignal() ||
      hasTimezoneFingerprintingSignal() ||
      hasAudioFingerprintingSignal() ||
      hasWebGLFingerprintingSignal() ||
      hasNavigatorFingerprintingSignal(),
  };
}
