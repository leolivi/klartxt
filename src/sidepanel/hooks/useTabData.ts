import { extractDomain } from "@/utils/domain"
import type { TabData, TabDataMessage } from "@/utils/types/tab-types"
import { useEffect, useState } from "react"

const DEFAULT_TAB_DATA: TabData = {
  trackerCount: 0,
  trackerList: [],
  cookieCount: 0,
  cookiesList: [],
  isPartialData: false,
  riskScore: 0,
  dsgvoResult: null,
  scanDuration: null,
}

export function useTabData() {
  const [data, setData] = useState<TabData>(DEFAULT_TAB_DATA)
  const [domain, setDomain] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastScanned, setLastScanned] = useState<Date | null>(null)

  const isChromeExtension = typeof chrome !== "undefined" && !!chrome.tabs

  useEffect(() => {
    // tabId lets E2E tests pin the sidepanel to a specific tab so screenshots show the real scan data instead of the sidepanel tab's own (empty) data
    const params = new URLSearchParams(window.location.search)
    const forcedId = Number(params.get("tabId")) || null
    const forcedUrl = params.get("tabUrl") ?? ""

    async function fetchData() {
      if (!isChromeExtension) return
      const [tab] = forcedId
        ? [{ id: forcedId, url: forcedUrl } as chrome.tabs.Tab]
        : await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) return
      setIsLoaded(false)
      setDomain(extractDomain(tab.url ?? ""))
      chrome.runtime.sendMessage(
        { type: "GET_TAB_DATA", tabId: tab.id },
        (response: TabData) => {
          if (response) {
            setData(response)
            setIsLoaded(true)
            setLastScanned(new Date())
          }
        },
      )
    }

    fetchData()

    if (!isChromeExtension) return

    const handleActivated = () => fetchData()
    const handleUpdated = (_tabId: number, changeInfo: { status?: string }) => {
      if (changeInfo.status === "complete") fetchData()
    }
    const handleMessage = (message: TabDataMessage) => {
      if (message.type === "TAB_DATA_UPDATED") {
        if (forcedId) {
          if (message.tabId === forcedId) {
            setData(message)
            setLastScanned(new Date())
          }
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (tab?.id === message.tabId) {
              setData(message)
              setLastScanned(new Date())
            }
          })
        }
      }
    }
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchData()
    }

    chrome.tabs.onActivated.addListener(handleActivated)
    chrome.tabs.onUpdated.addListener(handleUpdated)
    chrome.runtime.onMessage.addListener(handleMessage)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated)
      chrome.tabs.onUpdated.removeListener(handleUpdated)
      chrome.runtime.onMessage.removeListener(handleMessage)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isChromeExtension])

  return { data, domain, isLoaded, lastScanned }
}
