import { describe, expect, it } from "vitest";
import { TrackerCategory, TrackerCategoryForUser, TrackerConfidence, type TrackerInfo } from "../types/tracking-enums";
import { calculateTrackerRiskPageScore, calculateTrackerRiskScore } from "./network-risk-score";

function makeTracker(riskScore: number, overrides: Partial<TrackerInfo> = {}): TrackerInfo {
  return {
    domain: "tracker.example.com",
    owner: null,
    userCategory: TrackerCategoryForUser.TRACKING,
    detailedCategories: [TrackerCategory.ANALYTICS],
    riskScore,
    confidence: TrackerConfidence.CONFIRMED,
    fingerprintingScore: 0,
    ...overrides,
  };
}

describe("calculateTrackerRiskScore", () => {
  it("returns 0 for empty categories", () => {
    expect(calculateTrackerRiskScore([])).toBe(0);
  });

  it("returns 100 for MALWARE with CONFIRMED confidence", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.MALWARE], TrackerConfidence.CONFIRMED)).toBe(100);
  });

  it("halves the score for SUSPICIOUS confidence", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.MALWARE], TrackerConfidence.SUSPICIOUS)).toBe(50);
  });

  it("returns correct score for AD category", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.AD], TrackerConfidence.CONFIRMED)).toBe(70);
  });

  it("returns correct score for ANALYTICS category", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.ANALYTICS], TrackerConfidence.CONFIRMED)).toBe(50);
  });

  it("returns correct score for CDN category (lowest)", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.CDN], TrackerConfidence.CONFIRMED)).toBe(5);
  });

  it("uses the highest score when multiple categories are given", () => {
    // MALWARE (100) beats CDN (5)
    expect(calculateTrackerRiskScore([TrackerCategory.MALWARE, TrackerCategory.CDN], TrackerConfidence.CONFIRMED)).toBe(
      100,
    );
  });

  it("uses SUSPICIOUS multiplier with multiple categories", () => {
    // AD (70) is max, * 0.5 = 35
    expect(
      calculateTrackerRiskScore([TrackerCategory.AD, TrackerCategory.ANALYTICS], TrackerConfidence.SUSPICIOUS),
    ).toBe(35);
  });

  it("defaults to CONFIRMED confidence when omitted", () => {
    expect(calculateTrackerRiskScore([TrackerCategory.AD])).toBe(70);
  });
});

describe("calculateTrackerRiskPageScore", () => {
  it("returns 0 for empty tracker list", () => {
    expect(calculateTrackerRiskPageScore([])).toBe(0);
  });

  it("calculates score for a single high-risk tracker", () => {
    // max=100, avg=100, countFactor=min(2,30)=2 -> 60+30+2=92
    expect(calculateTrackerRiskPageScore([makeTracker(100)])).toBe(92);
  });

  it("calculates score for two trackers", () => {
    // max=100, avg=75, countFactor=4 -> 60+22.5+4=86.5 -> 87
    expect(calculateTrackerRiskPageScore([makeTracker(100), makeTracker(50)])).toBe(87);
  });

  it("caps the count factor at 30 for many trackers", () => {
    // 15 trackers, all riskScore=60: max=60, avg=60, countFactor=30 -> 36+18+30=84
    const trackers = Array.from({ length: 15 }, () => makeTracker(60));
    expect(calculateTrackerRiskPageScore(trackers)).toBe(84);
  });

  it("caps total score at 100", () => {
    // Many high-risk trackers that would exceed 100
    const trackers = Array.from({ length: 15 }, () => makeTracker(100));
    expect(calculateTrackerRiskPageScore(trackers)).toBeLessThanOrEqual(100);
  });

  it("returns a low score for a single low-risk tracker", () => {
    // max=0, avg=0, countFactor=2 -> score=2
    expect(calculateTrackerRiskPageScore([makeTracker(0)])).toBe(2);
  });
});
