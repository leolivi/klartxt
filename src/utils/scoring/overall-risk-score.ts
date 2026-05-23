/*
Gewichtung priorisiert rechtliche Compliance:
- DSGVO: 40% (rechtliche Verstöße mit Severity-Levels)
- Tracker: 35% (direkter Datentransfer, technisches Risiko)
- Cookies: 25% (persistent, aber weniger direkt)
*/

import { RISK_SCORE_DESCRIPTIONS, type RiskScoreDescription } from "./risk-score-descriptions";

export type RiskScoreResult = {
  score: number;
  description: RiskScoreDescription;
};

// function to calculate overall risk score (cookies, dsgvo checks and network trackers)
export function calculateOverallRiskScore(
  trackerPageScore: number,
  cookieRiskScore: number,
  dsgvoRiskScore: number,
): number {
  const score = trackerPageScore * 0.35 + cookieRiskScore * 0.25 + dsgvoRiskScore * 0.4;
  const normalized = Math.min(Math.round(score), 100);

  // recalculate from 1-100 to 1-5
  if (normalized <= 20) return 1;
  if (normalized <= 40) return 2;
  if (normalized <= 60) return 3;
  if (normalized <= 80) return 4;
  return 5;
}

// create object with risk score and their descriptions
export function getOverallRiskScoreResult(score: number): RiskScoreResult {
  return { score, description: RISK_SCORE_DESCRIPTIONS[score] };
}
