import { describe, expect, it } from "vitest";
import { Articles, SeverityLevel, type DsgvoResult } from "../types/dsgvo-types";
import { calculateDsgvoRiskScore } from "./dsgvo-risk-score";

function makeResult(
  art7Severity: SeverityLevel,
  art1314Severity: SeverityLevel,
  art25Severity: SeverityLevel,
): DsgvoResult {
  const base = {
    passed: art7Severity === SeverityLevel.FINE,
    article: Articles.ART7,
    title: "",
    quickTitle: "",
    explanation: "",
    recommendation: "",
    evidence: [],
  };
  return {
    art7: {
      ...base,
      severity: art7Severity,
      passed: art7Severity === SeverityLevel.FINE,
      article: Articles.ART7,
      consentViolations: [],
      cookiesAfterConsent: [],
    },
    art13_14: {
      ...base,
      severity: art1314Severity,
      passed: art1314Severity === SeverityLevel.FINE,
      article: Articles.ART1314,
      privacyPolicyFound: art1314Severity === SeverityLevel.FINE,
      searchedLocations: [],
    },
    art25: {
      ...base,
      severity: art25Severity,
      passed: art25Severity !== SeverityLevel.CONFIRMED,
      article: Articles.ART25,
      highRiskTrackerCount: 0,
      isHttps: true,
      highRiskTrackers: [],
      fingerprintingDetected: false,
    },
    checkedAt: Date.now(),
  };
}

describe("calculateDsgvoRiskScore", () => {
  it("returns 0 for null result", () => {
    expect(calculateDsgvoRiskScore(null)).toBe(0);
  });

  it("returns 0 when all checks are FINE", () => {
    const result = makeResult(SeverityLevel.FINE, SeverityLevel.FINE, SeverityLevel.FINE);
    expect(calculateDsgvoRiskScore(result)).toBe(0);
  });

  it("returns 33 when all checks are SUSPICIOUS", () => {
    // (33 + 33 + 33) / 3 = 33
    const result = makeResult(SeverityLevel.SUSPICIOUS, SeverityLevel.SUSPICIOUS, SeverityLevel.SUSPICIOUS);
    expect(calculateDsgvoRiskScore(result)).toBe(33);
  });

  it("returns 100 when all checks are CONFIRMED", () => {
    // (100 + 100 + 100) / 3 = 100
    const result = makeResult(SeverityLevel.CONFIRMED, SeverityLevel.CONFIRMED, SeverityLevel.CONFIRMED);
    expect(calculateDsgvoRiskScore(result)).toBe(100);
  });

  it("averages mixed severities correctly", () => {
    // (0 + 33 + 100) / 3 = 44.33 -> rounds to 44
    const result = makeResult(SeverityLevel.FINE, SeverityLevel.SUSPICIOUS, SeverityLevel.CONFIRMED);
    expect(calculateDsgvoRiskScore(result)).toBe(44);
  });

  it("rounds a single CONFIRMED check correctly", () => {
    // (100 + 0 + 0) / 3 = 33.33 -> rounds to 33
    const result = makeResult(SeverityLevel.CONFIRMED, SeverityLevel.FINE, SeverityLevel.FINE);
    expect(calculateDsgvoRiskScore(result)).toBe(33);
  });
});
