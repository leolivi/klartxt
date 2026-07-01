/// <reference types="chrome" />

import { runDsgvoChecks } from "./run-dsgvo"
import { observeConsent } from "./utils/observe-consent"
import { observeDomChanges } from "./utils/observeDomChanges"

/* ---- Initialize ---- */
function init(): void {
  sendResult()
  observeDomChanges()
  observeConsent()
}

// initialize if content is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}

/* ---- run checks and send them to the SW ---- */
export function sendResult() {
  const result = runDsgvoChecks()

  try {
    chrome.runtime
      .sendMessage({
        type: "DSGVO_CHECKS_RESULT",
        result,
      })
      .catch(() => {})
  } catch (error) {
    console.debug("[content-script] sendResult failed:", error)
  }
}

/* ---- MESSAGE LISTENER ---- */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!chrome.runtime?.id) return false

  if (message.type === "PING") {
    sendResponse({ alive: true })
    return true
  }

  if (message.type === "RUN_DSGVO_CHECKS") {
    sendResult()
    sendResponse({ success: true })
    return true
  }
})
