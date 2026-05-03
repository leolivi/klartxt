/* ---- Art. 25: Privacy by Design ---- */
export function checkArt25(): { isHttps: boolean; fingerprintingDetected: boolean } {
  const hasCanvasFingerprinting = document.querySelectorAll("canvas").length > 0;

  const hasAudioFingerprinting =
    typeof AudioContext !== "undefined" ||
    typeof (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext !== "undefined";

  return {
    isHttps: window.location.protocol === "https:",
    fingerprintingDetected: hasCanvasFingerprinting || hasAudioFingerprinting,
  };
}