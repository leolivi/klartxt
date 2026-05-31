import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";

function cookieKey(cookie: ClassifiedCookie) {
  return `${cookie.domain}__${cookie.name}`;
}

// TODO: maybe sort them from tracking to necessary (worst to best)?
export function CookiesTab() {
  const { cookiesList } = useTabDataContext();
  const { t } = useTranslation();

  if (cookiesList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {cookiesList.map((cookie, i) => (
        <div key={cookieKey(cookie)}>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body">{cookie.name}:</p>
              <p className="text-small text-muted">{t(cookie.isThirdParty ? "cookieThirdParty" : "cookieFirstParty")} - {cookie.domain}</p>
            </div>
            <Label>{t(`cookiesCategory_${cookie.userCategory}`)}</Label>
          </div>
          {i < cookiesList.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}
