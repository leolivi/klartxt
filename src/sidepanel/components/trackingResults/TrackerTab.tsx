import { CHECKED_ITEMS } from "@/utils/types/footer-types";
import { TrackerCategoryForUser } from "@/utils/types/tracking-enums";
import { localizeHref } from "@/utils/website-link";
import { Info, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const CATEGORY_META: Record<TrackerCategoryForUser, { order: number; topicId: string }> = {
  [TrackerCategoryForUser.TRACKING]: { order: 0, topicId: "tracking" },
  [TrackerCategoryForUser.ADS]: { order: 1, topicId: "ads" },
  [TrackerCategoryForUser.SESSION]: { order: 2, topicId: "session" },
  [TrackerCategoryForUser.CONTENT]: { order: 3, topicId: "content" },
  [TrackerCategoryForUser.SECURITY]: { order: 4, topicId: "security" },
  [TrackerCategoryForUser.FUNCTIONAL]: { order: 5, topicId: "functional" },
};

const TRACKERS_TOPIC_URL = CHECKED_ITEMS.find(item => item.key === "tracker")!.href;

export function TrackerTab() {
  const { trackerList } = useTabDataContext();
  const { t, i18n } = useTranslation();

  if (trackerList.length === 0)
    return <p className="text-small text-ink-default py-4">{t("trackingResultsDialogError")}</p>;

  const grouped = trackerList.reduce<Record<string, string[]>>((acc, tracker) => {
    const cat = tracker.userCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tracker.domain);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort(
    (a, b) =>
      (CATEGORY_META[a as TrackerCategoryForUser]?.order ?? 99) -
      (CATEGORY_META[b as TrackerCategoryForUser]?.order ?? 99),
  );

  return (
    <Accordion type="multiple">
      {categories.map((cat, i) => (
        <div key={cat}>
          <AccordionItem value={cat} className="border-b-0">
            <AccordionTrigger
              label={<span>{t(`trackerCategory_${cat}`)}</span>}
              actions={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={localizeHref(
                        TRACKERS_TOPIC_URL,
                        i18n.language,
                        CATEGORY_META[cat as TrackerCategoryForUser].topicId,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t("categoryInfoLabel")}
                      className="shrink-0"
                    >
                      <Info
                        aria-hidden="true"
                        size={16}
                        className="text-ink-default hover:text-ink-strong cursor-pointer"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("categoryInfoLabel")}</TooltipContent>
                </Tooltip>
              }
            >
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
