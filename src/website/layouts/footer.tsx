import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="px-6 py-12 text-center">
        <div>
          <p className="text-small text-muted">
            {t("footerDialogDisclaimer")}
          </p>
          <Link to="/privacy" className="underline text-primary dark:text-text-muted text-small">{t("privacyPage_footerLink")}</Link>
          {" · "}
          <Link to="/imprint" className="underline text-primary dark:text-text-muted text-small">{t("imprintPage_footerLink")}</Link>
          {" · "}
          <Link to="/sources" className="underline text-primary dark:text-text-muted text-small">{t("sourcesPage_footerLink")}</Link>
        </div>
      </footer>
  );
}
