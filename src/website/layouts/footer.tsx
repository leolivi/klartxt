import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="mt-16 px-6 py-6 text-center">
        <div>
          <p className="text-small text-muted">
            {t("footerDialogDisclaimer")}{" "}
            <a href="https://klartxt.app" className="underline text-primary">klartxt.app</a>
          </p>
          <Link to="/privacy" className="underline text-primary text-small">{t("privacyPage_footerLink")}</Link>
          {" · "}
          <Link to="/imprint" className="underline text-primary text-small">{t("imprintPage_footerLink")}</Link>
        </div>
      </footer>
  );
}
