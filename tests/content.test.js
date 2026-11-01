import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ISBN_DETAILS = `
  <div id="rpi-attribute-book_details-isbn13">
    <div><span>ISBN-13</span></div>
    <div></div>
    <div><span>978-4309226712</span></div>
  </div>
`;

async function loadContentScript() {
  const addListener = vi.fn();
  vi.stubGlobal("chrome", { runtime: { onMessage: { addListener } } });
  await import("../content.js");
  return addListener.mock.calls[0][0];
}

function sendMessage(listener, request) {
  const sendResponse = vi.fn();
  listener(request, {}, sendResponse);
  return sendResponse;
}

const badgeCount = () =>
  [...document.body.children].filter((el) => el.style.position === "fixed").length;

describe("content script", () => {
  let execCommand;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    execCommand = vi.fn(() => true);
    document.execCommand = execCommand;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("copies the ISBN-13 from the product details and responds with it", async () => {
    document.body.innerHTML = ISBN_DETAILS;
    const listener = await loadContentScript();

    const sendResponse = sendMessage(listener, { action: "copyText" });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(sendResponse).toHaveBeenCalledWith({ text: "978-4309226712" });
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("shows the success badge for 2.5 seconds after a copy", async () => {
    document.body.innerHTML = ISBN_DETAILS;
    const listener = await loadContentScript();

    sendMessage(listener, { action: "copyText" });
    expect(badgeCount()).toBe(1);

    vi.advanceTimersByTime(2499);
    expect(badgeCount()).toBe(1);
    vi.advanceTimersByTime(1);
    expect(badgeCount()).toBe(0);
  });

  it("reuses one badge and restarts its timer on repeated copies", async () => {
    document.body.innerHTML = ISBN_DETAILS;
    const listener = await loadContentScript();

    sendMessage(listener, { action: "copyText" });
    vi.advanceTimersByTime(2000);
    sendMessage(listener, { action: "copyText" });
    expect(badgeCount()).toBe(1);

    vi.advanceTimersByTime(2000);
    expect(badgeCount()).toBe(1);
    vi.advanceTimersByTime(500);
    expect(badgeCount()).toBe(0);
  });

  it("does not copy when the page has no ISBN-13", async () => {
    const listener = await loadContentScript();

    const sendResponse = sendMessage(listener, { action: "copyText" });

    expect(execCommand).not.toHaveBeenCalled();
    expect(sendResponse).toHaveBeenCalledWith({ text: "" });
    expect(badgeCount()).toBe(0);
  });

  it("does not show the badge when the copy command fails", async () => {
    document.body.innerHTML = ISBN_DETAILS;
    execCommand.mockReturnValue(false);
    const listener = await loadContentScript();

    sendMessage(listener, { action: "copyText" });

    expect(badgeCount()).toBe(0);
  });

  it("ignores messages with other actions", async () => {
    document.body.innerHTML = ISBN_DETAILS;
    const listener = await loadContentScript();

    const sendResponse = sendMessage(listener, { action: "other" });

    expect(execCommand).not.toHaveBeenCalled();
    expect(sendResponse).not.toHaveBeenCalled();
  });
});
