import { useTranslation } from "react-i18next";
import type { Insight } from "@/utils/insights";
import { SEVERITY_ICON } from "./insightConfig";

export function InsightItem({ insight }: { insight: Insight }) {
  const { t } = useTranslation();
  const { Icon, className } = SEVERITY_ICON[insight.severity];

  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className={`mt-0.5 shrink-0 ${className}`} />
      <p className="text-body text-ink-default text-start">{t(insight.textKey, insight.vars)}</p>
    </div>
  );
}
