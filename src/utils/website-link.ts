// Function to carrie the extension's current UI language over to klartxt.app links so the website
export function localizeHref(href: string, lang: string, hash?: string): string {
  const url = new URL(href);
  url.searchParams.set("lang", lang);
  if (hash) url.hash = hash;
  return url.toString();
}
