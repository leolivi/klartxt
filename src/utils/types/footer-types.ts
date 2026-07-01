export const CHECKED_ITEMS = [
  { key: "tracker", href: "https://klartxt.app/trackers" },
  { key: "cookies", href: "https://klartxt.app/cookies" },
  { key: "privacyPolicy", href: "https://klartxt.app/privacy-policy" },
  { key: "thirdParty", href: "https://klartxt.app/cookies" },
] as const

export type CheckedItemKey = (typeof CHECKED_ITEMS)[number]["key"]

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
]
