import { describe, expect, it, vi } from "vitest";
import { handleHeaders } from "./handle-headers";

function makeDetails(headers: { name: string; value: string }[]): chrome.webRequest.OnHeadersReceivedDetails {
  return {
    requestId: "1",
    url: "https://example.com/",
    method: "GET",
    frameId: 0,
    parentFrameId: -1,
    tabId: 1,
    type: "main_frame" as chrome.webRequest.ResourceType,
    timeStamp: 0,
    statusLine: "HTTP/1.1 200 OK",
    statusCode: 200,
    documentLifecycle: "active",
    frameType: "outermost_frame",
    responseHeaders: headers,
  };
}

describe("handleHeaders, Accept-CH client hints", () => {
  it("does not trigger on response without Accept-CH header", () => {
    const cb = vi.fn();
    handleHeaders({ details: makeDetails([]), onClientHintsDetected: cb });
    expect(cb).not.toHaveBeenCalled();
  });

  it("does not trigger for low-entropy hints only", () => {
    const cb = vi.fn();
    handleHeaders({
      details: makeDetails([{ name: "Accept-CH", value: "Sec-CH-UA, Sec-CH-UA-Mobile" }]),
      onClientHintsDetected: cb,
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("does not trigger for a single high-entropy hint", () => {
    const cb = vi.fn();
    handleHeaders({
      details: makeDetails([{ name: "Accept-CH", value: "Sec-CH-UA-Full-Version-List" }]),
      onClientHintsDetected: cb,
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("triggers for two or more high-entropy hints", () => {
    const cb = vi.fn();
    handleHeaders({
      details: makeDetails([{ name: "Accept-CH", value: "Device-Memory, DPR" }]),
      onClientHintsDetected: cb,
    });
    expect(cb).toHaveBeenCalledOnce();
  });

  it("is case-insensitive for header name", () => {
    const cb = vi.fn();
    handleHeaders({
      details: makeDetails([{ name: "accept-ch", value: "Sec-CH-UA-Arch, Device-Memory" }]),
      onClientHintsDetected: cb,
    });
    expect(cb).toHaveBeenCalledOnce();
  });

  it("triggers only once even with multiple high-entropy hints", () => {
    const cb = vi.fn();
    handleHeaders({
      details: makeDetails([
        {
          name: "Accept-CH",
          value: "Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Device-Memory",
        },
      ]),
      onClientHintsDetected: cb,
    });
    expect(cb).toHaveBeenCalledOnce();
  });
});
