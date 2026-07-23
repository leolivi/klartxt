import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationDE from "./locales/de-localizations.json";
import translationEN from "./locales/en-localizations.json";
import translationFR from "./locales/fr-localizations.json";
import translationIT from "./locales/it-localizations.json";
import { LANGUAGE_STORAGE_KEY } from "./utils/types/footer-types";

const resources = {
  de: {
    translation: translationDE,
  },
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
  it: {
    translation: translationIT,
  },
};

const browserLang = (chrome.i18n?.getUILanguage?.() ?? navigator.language ?? "en").split("-")[0].toLowerCase();
const defaultLang = ["de", "fr", "it"].includes(browserLang) ? browserLang : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

// only present in the extension context
if (chrome.storage?.local) {
  chrome.storage.local.get<Record<string, string>>(LANGUAGE_STORAGE_KEY).then(result => {
    const storedLang = result[LANGUAGE_STORAGE_KEY];
    if (storedLang && storedLang !== i18n.language) {
      i18n.changeLanguage(storedLang);
    }
  });
}

export default i18n;
