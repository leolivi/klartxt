import { sendResult } from "../content-script"
import {
  attachInteractionListener,
  findBannerElement,
  reportBannerShown,
} from "./observe-consent"

/* ---- DOM Observer ---- */
export function observeDomChanges() {
  let timeout: number | undefined

  const observer = new MutationObserver(() => {
    if (!chrome.runtime?.id) {
      observer.disconnect()
      return
    }

    if (timeout) clearTimeout(timeout)

    timeout = window.setTimeout(() => {
      sendResult()

      // check banner on each DOM change
      const banner = findBannerElement()
      if (banner != null) {
        reportBannerShown()
        attachInteractionListener(banner)
      }

      timeout = undefined
    }, 300)
  })

  const root = document.body ?? document.documentElement
  if (!root) return

  observer.observe(root, {
    childList: true,
    subtree: true,
  })

  sendResult()

  // SPA safety
  setTimeout(() => {
    observer.disconnect()
  }, 20000)
}
