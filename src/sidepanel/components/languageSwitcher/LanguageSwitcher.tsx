import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LANGUAGES } from "@/utils/types/footer-types";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <Select value={i18n.language} onValueChange={(lng) => i18n.changeLanguage(lng)}>
      <SelectTrigger size="sm">
        <SelectValue/>
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
