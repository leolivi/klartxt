import type { BrowserContext } from "@playwright/test";

/**
 * Resolves the dynamically assigned extension ID from the service worker URL.
 * Format: chrome-extension://<id>/src/background/service-worker.js
 */
export async function getExtensionId(context: BrowserContext): Promise<string> {
  let sw = context.serviceWorkers()[0];
  if (!sw) {
    sw = await context.waitForEvent("serviceworker", { timeout: 10_000 });
  }
  return new URL(sw.url()).hostname;
}

// The built extension serves the sidepanel at the root index.html (manifest: side_panel.default_path = "index.html").
// tabId + tabUrl pin the sidepanel to a specific tab for E2E screenshots (see useTabData ?tabId param).
export function sidepanelUrl(extensionId: string, tabId?: number, tabUrl?: string): string {
  const base = `chrome-extension://${extensionId}/index.html`;
  if (!tabId) return base;
  const p = new URLSearchParams({ tabId: String(tabId) });
  if (tabUrl) p.set("tabUrl", tabUrl);
  return `${base}?${p}`;
}
