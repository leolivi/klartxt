import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { RecommendationItem } from "./RecommendationItem";

export function RecommendationSection() {
  const { recommendations } = useTabDataContext();
  const { t } = useTranslation();

  return (
    <div className="px-4">
      <Accordion type="single" collapsible cardAccordion>
        <AccordionItem value="recommendations">
          <AccordionTrigger className="hover:no-underline">
            <h3 className="text-h3 text-ink-strongest">{t("recommendationSectionTitle")}</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              {recommendations.map(rec => (
                <RecommendationItem key={rec.type} recommendation={rec} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
