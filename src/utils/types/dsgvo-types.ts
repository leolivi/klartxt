// DSGVO Category

export enum Articles {
  ART7 = "Art. 7",
  ART1314 = "Art. 13 and Art. 14",
  ART25 = "Art. 25",
}

export const DSGVO_KEYS = ["art7", "art13_14", "art25"] as const
export type DsgvoKey = (typeof DSGVO_KEYS)[number]

export enum SeverityLevel {
  FINE = "fine",
  SUSPICIOUS = "suspicious",
  CONFIRMED = "confirmed",
}

export interface DsgvoCheck {
  passed: boolean
  severity: SeverityLevel
  article: Articles
  title: string
  quickTitle: string
  explanation: string
  recommendation: string
  evidence: string[]
}

export type Art7ContentResult = {
  bannerVisible: boolean
}

export interface Art7Check extends DsgvoCheck {
  consentViolations: CookieViolation[]
  cookiesAfterConsent: CookieViolation[]
}

export interface Art13_14Check extends DsgvoCheck {
  privacyPolicyFound: boolean
  searchedLocations: string[]
}

export interface Art25Check extends DsgvoCheck {
  highRiskTrackerCount: number
  isHttps: boolean
  highRiskTrackers: string[]
  fingerprintingDetected: boolean
}

export type DsgvoResult = {
  art7: Art7Check
  art13_14: Art13_14Check
  art25: Art25Check
  checkedAt: number
}

export interface ContentScriptDsgvoResult {
  art7: {
    bannerVisible: boolean
    cookieCount: number
  }
  art13_14: {
    found: boolean
    searchedLocations: string[]
  }
  art25: {
    isHttps: boolean
    fingerprintingDetected: boolean
  }
}

export interface ConsentTimingResult {
  bannerShownAt: number | null
  interactedAt: number | null
  cookiesSetBeforeConsent: CookieViolation[]
  cookiesSetAfterConsent: CookieViolation[]
}

export interface CookieViolation {
  name: string
  domain: string
  setAt: number
}
