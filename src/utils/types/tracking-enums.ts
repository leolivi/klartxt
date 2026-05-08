// Network Tracking Category
/* 
Categories are based on categories extraction file @tracker-categories-ectraction.py
This file evaluates the categories from the Duck Duck Go Tracker Radar Json Files.
*/

// Conficence Level of Tracking detection
export enum TrackerConfidence {
  CONFIRMED = "confirmed",   // DDG Radar Match + Heuristics
  SUSPICIOUS = "suspicious", // only Heuristics
}

export interface TrackerInfo {
    domain: string;
    owner: string | null;
    userCategory: TrackerCategoryForUser;
    detailedCategories: TrackerCategory[];
    riskScore: number;
    confidence: TrackerConfidence;
    fingerprintingScore: number; // DDG Tracker Radar fingerprinting score: 0=none 1=low 2=medium 3=high
}

export interface DetectedTracker {
  tracker: TrackerInfo;
  confidence: TrackerConfidence;
}

// Tracker Category for Users (simplyfied)
export enum TrackerCategoryForUser {
  TRACKING = "tracking",
  ADS = "ads",
  FUNCTIONAL = "functional",
  CONTENT = "content",
  SECURITY = "security"
}

export enum TrackerCategory {
  AD = "advertising", // Werbung 
  ANALYTICS = "analytics", // Nutzerverhalten messen (z.B. Google Analytics)
  SOCIAL = "social", // Social Media Integration (Like, Share, etc.)
  SESSION = "session_replay", // zeichnet User-Sessions auf (Mausbewegung, Klicks, teilweise sehr invasiv)
  CDN = "content_delivery_network", // Infrastruktur zum Laden von Assets (nicht zwingend Tracking)
  EMBEDDED = "embedded_content", // eingebettete externe Inhalte (YouTube, Maps etc.)
  FUNCTIONAL = "functional", // notwendige Features (Login, Payment, Chat)
  CONSENT = "consent_management", // Cookie-Banners
  TAG_MANAGER = "tag_manager", // lädt dynamisch Tracker nach
  SECURITY = "security", // Fraud Detection, Schutzmechanismen
  MALWARE = "malware", // klar schädlich
  UNKNOWN = "unknown", // nicht zuordenbar
}

