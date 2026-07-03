import { normalizeCookieDomain } from "@/utils/domain";
import type { ClassifiedCookie } from "@/utils/types/cookie-types";
import { CookieCategoryForUser } from "@/utils/types/cookie-types";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Separator } from "../ui/separator";

const CATEGORY_ORDER: Record<CookieCategoryForUser, number> = {
  [CookieCategoryForUser.TRACKING]: 0,
  [CookieCategoryForUser.FUNCTIONAL]: 1,
  [CookieCategoryForUser.NECESSARY]: 2,
  [CookieCategoryForUser.UNKNOWN]: 3,
};

export function CookiesTab() {
  const { cookiesList } = useTabDataContext();
  const { t } = useTranslation();

  if (cookiesList.length === 0)
    return <p className="text-small text-ink-default py-4">{t("trackingResultsDialogError")}</p>;

  const byCategory = cookiesList.reduce<Record<string, ClassifiedCookie[]>>((acc, cookie) => {
    const cat = cookie.userCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cookie);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort(
    (a, b) => (CATEGORY_ORDER[a as CookieCategoryForUser] ?? 99) - (CATEGORY_ORDER[b as CookieCategoryForUser] ?? 99),
  );

  return (
    <Accordion type="multiple">
      {categories.map((cat, i) => {
        const cookies = byCategory[cat];

        const byDomain = cookies.reduce<Record<string, ClassifiedCookie[]>>((acc, cookie) => {
          const key = normalizeCookieDomain(cookie.domain);
          if (!acc[key]) acc[key] = [];
          acc[key].push(cookie);
          return acc;
        }, {});

        return (
          <div key={cat}>
            <AccordionItem value={cat} className="border-b-0">
              <AccordionTrigger>
                <span>{t(`cookiesCategory_${cat}`)}</span>
                <span className="ml-auto mr-2 text-small text-ink-strong">{cookies.length}</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pb-2">
                  {Object.entries(byDomain).map(([domain, domainCookies]) => (
                    <div key={domain} className="min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <Link2 size={12} className="text-ink-strong shrink-0" />
                        <p title={domain} className="text-body text-ink-strong pb-1 min-w-0 truncate">
                          {domain}
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {domainCookies.map(cookie => (
                          <li
                            key={`${cookie.domain}__${cookie.name}`}
                            className="flex items-center justify-between gap-2 pl-1"
                          >
                            <span title={cookie.name} className="text-small text-ink-default min-w-0 truncate">
                              {cookie.name}
                            </span>
                            <span className="text-small text-ink-default shrink-0">
                              {t(cookie.isThirdParty ? "cookieThirdParty" : "cookieFirstParty")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            {i < categories.length - 1 && <Separator />}
          </div>
        );
      })}
    </Accordion>
  );
}
