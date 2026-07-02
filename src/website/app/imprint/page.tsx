import { useTranslation } from "react-i18next";

export function ImprintPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-h1 mb-8">{t("imprintPage_title")}</h1>

      <section className="mb-8">
        <h2 className="text-h2 mb-3">
          {t("imprintPage_responsible_title")}
          {" & "}
          {t("imprintPage_contact_title")}
        </h2>
        <p className="text-body text-ink-default whitespace-pre-line">{t("imprintPage_responsible_body")}</p>
        <p className="text-body text-ink-default">{t("imprintPage_contact_body")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-h2 mb-3">{t("imprintPage_disclaimer_title")}</h2>
        <p className="text-body text-ink-default">{t("imprintPage_disclaimer_body")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-h2 mb-3">{t("imprintPage_project_title")}</h2>
        <p className="text-body text-ink-default">{t("imprintPage_project_body")}</p>
      </section>
    </main>
  );
}
