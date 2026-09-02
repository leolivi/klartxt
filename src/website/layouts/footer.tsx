import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { CoffeeBtn } from "../components/coffeeBtn/CoffeeBtn";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="flex items-center px-6 py-12">
      <div className="flex-1" />
      <div className="flex-1 text-ink-default text-small text-center">
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
        {" · "}
        <a href="https://github.com/leolivi/klartxt" target="_blank" rel="noopener noreferrer" className="underline">
          Github
        </a>
      </div>
      <div className="flex-1 flex justify-end">
        <CoffeeBtn />
      </div>
    </footer>
  );
}
