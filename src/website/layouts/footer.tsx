import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="px-6 py-12 text-center">
      <div className="text-ink-default text-small">
        <p>{t("footerDialogDisclaimer")}</p>
        <Link to="/privacy" className="underline">
          {t("privacyPage_footerLink")}
        </Link>
        {" · "}
        <Link to="/imprint" className="underline">
          {t("imprintPage_footerLink")}
        </Link>
        {" · "}
        <Link to="/sources" className="underline">
          {t("sourcesPage_footerLink")}
        </Link>
      </div>
    </footer>
  )
}
