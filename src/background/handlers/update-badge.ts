import { cache } from "../service-worker";

// function to set the extension badge
function setBadge(tabId: number, riskLevel: number) {
  const ignoreTabGone = () => {};

  if (riskLevel === 0) {
    chrome.action.setBadgeText({ text: "", tabId }).catch(ignoreTabGone);
    return;
  }

  chrome.action.setBadgeText({ text: riskLevel.toString(), tabId }).catch(ignoreTabGone);

  // color based on risk level (1-5)
  // TODO: update colors
  let color = "#3E7F4A"; // green (low risk)
  if (riskLevel >= 4) color = "#8F2F2F"; // red (high risk)
  else if (riskLevel === 3) color = "#9A5A1E"; // orange (medium risk)

  chrome.action.setBadgeBackgroundColor({ color, tabId }).catch(ignoreTabGone);

  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({ color: "#FFFFFF", tabId }).catch(ignoreTabGone);
  }
}

export function updateTabBadge(tabId: number) {
  const riskLevel = cache.getOverallRiskScore(tabId);
  setBadge(tabId, riskLevel);
}
