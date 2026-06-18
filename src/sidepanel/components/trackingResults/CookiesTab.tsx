import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import { CookieCategoryForUser } from "@/utils/types/cookie-types";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";

const CATEGORY_ORDER: Record<CookieCategoryForUser, number> = {
  [CookieCategoryForUser.TRACKING]:   0,
  [CookieCategoryForUser.FUNCTIONAL]: 1,
  [CookieCategoryForUser.NECESSARY]:  2,
  [CookieCategoryForUser.UNKNOWN]:    3,
};

function cookieKey(cookie: ClassifiedCookie) {
  return `${cookie.domain}__${cookie.name}`;
}

export function CookiesTab() {
  const { cookiesList } = useTabDataContext();
  const sorted = [...cookiesList].sort(
    (a, b) => (CATEGORY_ORDER[a.userCategory] ?? 3) - (CATEGORY_ORDER[b.userCategory] ?? 3)
  );
  const { t } = useTranslation();

  if (cookiesList.length === 0) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <>
      {sorted.map((cookie, i) => (
        <div key={cookieKey(cookie)}>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-body">{cookie.name}:</p>
              <p className="text-small text-muted">{t(cookie.isThirdParty ? "cookieThirdParty" : "cookieFirstParty")} - {cookie.domain}</p>
            </div>
            <Label>{t(`cookiesCategory_${cookie.userCategory}`)}</Label>
          </div>
          {i < sorted.length - 1 && <Separator />}
        </div>
      ))}
    </>
  );
}
