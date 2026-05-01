import { type DsgvoResult, type DsgvoCheck, type ContentScriptDsgvoResult, type DsgvoKey } from "@/utils/types/dsgvo-types";
import { evaluateArt25, evaluateArt7 } from "@/data/dsgvo/evaluate";
import { CHECKS } from "@/data/dsgvo/dsgvo-checks";
import type { TrackerInfo } from "@/utils/types/tracking-enums";

interface HandleDsgvoParams {
    contentResult: ContentScriptDsgvoResult;
    trackers: TrackerInfo[];
    cookieCount: number;
    tabUrl: string;
    onDsgvoChecked: (result: DsgvoResult) => void;
}

function buildCheck(key: DsgvoKey, passed: boolean): DsgvoCheck {
    return { passed, ...CHECKS[key] };
}

export function handleDsgvo({ contentResult, trackers, cookieCount, tabUrl, onDsgvoChecked }: HandleDsgvoParams): void {
    const art25 = evaluateArt25(tabUrl.startsWith("https://"), trackers);

    const result: DsgvoResult = {
        art7: buildCheck("art7", evaluateArt7(contentResult.art7, trackers, cookieCount)),
        art13_14: buildCheck("art13_14", contentResult.art13_14),
        art25: buildCheck("art25", art25.passed),
        checkedAt: Date.now(),
        highRiskTrackerCount: art25.highRiskCount,
    };

    onDsgvoChecked(result);
}