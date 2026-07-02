import { TrackerConfidence } from "@/utils/types/tracking-enums";
import { describe, expect, it, vi } from "vitest";

// TRACKER_MAP is fetched via chrome.runtime.getURL at extension runtime
// in unit tests that environment is unavailable, therefore a mock is provided
vi.mock("@/data/trackers/tracking-domains", () => ({
  TRACKER_MAP: new Map([
    [
      "googletagmanager.com",
      {
        domain: "googletagmanager.com",
        owner: "Google LLC",
        userCategory: "tracking",
        detailedCategories: ["tag_manager"],
        riskScore: 60,
        confidence: "confirmed",
        fingerprintingScore: 0,
      },
    ],
  ]),
}));

import { handleNetworkRequests } from "./handle-network-requests";

// handleNetworkRequests uses the chrome.webRequest type annotation but does not
// call any Chrome API at runtime, it only reads details.url
function makeDetails(url: string): chrome.webRequest.OnBeforeRequestDetails {
  return { url } as chrome.webRequest.OnBeforeRequestDetails;
}

describe("handleNetworkRequests, DDG Radar match", () => {
  it("detects a known tracker domain with CONFIRMED confidence", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://www.googletagmanager.com/gtm.js"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.CONFIRMED);
  });

  it("includes the tracker info from the DDG database", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://googletagmanager.com/gtm.js"),
      onTrackerDetected,
    });
    const { tracker } = onTrackerDetected.mock.calls[0][0];
    expect(tracker.domain).toBeTruthy();
    expect(tracker.riskScore).toBeGreaterThan(0);
  });
});

describe("handleNetworkRequests, heuristics (SUSPICIOUS)", () => {
  it("detects a tracking query parameter (fbclid)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/page?fbclid=AbCdEf123"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.SUSPICIOUS);
  });

  it("detects a tracking query parameter (gclid)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/page?gclid=AbCdEf123"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.SUSPICIOUS);
  });

  it("detects a tracking path (/collect)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/collect?v=1"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.SUSPICIOUS);
  });

  it("detects a tracking path (/pixel)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/pixel"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
  });

  it("detects a tracking subdomain (analytics.)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://analytics.unknown-custom-site-xyz.com/data"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.SUSPICIOUS);
  });

  it("detects a tracking subdomain (track.)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://track.unknown-custom-site-xyz.com/event"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
  });

  it("detects cookie-sync pattern (two UUID-like values in query)", () => {
    const onTrackerDetected = vi.fn();
    const uuid1 = "550e8400-e29b-41d4-a716-446655440000";
    const uuid2 = "1234567890abcdef12";
    handleNetworkRequests({
      details: makeDetails(`https://unknown-custom-site-xyz.com/sync?uid=${uuid1}&sid=${uuid2}`),
      onTrackerDetected,
    });
    expect(onTrackerDetected).toHaveBeenCalledOnce();
    expect(onTrackerDetected.mock.calls[0][0].confidence).toBe(TrackerConfidence.SUSPICIOUS);
  });

  it("does not trigger on a single UUID (needs at least two for cookie-sync)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/data?uid=550e8400-e29b-41d4-a716-446655440000"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).not.toHaveBeenCalled();
  });
});

describe("handleNetworkRequests, exclusions and clean URLs", () => {
  it("ignores domains in the false-positive exclusion list", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://fonts.googleapis.com/css?family=Roboto"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).not.toHaveBeenCalled();
  });

  it("ignores cdn.jsdelivr.net (exclusion list)", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://cdn.jsdelivr.net/npm/some-package"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).not.toHaveBeenCalled();
  });

  it("ignores a clean URL with no tracking signals", () => {
    const onTrackerDetected = vi.fn();
    handleNetworkRequests({
      details: makeDetails("https://unknown-custom-site-xyz.com/api/products?page=2"),
      onTrackerDetected,
    });
    expect(onTrackerDetected).not.toHaveBeenCalled();
  });

  it("handles an invalid URL without throwing", () => {
    const onTrackerDetected = vi.fn();
    expect(() =>
      handleNetworkRequests({
        details: makeDetails("not-a-url"),
        onTrackerDetected,
      }),
    ).not.toThrow();
    expect(onTrackerDetected).not.toHaveBeenCalled();
  });
});
