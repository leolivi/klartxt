import { useTranslation } from "react-i18next";
import type { Recommendation } from "@/utils/recommendations";
import { TYPE_ICON } from "./recommendationConfig";

export function RecommendationItem({ recommendation }: { recommendation: Recommendation }) {
  const { t } = useTranslation();
  const Icon = TYPE_ICON[recommendation.type];

  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
      <p className="text-body text-start">{t(recommendation.textKey)}</p>
    </div>
  );
}
