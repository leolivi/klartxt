import { PRIVACY_PATTERNS } from "@/data/dsgvo/dsgvo-detectors";

function hasPrivacyPolicyLink(containers: Element[]): boolean {
  return containers.some(container =>
    Array.from(container.querySelectorAll("a[href]")).some(a => {
      const href = a.getAttribute("href") ?? "";
      const text = a.textContent ?? "";
      return PRIVACY_PATTERNS.test(href) || PRIVACY_PATTERNS.test(text);
    })
  );
}

/* ---- Art. 13/14: Data Policy available ---- */
// Limitation: can only detect direct links based on defined patterns. Hidden policies cannot be detected that way
export function checkArt13_14(): { found: boolean; searchedLocations: string[] } {
  const footerSelectors = ["footer", "[role='contentinfo']", "#footer", ".footer"];
  const navSelectors = ["nav", "[role='navigation']", "header"];

  const searchAreas = [
    { name: "Footer", containers: footerSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))) },
    { name: "Navigation", containers: navSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))) },
    { name: "whole document", containers: [document.body] },
  ];

  const searchedLocations: string[] = [];

  for (const area of searchAreas) {
    if (area.containers.length > 0) {
      searchedLocations.push(area.name);
      if (hasPrivacyPolicyLink(area.containers)) {
        return { found: true, searchedLocations };
      }
    }
  }

  return { found: false, searchedLocations };
}