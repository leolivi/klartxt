import type {
  ConsentTimingResult,
  ContentScriptDsgvoResult,
  Art7Check,
  Art13_14Check,
  Art25Check
} from "@/utils/types/dsgvo-types";
import { CheckSeverity } from "@/utils/types/dsgvo-types";
import { TrackerCategory, TrackerConfidence, type TrackerInfo } from "@/utils/types/tracking-enums";
import { ART7_TEMPLATES, ART13_14_TEMPLATES, ART25_TEMPLATES } from "./dsgvo-check-templates";

const HIGH_RISK_SCORE_BENCHMARK = 30;

function isConsentTool(tracker: TrackerInfo): boolean {
    return tracker.detailedCategories.includes(TrackerCategory.CONSENT);
}

export function confirmedTrackers(trackers: TrackerInfo[]): TrackerInfo[] {
    return trackers.filter(
        (t) => t.confidence === TrackerConfidence.CONFIRMED && !isConsentTool(t)
    );
}

function highRiskTrackers(trackers: TrackerInfo[]): TrackerInfo[] {
    return confirmedTrackers(trackers).filter(
        (t) => t.riskScore > HIGH_RISK_SCORE_BENCHMARK
    );
}

export function evaluateArt7(
  art7: ContentScriptDsgvoResult["art7"],
  trackers: TrackerInfo[],
  cookieCount: number,
  consentTiming: ConsentTimingResult | null
): Art7Check {
  const consentViolations = consentTiming?.cookiesSetBeforeConsent ?? [];
  const cookiesAfterConsent = consentTiming?.cookiesSetAfterConsent ?? [];
  const evidence: string[] = [];
  let severity: CheckSeverity;
  let passed: boolean;

  // CONFIRMED violation: cookies were set before consent
  if (
    consentTiming != null &&
    consentTiming.bannerShownAt != null &&
    consentViolations.length > 0
  ) {
    severity = CheckSeverity.CONFIRMED;
    passed = false;
    evidence.push(`${consentViolations.length} Cookie(s) wurden VOR der Einwilligung gesetzt`);
    consentViolations.forEach(cookie => {
      evidence.push(`- ${cookie.name} (${cookie.domain})`);
    });
  }
  // SUSPICIOUS: banner visible and tracking/cookies detected
  else if (art7.bannerVisible && (confirmedTrackers(trackers).length > 0 || cookieCount > 0)) {
    severity = CheckSeverity.SUSPICIOUS;
    passed = false;
    evidence.push("Cookie-Banner erkannt");
    if (confirmedTrackers(trackers).length > 0) {
      evidence.push(`${confirmedTrackers(trackers).length} Tracker aktiv`);
    }
    if (cookieCount > 0) {
      evidence.push(`${cookieCount} Cookie(s) vorhanden`);
    }
  }
  // FINE: no violations detected
  else {
    severity = CheckSeverity.FINE;
    passed = true;
    if (consentTiming?.bannerShownAt) {
      evidence.push("Cookie-Banner wurde angezeigt");
    }
    if (cookiesAfterConsent.length > 0) {
      evidence.push(`${cookiesAfterConsent.length} Cookie(s) erst NACH Einwilligung gesetzt`);
    }
    if (!art7.bannerVisible && cookieCount === 0 && trackers.length === 0) {
      evidence.push("Keine Cookies oder Tracker erkannt");
    }
  }

  const template = ART7_TEMPLATES[severity];

  return {
    passed,
    severity,
    ...ART7_TEMPLATES.base,
    ...template,
    evidence,
    consentViolations,
    cookiesAfterConsent,
  };
}

export function evaluateArt13_14(
  privacyPolicyFound: boolean,
  searchedLocations: string[]
): Art13_14Check {
  const evidence: string[] = [];
  let severity: CheckSeverity;
  let passed: boolean;

  if (privacyPolicyFound) {
    severity = CheckSeverity.FINE;
    passed = true;
    evidence.push("Link zur Datenschutzerklaerung gefunden");
    evidence.push(`Gefunden in: ${searchedLocations.join(", ")}`);
  } else {
    severity = CheckSeverity.CONFIRMED;
    passed = false;
    evidence.push("Kein Link zur Datenschutzerklaerung gefunden");
    evidence.push(`Durchsuchte Bereiche: ${searchedLocations.join(", ")}`);
  }

  const template = ART13_14_TEMPLATES[severity];

  return {
    passed,
    severity,
    ...ART13_14_TEMPLATES.base,
    ...template,
    evidence,
    privacyPolicyFound,
    searchedLocations,
  };
}

export function evaluateArt25(
  isHttps: boolean,
  trackers: TrackerInfo[],
  domFingerprintingDetected: boolean
): Art25Check {
  const highRisk = highRiskTrackers(trackers);
  // Network-level fingerprinting: any confirmed tracker with DDG score >= 2
  const networkFingerprintingTrackers = confirmedTrackers(trackers).filter(t => t.fingerprintingScore >= 2);
  const fingerprintingDetected = domFingerprintingDetected || networkFingerprintingTrackers.length > 0;

  const evidence: string[] = [];
  let severity: CheckSeverity;
  let passed: boolean;

  if (!isHttps) {
    severity = CheckSeverity.CONFIRMED;
    passed = false;
    evidence.push("Verbindung ist NICHT verschlüsselt (HTTP statt HTTPS)");
  } else if (highRisk.length > 0) {
    severity = CheckSeverity.CONFIRMED;
    passed = false;
    evidence.push(`${highRisk.length} High-Risk Tracker erkannt`);
    highRisk.forEach(tracker => {
      evidence.push(`- ${tracker.domain} (Risk Score: ${tracker.riskScore})`);
    });
  } else if (confirmedTrackers(trackers).length > 0 || fingerprintingDetected) {
    severity = CheckSeverity.SUSPICIOUS;
    passed = true; // not a violation, but worth noting
    if (confirmedTrackers(trackers).length > 0) {
      evidence.push(`${confirmedTrackers(trackers).length} Tracker erkannt (kein High-Risk)`);
    }
    if (networkFingerprintingTrackers.length > 0) {
      evidence.push(`${networkFingerprintingTrackers.length} Fingerprinting-Domain(s) erkannt (DDG f≥2)`);
      networkFingerprintingTrackers.forEach(t => {
        evidence.push(`- ${t.domain} (DDG Fingerprinting-Score: ${t.fingerprintingScore})`);
      });
    }
    if (domFingerprintingDetected) {
      evidence.push("DOM-seitiges Fingerprinting erkannt (Canvas oder bekannte Script-Domain)");
    }
  } else {
    severity = CheckSeverity.FINE;
    passed = true;
    evidence.push("HTTPS aktiv");
    evidence.push("Keine High-Risk Tracker oder Fingerprinting erkannt");
  }

  const template = ART25_TEMPLATES[severity];

  return {
    passed,
    severity,
    ...ART25_TEMPLATES.base,
    ...template,
    evidence,
    highRiskTrackerCount: highRisk.length,
    isHttps,
    highRiskTrackers: highRisk.map(t => t.domain),
    fingerprintingDetected,
  };
}