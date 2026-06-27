import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="px-6 py-12 text-center">
        <div>
          <p className="text-small text-ink-default">
            {t("footerDialogDisclaimer")}
          </p>
          <Link to="/privacy" className="underline text-primary dark:text-text-ink-default text-small">{t("privacyPage_footerLink")}</Link>
          {" · "}
          <Link to="/imprint" className="underline text-primary dark:text-text-ink-default text-small">{t("imprintPage_footerLink")}</Link>
          {" · "}
          <Link to="/sources" className="underline text-primary dark:text-text-ink-default text-small">{t("sourcesPage_footerLink")}</Link>
        </div>
      </footer>
  );
}
