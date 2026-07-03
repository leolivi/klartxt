import { TrackerCategoryForUser } from "@/utils/types/tracking-enums";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Separator } from "../ui/separator";

const CATEGORY_ORDER: Record<TrackerCategoryForUser, number> = {
  [TrackerCategoryForUser.TRACKING]: 0,
  [TrackerCategoryForUser.ADS]: 1,
  [TrackerCategoryForUser.SESSION]: 2,
  [TrackerCategoryForUser.CONTENT]: 3,
  [TrackerCategoryForUser.SECURITY]: 4,
  [TrackerCategoryForUser.FUNCTIONAL]: 5,
};

export function TrackerTab() {
  const { trackerList } = useTabDataContext();
  const { t } = useTranslation();

  if (trackerList.length === 0)
    return <p className="text-small text-ink-default py-4">{t("trackingResultsDialogError")}</p>;

  const grouped = trackerList.reduce<Record<string, string[]>>((acc, tracker) => {
    const cat = tracker.userCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tracker.domain);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort(
    (a, b) => (CATEGORY_ORDER[a as TrackerCategoryForUser] ?? 99) - (CATEGORY_ORDER[b as TrackerCategoryForUser] ?? 99),
  );

  return (
    <Accordion type="multiple">
      {categories.map((cat, i) => (
        <div key={cat}>
          <AccordionItem value={cat} className="border-b-0">
            <AccordionTrigger>
              <span>{t(`trackerCategory_${cat}`)}</span>
              <span className="ml-auto mr-2 text-small text-ink-strong">{grouped[cat].length}</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-1 pb-2">
                {grouped[cat].map(domain => (
                  <div className="flex items-center gap-1 min-w-0">
                    <Link2 size={12} className="text-ink-default shrink-0" />
                    <li key={domain} title={domain} className="text-body text-ink-default pl-1 min-w-0 truncate">
                      {domain}
                    </li>
                  </div>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          {i < categories.length - 1 && <Separator />}
        </div>
      ))}
    </Accordion>
  );
}
