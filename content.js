function getXPathText(xpath) {
  const iterator = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
  const node = iterator.iterateNext();
  return node ? node.textContent : "";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyText") {
    const xpath = `//div[@id="rpi-attribute-book_details-isbn13"]/div[3]/span`;
    const text = getXPathText(xpath);
    copyToTheClipboard(text);
    sendResponse({ text });
  }
});

let copySuccessBadge;
let copySuccessTimeout;

function showCopySuccess() {
  clearTimeout(copySuccessTimeout);
  if (!copySuccessBadge) {
    copySuccessBadge = document.createElement("div");
    copySuccessBadge.style.cssText =
      "all: initial; position: fixed; right: 24px; top: 24px; z-index: 2147483647; pointer-events: none;";
    const shadow = copySuccessBadge.attachShadow({ mode: "closed" });
    const badge = document.createElement("div");
    badge.setAttribute("role", "status");
    badge.style.cssText =
      "background: #15803d; color: #fff; padding: 10px 16px; border-radius: 8px; box-shadow: 0 4px 16px #0003; font: 600 14px/1.5 system-ui, sans-serif;";
    shadow.appendChild(badge);
    document.body.appendChild(copySuccessBadge);
    badge.textContent = "Copy success!";
  }
  copySuccessTimeout = setTimeout(() => {
    copySuccessBadge.remove();
    copySuccessBadge = null;
  }, 2500);
}

function copyToTheClipboard(textToCopy) {
  if (!textToCopy.trim()) return;

  const el = document.createElement("textarea");
  el.value = textToCopy;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(el);
  }
  if (copied) showCopySuccess();
}
