export const CHECKED_ITEMS = [
  // TODO: update to correct domain href after deployment
  { key: "tracker",       href: "http://localhost:5174/trackers" },
  { key: "cookies",       href: "http://localhost:5174/cookies" },
  { key: "privacyPolicy", href: "http://localhost:5174/privacy-policy" },
  { key: "thirdParty",    href: "http://localhost:5174/third-party" },
] as const;

export type CheckedItemKey = typeof CHECKED_ITEMS[number]["key"];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
];