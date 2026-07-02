import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/sidepanel/components/ui/accordion";
import type { CheckedItemKey } from "@/utils/types/footer-types";
import { useTranslation } from "react-i18next";

const SECTIONS = ["s1", "s2", "s3"] as const;

const TOPIC_CATEGORIES: Partial<Record<CheckedItemKey, string[]>> = {
  tracker: ["tracking", "ads", "session", "content", "security", "functional"],
  cookies: ["tracking", "functional", "necessary"],
};

export function TopicPage({ topicKey }: { topicKey: CheckedItemKey }) {
  const { t } = useTranslation();
  const categories = TOPIC_CATEGORIES[topicKey];

  return (
    <div className="px-2">
      <h2 className="text-h2 text-ink-strongest mb-1">{t(`website_${topicKey}_title`)}</h2>
      <p className="text-body text-ink-default mb-8">{t(`website_${topicKey}_subtitle`)}</p>

      <div className="flex flex-col gap-8">
        {SECTIONS.map(s => (
          <div key={s}>
            <h3 className="text-h3 text-ink-strong mb-2">{t(`website_${topicKey}_${s}_heading`)}</h3>
            <p className="text-body text-ink-default">{t(`website_${topicKey}_${s}_body`)}</p>
          </div>
        ))}

        {categories && (
          <>
            <Accordion type="single" collapsible cardAccordion>
              <AccordionItem value="categories">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-h3">{t(`website_${topicKey}_categories_heading`)}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3">
                    {categories.map(cat => (
                      <div key={cat}>
                        <span className="text-body font-medium text-ink-strong">
                          {t(`website_${topicKey}_cat_${cat}_name`)}:{" "}
                        </span>
                        <span className="text-body text-ink-default">{t(`website_${topicKey}_cat_${cat}_desc`)}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </div>
    </div>
  );
}
