import { classifyCookieCategory, extractRootDomain, mapToUserCategory } from "@/data/cookies/cookie-domains";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";

interface HandleCookies {
  tabUrl: string;
  // Third-party cookies are observed via chrome.cookies.onChanged (since this tab's scan
  // started), not in chrome.cookies.getAll()
  // domain match. getAll() returns every cookie in the whole browser profile, so matching by
  // domain alone would misattribute unrelated cookies (e.g. an already-logged-in Google account
  // session) to this page just because they share a root domain with something on it.
  thirdPartyCookies: chrome.cookies.Cookie[];
  onCookiesDetected: (cookies: ClassifiedCookie[]) => void;
}

export async function handleCookies({ tabUrl, thirdPartyCookies, onCookiesDetected }: HandleCookies): Promise<void> {
  let url: URL;
  try {
    url = new URL(tabUrl);
  } catch {
    return;
  }

  const tabRootDomain = extractRootDomain(url.hostname);

  const allCookies = await chrome.cookies.getAll({});
  const firstPartyCookies = allCookies.filter(c => extractRootDomain(c.domain.replace(/^\./, "")) === tabRootDomain);

  const seen = new Set<string>();
  const classified: ClassifiedCookie[] = [];

  for (const cookie of [...firstPartyCookies, ...thirdPartyCookies]) {
    const key = `${cookie.name}||${cookie.domain.replace(/^\./, "")}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const cookieRootDomain = extractRootDomain(cookie.domain.replace(/^\./, ""));
    const isThirdParty = cookieRootDomain !== tabRootDomain;
    const category = classifyCookieCategory(cookie.name, cookieRootDomain);

    classified.push({
      name: cookie.name,
      domain: cookie.domain,
      category,
      userCategory: mapToUserCategory(category),
      isThirdParty,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
    });
  }

  onCookiesDetected(classified);
}
