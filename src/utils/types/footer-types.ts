export const CHECKED_ITEMS = [
  { key: "tracker",       href: "" },
  { key: "cookies",       href: "" },
  { key: "privacyPolicy", href: "" },
  { key: "thirdParty",    href: "" },
] as const;

export type CheckedItemKey = typeof CHECKED_ITEMS[number]["key"];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
];