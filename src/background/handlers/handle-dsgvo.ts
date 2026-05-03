import { type DsgvoResult, type DsgvoCheck, type ContentScriptDsgvoResult, type DsgvoKey, type ConsentTimingResult } from "@/utils/types/dsgvo-types";
import { evaluateArt25, evaluateArt7 } from "@/data/dsgvo/evaluate";
import { CHECKS } from "@/data/dsgvo/dsgvo-checks";
import type { TrackerInfo } from "@/utils/types/tracking-enums";

interface HandleDsgvoParams {
    contentResult: ContentScriptDsgvoResult;
    trackers: TrackerInfo[];
    cookieCount: number;
    consentTiming: ConsentTimingResult | null;
    tabUrl: string;
    onDsgvoChecked: (result: DsgvoResult) => void;
}

function buildCheck(key: DsgvoKey, passed: boolean): DsgvoCheck {
    return { passed, ...CHECKS[key] };
}

export function handleDsgvo({ contentResult, trackers, cookieCount, consentTiming, tabUrl, onDsgvoChecked }: HandleDsgvoParams): void {
    const art25 = evaluateArt25(tabUrl.startsWith("https://"), trackers);

    const result: DsgvoResult = {
        art7: buildCheck("art7", evaluateArt7(contentResult.art7, trackers, cookieCount, consentTiming)),
        art13_14: buildCheck("art13_14", contentResult.art13_14),
        art25: buildCheck("art25", art25.passed),
        checkedAt: Date.now(),
        highRiskTrackerCount: art25.highRiskCount,
        consentViolations: consentTiming?.cookiesSetBeforeConsent ?? [],
        cookiesAfterConsent: consentTiming?.cookiesSetAfterConsent ?? [],
    };

    onDsgvoChecked(result);
}