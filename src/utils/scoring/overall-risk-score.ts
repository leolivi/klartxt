/*
Gewichtung balanciert technisches Risiko und rechtliche Compliance:
- Tracker: 40% (direkter Datentransfer, zuverlässigste Datenbasis)
- Cookies: 30% (persistent, messbar)
- DSGVO: 30% (Art. 13/14 ist für reale Sites fast immer 0, daher reduziert)
*/

export function calculateOverallRiskScore(
  trackerPageScore: number,
  cookieRiskScore: number,
  dsgvoRiskScore: number,
): number {
  const score =
    trackerPageScore * 0.4 + cookieRiskScore * 0.3 + dsgvoRiskScore * 0.3
  const normalized = Math.min(Math.round(score), 100)

  // recalculate from 1-100 to 1-5
  if (normalized <= 20) return 1
  if (normalized <= 40) return 2
  if (normalized <= 55) return 3
  if (normalized <= 72) return 4
  return 5
}
