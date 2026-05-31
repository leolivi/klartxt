import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="mt-16 px-6 py-6 text-center">
        <p className="text-small text-muted">
          {t("footerDialogDisclaimer")} &nbsp;·&nbsp;{" "}
          <a href="https://klartxt.com" className="underline text-primary">klartxt.com</a>
        </p>
        {/* TODO: Add Imprint and Data Policy */}
      </footer>
  );
}
