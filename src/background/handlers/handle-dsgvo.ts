import {
  evaluateArt13_14,
  evaluateArt25,
  evaluateArt7,
} from "@/data/dsgvo/evaluate"
import {
  type ConsentTimingResult,
  type ContentScriptDsgvoResult,
  type DsgvoResult,
} from "@/utils/types/dsgvo-types"
import type { TrackerInfo } from "@/utils/types/tracking-enums"

interface HandleDsgvoParams {
  contentResult: ContentScriptDsgvoResult
  trackers: TrackerInfo[]
  cookieCount: number
  consentTiming: ConsentTimingResult | null
  tabUrl: string
  clientHintsDetected?: boolean
  onDsgvoChecked: (result: DsgvoResult) => void
}

export function handleDsgvo({
  contentResult,
  trackers,
  cookieCount,
  consentTiming,
  tabUrl,
  clientHintsDetected,
  onDsgvoChecked,
}: HandleDsgvoParams): void {
  const result: DsgvoResult = {
    art7: evaluateArt7(
      contentResult.art7,
      trackers,
      cookieCount,
      consentTiming,
    ),
    art13_14: evaluateArt13_14(
      contentResult.art13_14.found,
      contentResult.art13_14.searchedLocations,
    ),
    art25: evaluateArt25(
      tabUrl.startsWith("https://"),
      trackers,
      contentResult.art25.fingerprintingDetected ||
        (clientHintsDetected ?? false),
    ),
    checkedAt: Date.now(),
  }

  onDsgvoChecked(result)
}
