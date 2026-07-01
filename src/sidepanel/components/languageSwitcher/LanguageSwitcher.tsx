import { LANGUAGES } from "@/utils/types/footer-types"
import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()

  return (
    <Select
      value={i18n.language}
      onValueChange={(lng) => i18n.changeLanguage(lng)}
    >
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
  )
}
export default LanguageSwitcher
