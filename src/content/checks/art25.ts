/* ---- Art. 25: Privacy by Design ---- */
export function checkArt25(): boolean {
  return window.location.protocol === "https:";
}