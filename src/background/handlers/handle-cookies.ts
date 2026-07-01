import {
  classifyCookieCategory,
  extractRootDomain,
  mapToUserCategory,
} from "@/data/cookies/cookie-domains"
import type { ClassifiedCookie } from "@/utils/types/cookie-types"

interface HandleCookies {
  tabUrl: string
  onCookiesDetected: (cookies: ClassifiedCookie[]) => void
}

export async function handleCookies({
  tabUrl,
  onCookiesDetected,
}: HandleCookies): Promise<void> {
  let url: URL
  try {
    url = new URL(tabUrl)
  } catch {
    return
  }

  const tabRootDomain = extractRootDomain(url.hostname)

  const allCookies = await chrome.cookies.getAll({})

  const pageCookies = allCookies.filter((c) => {
    const cookieDomain = c.domain.replace(/^\./, "")
    return (
      cookieDomain.includes(tabRootDomain) ||
      tabRootDomain.includes(extractRootDomain(cookieDomain))
    )
  })

  const seen = new Set<string>()
  const classified: ClassifiedCookie[] = []

  for (const cookie of pageCookies) {
    const key = `${cookie.name}||${cookie.domain.replace(/^\./, "")}`
    if (seen.has(key)) continue
    seen.add(key)

    const cookieRootDomain = extractRootDomain(cookie.domain.replace(/^\./, ""))
    const isThirdParty = cookieRootDomain !== tabRootDomain
    const category = classifyCookieCategory(
      cookie.name,
      cookieRootDomain,
      cookie,
    )

    classified.push({
      name: cookie.name,
      domain: cookie.domain,
      category,
      userCategory: mapToUserCategory(category),
      isThirdParty,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
    })
  }

  onCookiesDetected(classified)
}
