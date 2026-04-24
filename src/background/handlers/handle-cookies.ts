import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import {
  classifyCookieCategory,
  extractRootDomain,
  mapToUserCategory,
} from "@/data/cookie-domains";

interface HandleCookies {
  tabUrl: string;
  onCookiesDetected: (cookies: ClassifiedCookie[]) => void;
}

export async function handleCookies({
  tabUrl,
  onCookiesDetected,
}: HandleCookies): Promise<void> {
  let url: URL;
  try {
    url = new URL(tabUrl);
  } catch {
    return;
  }

  const tabRootDomain = extractRootDomain(url.hostname);

  const allCookies = await chrome.cookies.getAll({});

  const pageCookies = allCookies.filter((c) => {
    const cookieDomain = c.domain.replace(/^\./, "");
    return (
      cookieDomain.includes(tabRootDomain) ||
      tabRootDomain.includes(extractRootDomain(cookieDomain))
    );
  });

  const classified: ClassifiedCookie[] = pageCookies.map((cookie) => {
    const cookieRootDomain = extractRootDomain(cookie.domain.replace(/^\./, ""));
    const isThirdParty = cookieRootDomain !== tabRootDomain;
    const category = classifyCookieCategory(cookie.name, cookieRootDomain, cookie);

    return {
      name: cookie.name,
      domain: cookie.domain,
      category,
      userCategory: mapToUserCategory(category),
      isThirdParty,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
    };
  });

  onCookiesDetected(classified);
}