// TODO: finalize with dsgvo check
export function calculateOverallRiskScore(
  trackerPageScore: number,
  cookieRiskScore: number,
): number {
  const score = trackerPageScore * 0.6 + cookieRiskScore * 0.4;
  const normalized = Math.min(Math.round(score), 100);
  
  // recalculate from 1-100 to 1-5
  if (normalized <= 20) return 1;
  if (normalized <= 40) return 2;
  if (normalized <= 60) return 3;
  if (normalized <= 80) return 4;
  return 5;
}