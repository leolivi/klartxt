import type { ClassifiedCookie } from "../types/cookie-types"

export function calculateCookieRiskScore(cookies: ClassifiedCookie[]): number {
  if (cookies.length === 0) return 0

  let score = 0

  const thirdPartyCount = cookies.filter((c) => c.isThirdParty).length
  const advertisingCount = cookies.filter(
    (c) => c.category === "advertising",
  ).length
  const analyticsCount = cookies.filter(
    (c) => c.category === "analytics",
  ).length

  // third party cookies
  score += Math.min(thirdPartyCount * 10, 40)
  // advertising cookies
  score += Math.min(advertisingCount * 8, 30)
  // analytics cookies
  score += Math.min(analyticsCount * 4, 20)
  // general cookies
  score += Math.min(cookies.length * 1, 10)

  return Math.min(score, 100)
}
