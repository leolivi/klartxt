// strip a leading "www." prefix from a hostname
export function stripWww(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

// function to extract current domain and display in ui
export function extractDomain(url: string): string {
  try {
    return stripWww(new URL(url).hostname);
  } catch {
    return "";
  }
}

// normalize cookie domain: strip leading dot and www. prefix
export function normalizeCookieDomain(domain: string): string {
  return stripWww(domain.replace(/^\./, ""));
}
