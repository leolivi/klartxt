// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { checkArt7 } from "./art7";

// "#_evidon_banner" is a confirmed entry in CMP_SELECTORS (cmp-selectors.json)
const BANNER_ID = "_evidon_banner";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("checkArt7", () => {
  it("returns bannerVisible: false on empty DOM", () => {
    expect(checkArt7().bannerVisible).toBe(false);
  });

  it("returns bannerVisible: true when a CMP banner element is present and visible", () => {
    const el = document.createElement("div");
    el.id = BANNER_ID;
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(true);
  });

  it("returns bannerVisible: false when the banner element is display:none", () => {
    const el = document.createElement("div");
    el.id = BANNER_ID;
    el.style.display = "none";
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(false);
  });

  it("returns bannerVisible: false when the banner element is visibility:hidden", () => {
    const el = document.createElement("div");
    el.id = BANNER_ID;
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(false);
  });

  it("returns bannerVisible: false when the banner element has opacity:0", () => {
    const el = document.createElement("div");
    el.id = BANNER_ID;
    el.style.opacity = "0";
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(false);
  });

  it("returns bannerVisible: true for fallback selector: id containing cookie_notification (large enough)", () => {
    const el = document.createElement("div");
    el.id = "cookie_notification";
    el.getBoundingClientRect = () =>
      ({
        width: 800,
        height: 150,
        top: 0,
        left: 0,
        bottom: 150,
        right: 800,
      }) as DOMRect;
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(true);
  });

  it("returns bannerVisible: false for fallback selector: element too small (footer link)", () => {
    const el = document.createElement("a");
    el.setAttribute("aria-label", "cookie settings");
    el.getBoundingClientRect = () =>
      ({
        width: 120,
        height: 20,
        top: 900,
        left: 0,
        bottom: 920,
        right: 120,
      }) as DOMRect;
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(false);
  });

  it("returns bannerVisible: true for fallback selector: aria-label containing cookie (large enough)", () => {
    const el = document.createElement("div");
    el.setAttribute("aria-label", "cookie banner");
    el.getBoundingClientRect = () =>
      ({
        width: 800,
        height: 150,
        top: 0,
        left: 0,
        bottom: 150,
        right: 800,
      }) as DOMRect;
    document.body.appendChild(el);
    expect(checkArt7().bannerVisible).toBe(true);
  });

  it("returns bannerVisible: true when at least one of multiple CMP elements is visible", () => {
    const hidden = document.createElement("div");
    hidden.id = BANNER_ID;
    hidden.style.display = "none";

    const visible = document.createElement("div");
    visible.id = "adsk-eprivacy-body"; // another confirmed CMP selector

    document.body.appendChild(hidden);
    document.body.appendChild(visible);
    expect(checkArt7().bannerVisible).toBe(true);
  });
});
