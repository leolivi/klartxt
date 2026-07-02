/// <reference types="chrome" />
import { chromium, type BrowserContext } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * Launches a persistent Chromium context with the built extension loaded.
 * Requires a production build to exist in ./build, run `npm run build` first.
 */
export async function launchWithExtension(): Promise<BrowserContext> {
  const pathToExtension = path.resolve("./build");

  if (!fs.existsSync(pathToExtension)) {
    throw new Error(`Extension build not found at ${pathToExtension}.\nRun "npm run build" before running E2E tests.`);
  }

  // mkdtempSync is atomic guarantees a unique dir even across parallel workers
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pw-klartxt-"));

  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`, "--no-sandbox"],
  });
}
