// function to extract current domain and display in ui
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

// normalize cookie domain: strip leading dot and www. prefix
export function normalizeCookieDomain(domain: string): string {
  return domain.replace(/^\./, "").replace(/^www\./, "")
}
