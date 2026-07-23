import { LANGUAGE_STORAGE_KEY, LANGUAGES } from "@/utils/types/footer-types";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);

    if (chrome.storage?.local) {
      //extension: persist the pick so it survives reopening the side panel
      chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: lng });
    } else {
      // website: keep the URL's ?lang= and sessionStorage in sync with the new pick
      sessionStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lng);
      window.history.replaceState(null, "", url);
    }
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger size="sm" aria-label={t("languageSwitcherLabel")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(({ code, label }) => (
          <SelectItem key={code} value={code}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default LanguageSwitcher;
