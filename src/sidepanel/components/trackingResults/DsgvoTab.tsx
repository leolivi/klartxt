import { DSGVO_KEYS, type Art25Check } from "@/utils/types/dsgvo-types"
import { CircleCheck, CircleX } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTabDataContext } from "../../context/useTabDataContext"
import { Separator } from "../ui/separator"

function art25DisplayKeys(art25: Art25Check): {
  quickTitle: string
  explanation: string
} {
  if (
    !art25.passed &&
    !art25.isHttps &&
    art25.highRiskTrackerCount === 0 &&
    !art25.fingerprintingDetected
  ) {
    return {
      quickTitle: "dsgvoArt25HttpsQuickTitle",
      explanation: "dsgvoArt25HttpsExplanation",
    }
  }
  return { quickTitle: art25.quickTitle, explanation: art25.explanation }
}

export function DsgvoTab() {
  const { dsgvoResult } = useTabDataContext()
  const { t } = useTranslation()

  if (!dsgvoResult)
    return (
      <p className="text-small text-ink-default py-4">
        {t("trackingResultsDialogError")}
      </p>
    )
  return (
    <div>
      {DSGVO_KEYS.map((key, i) => {
        const check = dsgvoResult[key]
        const { quickTitle, explanation } =
          key === "art25"
            ? art25DisplayKeys(dsgvoResult.art25)
            : { quickTitle: check.quickTitle, explanation: check.explanation }
        return (
          <div key={key}>
            <div className="flex gap-3 items-start py-3">
              {check.passed ? (
                <CircleCheck
                  size={18}
                  className="shrink-0 mt-0.5 text-ink-green bg-surface-green rounded-full"
                />
              ) : (
                <CircleX
                  size={18}
                  className="shrink-0 mt-0.5 text-ink-red bg-surface-red rounded-full"
                />
              )}
              <div>
                <p className="text-body-bold text-ink-strongest">
                  {t(quickTitle)}
                </p>
                <p className="text-secondary text-ink-strong mt-1">
                  {t(explanation)}
                </p>
                <p className="text-small text-ink-default mt-1">
                  {t(check.title)}
                </p>
              </div>
            </div>
            {i < DSGVO_KEYS.length - 1 && <Separator />}
          </div>
        )
      })}
    </div>
  )
}
