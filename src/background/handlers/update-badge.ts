import { cache } from "../service-worker";

// function to set the extension badge
function setBadge(tabId: number, riskLevel: number) {
  if (riskLevel === 0) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }

  chrome.action.setBadgeText({
    text: riskLevel.toString(),
    tabId,
  });

  // color based on risk level (1-5)
  // TODO: update colors
  let color = "#3E7F4A"; // green (low risk)
  if (riskLevel >= 4) color = "#8F2F2F"; // red (high risk)
  else if (riskLevel === 3) color = "#9A5A1E"; // orange (medium risk)

  chrome.action.setBadgeBackgroundColor({
    color,
    tabId,
  });

  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({
      color: "#FFFFFF",
      tabId,
    });
  }
}

export function updateTabBadge(tabId: number) {
  const riskLevel = cache.getOverallRiskScore(tabId);
  setBadge(tabId, riskLevel);
}
