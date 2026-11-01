import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("background service worker", () => {
  let onClicked;
  let sendMessage;

  beforeEach(async () => {
    vi.resetModules();
    sendMessage = vi.fn();
    vi.stubGlobal("chrome", {
      action: { onClicked: { addListener: vi.fn((listener) => (onClicked = listener)) } },
      runtime: { lastError: undefined },
      tabs: { sendMessage },
    });
    await import("../background.js");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks the clicked tab to copy its ISBN", () => {
    onClicked({ id: 42 });

    expect(sendMessage).toHaveBeenCalledWith(42, { action: "copyText" }, expect.any(Function));
  });
});
