import { describe, it, expect } from "vitest";
import { calculateOverallRiskScore } from "./overall-risk-score";

// formula: score = tracker*0.4 + cookie*0.3 + dsgvo*0.3, normalized = min(round(score), 100)
// <= 20 → 1, <= 40 → 2, <= 55 → 3, <= 72 → 4, > 72 → 5

describe("calculateOverallRiskScore", () => {
  it("returns 1 when all inputs are 0", () => {
    expect(calculateOverallRiskScore(0, 0, 0)).toBe(1);
  });

  it("returns 1 at boundary normalized score of 20", () => {
    // 50 * 0.4 = 20
    expect(calculateOverallRiskScore(50, 0, 0)).toBe(1);
  });

  it("returns 2 just above boundary (normalized 21)", () => {
    // 53 * 0.4 = 21.2 → rounds to 21
    expect(calculateOverallRiskScore(53, 0, 0)).toBe(2);
  });

  it("returns 2 at boundary normalized score of 40", () => {
    // 100 * 0.4 = 40
    expect(calculateOverallRiskScore(100, 0, 0)).toBe(2);
  });

  it("returns 3 at boundary normalized score of 55", () => {
    // 100 * 0.4 + 50 * 0.3 = 55
    expect(calculateOverallRiskScore(100, 50, 0)).toBe(3);
  });

  it("returns 4 at boundary normalized score of 72", () => {
    // 100 * 0.4 + 100 * 0.3 + 7 * 0.3 = 72.1 → rounds to 72
    expect(calculateOverallRiskScore(100, 100, 7)).toBe(4);
  });

  it("returns 5 just above upper boundary (normalized 73)", () => {
    // 100 * 0.4 + 100 * 0.3 + 10 * 0.3 = 73
    expect(calculateOverallRiskScore(100, 100, 10)).toBe(5);
  });

  it("returns 5 when all inputs are maximum", () => {
    expect(calculateOverallRiskScore(100, 100, 100)).toBe(5);
  });

  it("caps normalized score at 100 when inputs exceed 100", () => {
    expect(calculateOverallRiskScore(200, 200, 200)).toBe(5);
  });
});
