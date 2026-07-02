/// <reference types="chrome" />

// High-entropy Client Hints reveal detailed device/hardware characteristics beyond the "normal" Sec-CH-UA set,
// source: HTTP headers in MDM Web Docs (Mozilla, 2025a)
// High Entrophy Hints according to WICG (Taylor und Weiss, 2026)
const HIGH_ENTROPY_HINTS = new Set([
  "sec-ch-ua-full-version-list",
  "sec-ch-ua-platform-version",
  "sec-ch-ua-arch",
  "sec-ch-ua-bitness",
  "sec-ch-ua-model",
  "sec-ch-ua-wow64",
  "device-memory",
  "dpr",
  "viewport-width",
  "rtt",
  "downlink",
  "ect",
]);

interface HandleHeaders {
  details: chrome.webRequest.OnHeadersReceivedDetails;
  onClientHintsDetected: () => void;
}

export function handleHeaders({ details, onClientHintsDetected }: HandleHeaders): void {
  const acceptCH = details.responseHeaders?.find(h => h.name.toLowerCase() === "accept-ch");
  if (!acceptCH?.value) return;

  const requested = acceptCH.value.split(",").map(h => h.trim().toLowerCase());
  const matchCount = requested.filter(h => HIGH_ENTROPY_HINTS.has(h)).length;
  if (matchCount >= 2) {
    onClientHintsDetected();
  }
}
