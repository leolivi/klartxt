import { CheckSeverity, type DsgvoResult } from "../types/dsgvo-types";

// weight checks by severity: FINE = 0, SUSPICIOUS = 33, CONFIRMED = 100
// average of all three checks determines overall risk score
export function calculateDsgvoRiskScore(result: DsgvoResult | null): number {
  if (!result) return 0;

  const severityWeights: Record<CheckSeverity, number> = {
    [CheckSeverity.FINE]: 0,
    [CheckSeverity.SUSPICIOUS]: 33,
    [CheckSeverity.CONFIRMED]: 100,
  };

  const scores = [
    severityWeights[result.art7.severity],
    severityWeights[result.art13_14.severity],
    severityWeights[result.art25.severity],
  ];

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / 3);
}