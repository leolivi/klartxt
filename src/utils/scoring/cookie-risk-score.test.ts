import { describe, it, expect } from "vitest";
import { calculateCookieRiskScore } from "./cookie-risk-score";
import { CookieCategory, CookieCategoryForUser, type ClassifiedCookie } from "../types/cookie-types";

function makeCookie(overrides: Partial<ClassifiedCookie> = {}): ClassifiedCookie {
  return {
    name: "test_cookie",
    domain: "example.com",
    category: CookieCategory.NECESSARY,
    userCategory: CookieCategoryForUser.NECESSARY,
    isThirdParty: false,
    httpOnly: true,
    secure: true,
    ...overrides,
  };
}

describe("calculateCookieRiskScore", () => {
  it("returns 0 for empty cookie list", () => {
    expect(calculateCookieRiskScore([])).toBe(0);
  });

  it("scores a single third-party necessary cookie", () => {
    // thirdParty: min(1*10,40)=10, general: min(1,10)=1 -> 11
    const cookies = [makeCookie({ isThirdParty: true })];
    expect(calculateCookieRiskScore(cookies)).toBe(11);
  });

  it("caps third-party contribution at 40", () => {
    // 5 third-party: min(50,40)=40, general: min(5,10)=5 -> 45
    const cookies = Array.from({ length: 5 }, () => makeCookie({ isThirdParty: true }));
    expect(calculateCookieRiskScore(cookies)).toBe(45);
  });

  it("scores a single advertising cookie", () => {
    // advertising: min(8,30)=8, general: 1 -> 9
    const cookies = [makeCookie({ category: CookieCategory.ADVERTISING })];
    expect(calculateCookieRiskScore(cookies)).toBe(9);
  });

  it("scores a single analytics cookie", () => {
    // analytics: min(4,20)=4, general: 1 -> 5
    const cookies = [makeCookie({ category: CookieCategory.ANALYTICS })];
    expect(calculateCookieRiskScore(cookies)).toBe(5);
  });

  it("caps advertising contribution at 30", () => {
    // 4 advertising: min(32,30)=30, general: 4 -> 34
    const cookies = Array.from({ length: 4 }, () =>
      makeCookie({ category: CookieCategory.ADVERTISING })
    );
    expect(calculateCookieRiskScore(cookies)).toBe(34);
  });

  it("caps analytics contribution at 20", () => {
    // 5 analytics: min(20,20)=20, general: 5 -> 25
    const cookies = Array.from({ length: 5 }, () =>
      makeCookie({ category: CookieCategory.ANALYTICS })
    );
    expect(calculateCookieRiskScore(cookies)).toBe(25);
  });

  it("caps total score at 100", () => {
    const cookies = [
      ...Array.from({ length: 5 }, () => makeCookie({ isThirdParty: true, category: CookieCategory.ADVERTISING })),
      ...Array.from({ length: 5 }, () => makeCookie({ category: CookieCategory.ANALYTICS })),
    ];
    expect(calculateCookieRiskScore(cookies)).toBeLessThanOrEqual(100);
  });

  it("combines all risk factors correctly", () => {
    // 1 third-party advertising cookie:
    // thirdParty: 10, advertising: 8, analytics: 0, general: 1 -> 19
    const cookies = [makeCookie({ isThirdParty: true, category: CookieCategory.ADVERTISING })];
    expect(calculateCookieRiskScore(cookies)).toBe(19);
  });
});
