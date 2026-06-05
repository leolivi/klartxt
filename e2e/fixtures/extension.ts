/// <reference types="chrome" />
import  { chromium, type BrowserContext } from "@playwright/test";
import path from "path";
import os from "os";
import fs from "fs";

/**
 * Launches a persistent Chromium context with the built extension loaded.
 * Requires a production build to exist in ./build — run `npm run build` first.
 */
export async function launchWithExtension(): Promise<BrowserContext> {
  const pathToExtension = path.resolve("./build");

  if (!fs.existsSync(pathToExtension)) {
    throw new Error(
      `Extension build not found at ${pathToExtension}.\nRun "npm run build" before running E2E tests.`
    );
  }

  // Each test gets its own isolated user data directory
  const userDataDir = path.join(os.tmpdir(), `pw-klartxt-${Date.now()}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      "--no-sandbox",
    ],
  });
}
