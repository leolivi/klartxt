// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
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
