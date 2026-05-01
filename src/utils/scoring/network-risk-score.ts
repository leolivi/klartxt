import type { TrackerInfo } from "@/data/trackers/tracking-domains";
import { TrackerCategory, TrackerConfidence } from "../types/tracking-enums";

const CATEGORY_SCORE: Record<TrackerCategory, number> = {
    [TrackerCategory.MALWARE]: 100,
    [TrackerCategory.SESSION]: 80,
    [TrackerCategory.AD]: 70,
    [TrackerCategory.TAG_MANAGER]: 60,
    [TrackerCategory.ANALYTICS]: 50,
    [TrackerCategory.SOCIAL]: 40,
    [TrackerCategory.EMBEDDED]: 30,
    [TrackerCategory.FUNCTIONAL]: 20,
    [TrackerCategory.CONSENT]: 10,
    [TrackerCategory.CDN]: 5,
    [TrackerCategory.SECURITY]: 10,
    [TrackerCategory.UNKNOWN]: 25,
};

// Conficence multiplicator: suspicious trackers have a reduced score
const CONFIDENCE_MULTIPLIER: Record<TrackerConfidence, number> = {
    [TrackerConfidence.CONFIRMED]: 1.0,
    [TrackerConfidence.SUSPICIOUS]: 0.5,
};


// calculate risk score of each individual tracker
export function calculateTrackerRiskScore(categories: TrackerCategory[], confidence: TrackerConfidence = TrackerConfidence.CONFIRMED): number {
    let maxScore = 0;

    for (const cat of categories) {
        const score = CATEGORY_SCORE[cat] ?? 0;
        if (score > maxScore) maxScore = score;
    }

    return Math.round(maxScore * CONFIDENCE_MULTIPLIER[confidence]);
}

// calculate risk score of all trackers on one page
export function calculateTrackerRiskPageScore(trackers: TrackerInfo[]): number {
    if (trackers.length === 0) return 0;

    const maxRisk = Math.max(...trackers.map(t => t.riskScore));
    const avgRisk =
        trackers.reduce((sum, t) => sum + t.riskScore, 0) / trackers.length;

    const trackerCountFactor = Math.min(trackers.length * 2, 30);
    const score = maxRisk * 0.6 + avgRisk * 0.3 + trackerCountFactor;

    return Math.min(Math.round(score), 100);
}