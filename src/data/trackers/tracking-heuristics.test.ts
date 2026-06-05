import { describe, it, expect } from "vitest";
import { TRACKING_PARAMS, TRACKING_PATHS, TRACKING_SUBDOMAINS, USER_ID_PATTERN } from "./tracking-heuristics";

describe("USER_ID_PATTERN", () => {
  it("matches a valid UUID v4", () => {
    expect(USER_ID_PATTERN.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("matches UUID case-insensitively", () => {
    expect(USER_ID_PATTERN.test("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("matches a 16-character hex string", () => {
    expect(USER_ID_PATTERN.test("1234567890abcdef")).toBe(true);
  });

  it("matches a hex string longer than 16 characters", () => {
    expect(USER_ID_PATTERN.test("1234567890abcdef12")).toBe(true);
  });

  it("does not match a 15-character hex string (too short)", () => {
    expect(USER_ID_PATTERN.test("1234567890abcde")).toBe(false);
  });

  it("does not match a short alphanumeric string", () => {
    expect(USER_ID_PATTERN.test("abc123")).toBe(false);
  });

  it("does not match plain text", () => {
    expect(USER_ID_PATTERN.test("hello-world")).toBe(false);
  });
});

describe("TRACKING_PATHS", () => {
  it("is an array", () => {
    expect(Array.isArray(TRACKING_PATHS)).toBe(true);
  });

  it("contains /collect", () => {
    expect(TRACKING_PATHS).toContain("/collect");
  });

  it("contains /pixel", () => {
    expect(TRACKING_PATHS).toContain("/pixel");
  });

  it("contains /beacon", () => {
    expect(TRACKING_PATHS).toContain("/beacon");
  });

  it("contains /sync", () => {
    expect(TRACKING_PATHS).toContain("/sync");
  });
});

describe("TRACKING_SUBDOMAINS", () => {
  it("is an array", () => {
    expect(Array.isArray(TRACKING_SUBDOMAINS)).toBe(true);
  });

  it("contains analytics.", () => {
    expect(TRACKING_SUBDOMAINS).toContain("analytics.");
  });

  it("contains track.", () => {
    expect(TRACKING_SUBDOMAINS).toContain("track.");
  });

  it("contains pixel.", () => {
    expect(TRACKING_SUBDOMAINS).toContain("pixel.");
  });
});

describe("TRACKING_PARAMS", () => {
  it("is a Set", () => {
    expect(TRACKING_PARAMS).toBeInstanceOf(Set);
  });

  it("contains at least one entry", () => {
    expect(TRACKING_PARAMS.size).toBeGreaterThan(0);
  });
});
