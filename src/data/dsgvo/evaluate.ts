import type { ContentScriptDsgvoResult } from "@/utils/types/dsgvo-types";
import { TrackerConfidence, type TrackerInfo } from "@/utils/types/tracking-enums";
import { INFRASTRUCTURE_DOMAINS } from "./dsgvo-detectors";

const HIGH_RISK_SCORE_BENCHMARK = 30;

function isConsentTool(tracker: TrackerInfo): boolean {
    return INFRASTRUCTURE_DOMAINS.has(tracker.domain);
}

function confirmedTrackers(trackers: TrackerInfo[]): TrackerInfo[] {
    return trackers.filter(
        (t) => t.confidence === TrackerConfidence.CONFIRMED && !isConsentTool(t)
    );
}

function highRiskTrackers(trackers: TrackerInfo[]): TrackerInfo[] {
    return confirmedTrackers(trackers).filter(
        (t) => t.riskScore > HIGH_RISK_SCORE_BENCHMARK
    );
}

export function evaluateArt7(
    art7: ContentScriptDsgvoResult["art7"],
    trackers: TrackerInfo[],
    cookieCount: number
): boolean {
    const hasConfirmedTracking = confirmedTrackers(trackers).length > 0;
    const cookiesAlreadySet = cookieCount > 0;
    return !(art7.bannerVisible && (hasConfirmedTracking || cookiesAlreadySet));
}

export function evaluateArt25(
    isHttps: boolean,
    trackers: TrackerInfo[]
): { passed: boolean; highRiskCount: number } {
    const highRisk = highRiskTrackers(trackers);
    return {
        passed: isHttps && highRisk.length === 0,
        highRiskCount: highRisk.length,
    };
}