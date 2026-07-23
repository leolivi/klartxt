import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationDE from "../locales/de-localizations.json";
import translationEN from "../locales/en-localizations.json";
import translationFR from "../locales/fr-localizations.json";
import translationIT from "../locales/it-localizations.json";
import { LANGUAGE_STORAGE_KEY } from "../utils/types/footer-types";

const SUPPORTED_LANGUAGES = ["de", "fr", "it"];

// language handed off from the extension (e.g. ?lang=fr on a footer link) takes priority for
// this browsing session. Otherwise fall back to auto-detecting the browser's language.
const langParam = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
const sessionLang = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
const browserLang = (navigator.language ?? "en").split("-")[0].toLowerCase();

const defaultLang =
  [langParam, sessionLang, browserLang].find(lang => lang && SUPPORTED_LANGUAGES.includes(lang)) ?? "en";

if (langParam && SUPPORTED_LANGUAGES.includes(langParam)) {
  sessionStorage.setItem(LANGUAGE_STORAGE_KEY, langParam);
}

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: translationDE },
    en: { translation: translationEN },
    fr: { translation: translationFR },
    it: { translation: translationIT },
  },
  lng: defaultLang,
  keySeparator: false,
  interpolation: { escapeValue: false },
});

export default i18n;
