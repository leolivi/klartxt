import { cache } from "../service-worker";
import { RISK_COLORS } from "@/utils/tokens";

// set badge color and text based on the current risk score
function setBadge(tabId: number, riskLevel: number) {
  const ignoreTabGone = () => {};

  if (riskLevel === 0) {
    chrome.action.setBadgeText({ text: "", tabId }).catch(ignoreTabGone);
    return;
  }

  chrome.action.setBadgeText({ text: riskLevel.toString(), tabId }).catch(ignoreTabGone);

  let color: string = RISK_COLORS.low.text;
  if (riskLevel >= 4) color = RISK_COLORS.high.text;
  else if (riskLevel === 3) color = RISK_COLORS.medium.text;

  chrome.action.setBadgeBackgroundColor({ color, tabId }).catch(ignoreTabGone);

  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({ color: "#FFFFFF", tabId }).catch(ignoreTabGone);
  }
}

export function updateTabBadge(tabId: number) {
  const riskLevel = cache.getOverallRiskScore(tabId);
  setBadge(tabId, riskLevel);
}
