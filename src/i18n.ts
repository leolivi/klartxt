import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationDE from './locales/de-localizations.json';
import translationEN from './locales/en-localizations.json';
import translationFR from './locales/fr-localizations.json';
import translationIT from './locales/it-localizations.json';

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

const browserLang = (chrome.i18n?.getUILanguage?.() ?? navigator.language ?? 'en').split('-')[0].toLowerCase();
const defaultLang = ['de', 'fr', 'it'].includes(browserLang) ? browserLang : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;