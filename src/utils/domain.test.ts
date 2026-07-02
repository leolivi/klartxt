import { describe, expect, it } from "vitest";
import { extractDomain } from "./domain";

describe("extractDomain", () => {
  it("extracts hostname from a full URL", () => {
    expect(extractDomain("https://example.com/path?q=1")).toBe("example.com");
  });

  it("strips www. prefix", () => {
    expect(extractDomain("https://www.example.com")).toBe("example.com");
  });

  it("does not strip non-leading www subdomains", () => {
    expect(extractDomain("https://www.www.example.com")).toBe("www.example.com");
  });

  it("preserves other subdomains", () => {
    expect(extractDomain("https://sub.example.com")).toBe("sub.example.com");
  });

  it("returns empty string for invalid URL", () => {
    expect(extractDomain("not-a-url")).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(extractDomain("")).toBe("");
  });

  it("handles http URLs", () => {
    expect(extractDomain("http://www.example.org/page")).toBe("example.org");
  });
});
