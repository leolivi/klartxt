// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkArt25 } from "./art25";

beforeEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checkArt25, isHttps", () => {
  it("returns isHttps: false for non-HTTPS page (jsdom default is about:blank)", () => {
    expect(checkArt25().isHttps).toBe(false);
  });

  it("returns isHttps: true when protocol is https:", () => {
    vi.stubGlobal("location", { protocol: "https:", href: "https://example.com/" });
    expect(checkArt25().isHttps).toBe(true);
  });
});

describe("checkArt25, tiny canvas fingerprinting", () => {
  it("returns fingerprintingDetected: false on a clean page", () => {
    expect(checkArt25().fingerprintingDetected).toBe(false);
  });

  it("detects a canvas with width <= 2 as fingerprinting signal", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 100;
    document.body.appendChild(canvas);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects a canvas with height <= 2 as fingerprinting signal", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 2;
    document.body.appendChild(canvas);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("does not flag a normal-sized canvas", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 150;
    document.body.appendChild(canvas);
    expect(checkArt25().fingerprintingDetected).toBe(false);
  });
});

describe("checkArt25, inline script fingerprinting", () => {
  it("detects screen.width access in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "const w = screen.width;";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects screen.height access in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "const h = screen.height;";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects Intl.DateTimeFormat timezone fingerprinting in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "Intl.DateTimeFormat().resolvedOptions().timeZone;";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects getTimezoneOffset timezone fingerprinting in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "new Date().getTimezoneOffset();";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("does not flag harmless inline script", () => {
    const script = document.createElement("script");
    script.textContent = "console.log('hello world');";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(false);
  });
});

describe("checkArt25, external fingerprinting script domain", () => {
  it("detects a script loaded from a known fingerprinting domain", () => {
    // "googletagmanager.com" is in fingerprint-domains.json (f >= 2)
    const script = document.createElement("script");
    script.setAttribute("src", "https://googletagmanager.com/gtm.js");
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("does not flag a script from an unknown domain", () => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://not-a-known-fingerprinter-xyz.com/app.js");
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(false);
  });
});
