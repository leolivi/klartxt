// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { checkArt13_14 } from "./art13_14"

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("checkArt13_14, found: false", () => {
  it("returns found: false on empty DOM", () => {
    expect(checkArt13_14().found).toBe(false)
  })

  it("returns found: false when links exist but none match privacy patterns", () => {
    document.body.innerHTML = `<footer><a href="/about">About</a><a href="/contact">Contact</a></footer>`
    expect(checkArt13_14().found).toBe(false)
  })
})

describe("checkArt13_14, found: true via href patterns", () => {
  it("detects /privacy-policy in footer href", () => {
    document.body.innerHTML = `<footer><a href="/privacy-policy">Read More</a></footer>`
    const result = checkArt13_14()
    expect(result.found).toBe(true)
    expect(result.searchedLocations).toContain("Footer")
  })

  it("detects /datenschutz in footer href", () => {
    document.body.innerHTML = `<footer><a href="/datenschutz">Link</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })

  it("detects /legal/ in footer href", () => {
    document.body.innerHTML = `<footer><a href="/legal/terms">Terms</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })

  it("detects cookie.policy in footer href", () => {
    document.body.innerHTML = `<footer><a href="/cookie.policy">Cookies</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })
})

describe("checkArt13_14, found: true via link text", () => {
  it("detects 'Privacy Policy' as link text", () => {
    document.body.innerHTML = `<footer><a href="/docs/1">Privacy Policy</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })

  it("detects 'Datenschutz' as link text", () => {
    document.body.innerHTML = `<footer><a href="/docs/2">Datenschutz</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })

  it("detects 'Impressum' as link text", () => {
    document.body.innerHTML = `<footer><a href="/docs/3">Impressum</a></footer>`
    expect(checkArt13_14().found).toBe(true)
  })
})

describe("checkArt13_14, search area priority", () => {
  it("finds link in <nav>", () => {
    document.body.innerHTML = `<nav><a href="/datenschutz">Datenschutz</a></nav>`
    const result = checkArt13_14()
    expect(result.found).toBe(true)
    expect(result.searchedLocations).toContain("Navigation")
  })

  it("finds link in <header>", () => {
    document.body.innerHTML = `<header><a href="/privacy">Privacy</a></header>`
    const result = checkArt13_14()
    expect(result.found).toBe(true)
    expect(result.searchedLocations).toContain("Navigation")
  })

  it("falls back to full document when footer and nav have no match", () => {
    document.body.innerHTML = `<main><p><a href="/privacy">Privacy</a></p></main>`
    const result = checkArt13_14()
    expect(result.found).toBe(true)
    expect(result.searchedLocations).toContain("whole document")
  })

  it("includes searched areas in result even when not found", () => {
    document.body.innerHTML = `<footer><a href="/about">About</a></footer>`
    const result = checkArt13_14()
    expect(result.found).toBe(false)
    // footer and gesamtes Dokument were checked (nav is empty here)
    expect(result.searchedLocations).toContain("Footer")
    expect(result.searchedLocations).toContain("whole document")
  })
})
