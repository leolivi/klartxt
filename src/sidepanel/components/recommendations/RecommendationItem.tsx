import type { Recommendation } from "@/utils/recommendations"
import { useTranslation } from "react-i18next"
import { TYPE_ICON } from "./recommendationConfig"

export function RecommendationItem({
  recommendation,
}: {
  recommendation: Recommendation
}) {
  const { t } = useTranslation()
  const Icon = TYPE_ICON[recommendation.type]

  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-ink-strong" />
      <p className="text-ink-default text-body text-start">
        {t(recommendation.textKey)}
      </p>
    </div>
  )
}
