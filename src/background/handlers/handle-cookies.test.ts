import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCookies } from "./handle-cookies";

function makeCookie(overrides: Partial<chrome.cookies.Cookie> = {}): chrome.cookies.Cookie {
  return {
    name: "test",
    value: "1",
    domain: "example.com",
    hostOnly: true,
    path: "/",
    secure: false,
    httpOnly: false,
    sameSite: "lax",
    session: true,
    storeId: "0",
    ...overrides,
  } as chrome.cookies.Cookie;
}

function stubCookies(cookies: chrome.cookies.Cookie[]): void {
  vi.stubGlobal("chrome", {
    cookies: { getAll: vi.fn().mockResolvedValue(cookies) },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("handleCookies", () => {
  it("includes a first-party cookie from chrome.cookies.getAll()", async () => {
    stubCookies([makeCookie({ name: "session_id", domain: "example.com" })]);
    const onCookiesDetected = vi.fn();

    await handleCookies({ tabUrl: "https://example.com/page", thirdPartyCookies: [], onCookiesDetected });

    const cookies = onCookiesDetected.mock.calls[0][0];
    expect(cookies).toHaveLength(1);
    expect(cookies[0].isThirdParty).toBe(false);
  });

  it("includes a third-party cookie actually observed via onChanged, even if getAll() alone wouldn't scope it here", async () => {
    stubCookies([]); // getAll() sees nothing page-relevant on its own
    const onCookiesDetected = vi.fn();

    await handleCookies({
      tabUrl: "https://example.com/page",
      thirdPartyCookies: [makeCookie({ name: "_fbp", domain: ".doubleclick.net" })],
      onCookiesDetected,
    });

    const cookies = onCookiesDetected.mock.calls[0][0];
    expect(cookies).toHaveLength(1);
    expect(cookies[0].isThirdParty).toBe(true);
  });

  it("excludes cookies from getAll() that belong to a different domain and were not observed via onChanged (regression: browser-profile contamination)", async () => {
    // e.g. an unrelated, already-logged-in session cookie sitting in the browser profile
    stubCookies([makeCookie({ name: "SID", domain: ".google.com" })]);
    const onCookiesDetected = vi.fn();

    await handleCookies({ tabUrl: "https://example.com/page", thirdPartyCookies: [], onCookiesDetected });

    expect(onCookiesDetected.mock.calls[0][0]).toHaveLength(0);
  });

  it("does not include a first-party cookie via pure substring overlap with the tab domain (regression: false positive)", async () => {
    // "notexample.com".includes("example.com") is true — root-domain equality avoids this
    stubCookies([makeCookie({ name: "unrelated", domain: "notexample.com" })]);
    const onCookiesDetected = vi.fn();

    await handleCookies({ tabUrl: "https://example.com/page", thirdPartyCookies: [], onCookiesDetected });

    expect(onCookiesDetected.mock.calls[0][0]).toHaveLength(0);
  });

  it("includes a subdomain cookie as first-party", async () => {
    stubCookies([makeCookie({ name: "session", domain: ".sub.example.com" })]);
    const onCookiesDetected = vi.fn();

    await handleCookies({ tabUrl: "https://example.com/page", thirdPartyCookies: [], onCookiesDetected });

    const cookies = onCookiesDetected.mock.calls[0][0];
    expect(cookies).toHaveLength(1);
    expect(cookies[0].isThirdParty).toBe(false);
  });

  it("deduplicates a cookie seen both via getAll() and as a third-party sighting", async () => {
    stubCookies([makeCookie({ name: "dup", domain: "example.com" })]);
    const onCookiesDetected = vi.fn();

    await handleCookies({
      tabUrl: "https://example.com/page",
      thirdPartyCookies: [makeCookie({ name: "dup", domain: "example.com" })],
      onCookiesDetected,
    });

    expect(onCookiesDetected.mock.calls[0][0]).toHaveLength(1);
  });

  it("returns early on an invalid tabUrl without throwing", async () => {
    stubCookies([]);
    const onCookiesDetected = vi.fn();

    await handleCookies({ tabUrl: "not-a-url", thirdPartyCookies: [], onCookiesDetected });

    expect(onCookiesDetected).not.toHaveBeenCalled();
  });
});
