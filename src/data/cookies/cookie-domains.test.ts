import { describe, expect, it } from "vitest";
import { extractRootDomain } from "./cookie-domains";

describe("extractRootDomain", () => {
  it("reduces a simple hostname to its root domain", () => {
    expect(extractRootDomain("www.example.com")).toBe("example.com");
  });

  it("reduces a deep subdomain to its root domain", () => {
    expect(extractRootDomain("ads.tracker.example.com")).toBe("example.com");
  });

  it("strips a leading dot (cookie domain convention)", () => {
    expect(extractRootDomain(".example.com")).toBe("example.com");
  });

  it("handles multi-part TLDs correctly (was broken with naive slice(-2))", () => {
    expect(extractRootDomain("tracker.co.uk")).toBe("tracker.co.uk");
    expect(extractRootDomain("sub.tracker.co.uk")).toBe("tracker.co.uk");
  });

  it("returns an already-root domain unchanged", () => {
    expect(extractRootDomain("example.com")).toBe("example.com");
  });
});
