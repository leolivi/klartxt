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

describe("checkArt25, audio fingerprinting", () => {
  it("detects AudioContext in inline script", () => {
    const script = document.createElement("script");
    script.type = "text/plain";
    script.textContent = "const ctx = new AudioContext();";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects OfflineAudioContext in inline script", () => {
    const script = document.createElement("script");
    script.type = "text/plain";
    script.textContent = "const ctx = new OfflineAudioContext(1, 44100, 44100);";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });
});

describe("checkArt25, WebGL fingerprinting", () => {
  it("detects WEBGL_debug_renderer_info in inline script", () => {
    const script = document.createElement("script");
    script.type = "text/plain";
    script.textContent = "gl.getExtension('WEBGL_debug_renderer_info');";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects getContext webgl in inline script", () => {
    const script = document.createElement("script");
    script.type = "text/plain";
    script.textContent = "canvas.getContext('webgl');";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });
});

describe("checkArt25, navigator hardware fingerprinting", () => {
  it("detects navigator.hardwareConcurrency in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "const cores = navigator.hardwareConcurrency;";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("detects navigator.deviceMemory in inline script", () => {
    const script = document.createElement("script");
    script.textContent = "const mem = navigator.deviceMemory;";
    document.head.appendChild(script);
    expect(checkArt25().fingerprintingDetected).toBe(true);
  });

  it("does not flag harmless navigator access", () => {
    const script = document.createElement("script");
    script.textContent = "const lang = navigator.language;";
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
