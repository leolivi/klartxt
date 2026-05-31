import { DSGVO_KEYS } from "@/utils/types/dsgvo-types";
import { Separator } from "../ui/separator";
import { CircleCheck, CircleX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTabDataContext } from "../../context/useTabDataContext";

export function DsgvoTab() {
  const { dsgvoResult } = useTabDataContext();
  const { t } = useTranslation();

  if (!dsgvoResult) return <p className="text-small text-muted py-4">{t("trackingResultsDialogError")}</p>;
  return (
    <div>
      {DSGVO_KEYS.map((key, i) => {
        const check = dsgvoResult[key];
        return (
          <div key={key}>
            <div className="flex gap-3 items-start py-3">
              {check.passed
                ? <CircleCheck size={18} className="shrink-0 mt-0.5 text-risk-low-text bg-risk-low-fill rounded-full" />
                : <CircleX size={18} className="shrink-0 mt-0.5 text-risk-high-text bg-risk-high-fill rounded-full" />
              }
              <div>
                <p className="text-body-bold">{t(check.quickTitle)}</p>
                <p className="text-secondary text mt-1">{t(check.explanation)}</p>
                <p className="text-small text-muted mt-1">{t(check.title)}</p>
              </div>
            </div>
            {i < DSGVO_KEYS.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  );
}
