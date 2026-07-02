import { describe, expect, it } from "vitest";
import {
  ADVERTISING_PATTERNS_LOWER,
  ANALYTICS_PATTERNS_LOWER,
  NECESSARY_PATTERNS_LOWER,
  SESSION_PATTERNS_LOWER,
} from "./cookie-heuristics";

const allArrays = [
  { name: "NECESSARY_PATTERNS_LOWER", data: NECESSARY_PATTERNS_LOWER },
  { name: "SESSION_PATTERNS_LOWER", data: SESSION_PATTERNS_LOWER },
  { name: "ANALYTICS_PATTERNS_LOWER", data: ANALYTICS_PATTERNS_LOWER },
  { name: "ADVERTISING_PATTERNS_LOWER", data: ADVERTISING_PATTERNS_LOWER },
];

describe("cookie heuristic pattern arrays", () => {
  allArrays.forEach(({ name, data }) => {
    describe(name, () => {
      it("is an array", () => {
        expect(Array.isArray(data)).toBe(true);
      });

      it("is non-empty", () => {
        expect(data.length).toBeGreaterThan(0);
      });

      it("contains only lowercase strings", () => {
        data.forEach(pattern => {
          expect(pattern).toBe(pattern.toLowerCase());
        });
      });
    });
  });
});
