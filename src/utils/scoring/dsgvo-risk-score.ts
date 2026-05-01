import type { DsgvoResult } from "../types/dsgvo-types";

// the more checks faile, the higher the score
export function calculateDsgvoRiskScore(result: DsgvoResult | null): number {
if (!result) return 0;
  const failed = [
    result.art7,
    result.art13_14,
    result.art25,
  ].filter((check) => !check.passed).length;

  // 0 failed = 0, 1 failed = 33, 2 failed = 66, 3 failed = 100
  return Math.round((failed / 3) * 100);
}