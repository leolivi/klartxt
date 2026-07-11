import type { Insight } from "@/utils/insights";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FooterDialog } from "../footer/FooterDialog";
import { DialogTrigger } from "../ui/dialog";
import { SEVERITY_ICON } from "./insightConfig";

export function InsightItem({ insight }: { insight: Insight }) {
  const { t } = useTranslation();
  const { Icon, className } = SEVERITY_ICON[insight.severity];

  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className={`mt-0.5 shrink-0 ${className}`} />
      <p className="text-body text-ink-default text-start flex-1">{t(insight.textKey, insight.vars)}</p>
      <FooterDialog
        trigger={
          <DialogTrigger aria-label={t("footerWhatWasChecked")} className="shrink-0 mt-0.5">
            <Info aria-hidden="true" size={16} className="text-ink-default hover:text-ink-strong cursor-pointer" />
          </DialogTrigger>
        }
      />
    </div>
  );
}
