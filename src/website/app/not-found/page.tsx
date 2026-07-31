import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-h1 mb-4">404</p>
      <h1 className="text-h2 mb-4">{t("notFoundPage_title")}</h1>
      <p className="text-body text-ink-default mb-8">{t("notFoundPage_body")}</p>
      <Link to="/trackers" className="underline text-primary text-body">
        {t("notFoundPage_backHome")}
      </Link>
    </main>
  );
}
