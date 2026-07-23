export const CHECKED_ITEMS = [
  { key: "tracker", href: "https://klartxt.app/trackers" },
  { key: "cookies", href: "https://klartxt.app/cookies" },
  { key: "privacyPolicy", href: "https://klartxt.app/privacy-policy" },
  { key: "thirdParty", href: "https://klartxt.app/cookies" },
] as const;

export type CheckedItemKey = (typeof CHECKED_ITEMS)[number]["key"];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

// shared between src/i18n.ts (extension) and src/website/i18n.ts (website) so LanguageSwitcher
// can persist a language pick under the same key in whichever context it renders.
export const LANGUAGE_STORAGE_KEY = "klartxtLanguage";
