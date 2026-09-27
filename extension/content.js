let popupHost = null;
let popupElements = null;
let requestNumber = 0;

document.addEventListener("dblclick", (event) => {
  const target = event.target;
  if (target instanceof Element &&
      (target.closest("input, textarea, select, [contenteditable='true']") ||
       target.isContentEditable)) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const word = selection.toString().trim();
  if (!word || word.length > 100 || /\s/.test(word) ||
      !/^[\p{L}\p{M}'’\-]+$/u.test(word)) return;

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const id = ++requestNumber;
  showPopup(rect.left + window.scrollX, rect.bottom + window.scrollY, word, "Translating…");

  chrome.runtime.sendMessage({ type: "TRANSLATE_WORD", word }, result => {
    if (id !== requestNumber || !popupElements) return;
    if (chrome.runtime.lastError) return showError("Extension communication failed. Reload WordBridge.");
    if (!result || result.error) return showError(result?.error || "Translation failed.");
    popupElements.translation.textContent = result.translation || "No translation returned.";
    popupElements.meaning.textContent = result.meaning || "";
    popupElements.footer.textContent = `WordBridge · ${result.language || ""}`;
  });
});

function showPopup(x, y, original, message) {
  removePopup();
  popupHost = document.createElement("div");
  const shadow = popupHost.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    .container{position:relative;width:260px;box-sizing:border-box;padding:18px;border-radius:12px;background:#fff;color:#1f2937;border:1px solid #e2e8f0;box-shadow:0 8px 32px #0003;font:14px Arial,sans-serif}
    .original{color:#64748b;font-size:13px;margin-bottom:8px;padding-right:22px}
    .translation{font-size:25px;font-weight:700;line-height:1.5;overflow-wrap:anywhere}
    .meaning{font-size:13px;line-height:1.5;margin-top:8px;color:#475569;overflow-wrap:anywhere}
    .footer{font-size:10px;color:#94a3b8;margin-top:12px;border-top:1px solid #e2e8f0;padding-top:8px}
    .close{position:absolute;top:8px;right:8px;width:26px;height:26px;margin:0;padding:0;border:0;border-radius:50%;background:#f1f5f9;color:#475569;font-size:20px;cursor:pointer}
  `;
  shadow.appendChild(style);
  const container = document.createElement("div");
  container.className = "container";
  const close = document.createElement("button");
  close.className = "close"; close.textContent = "×"; close.title = "Close";
  close.addEventListener("click", removePopup);
  const originalNode = document.createElement("div");
  originalNode.className = "original"; originalNode.textContent = original;
  const translation = document.createElement("div");
  translation.className = "translation"; translation.textContent = message;
  const meaning = document.createElement("div"); meaning.className = "meaning";
  const footer = document.createElement("div"); footer.className = "footer"; footer.textContent = "WordBridge";
  container.append(close, originalNode, translation, meaning, footer);
  shadow.appendChild(container); // Correct: append children to shadow root.
  document.documentElement.appendChild(popupHost);
  popupElements = { translation, meaning, footer };
  popupHost.style.position = "absolute"; popupHost.style.zIndex = "2147483647";
  popupHost.style.left = `${Math.max(0, x)}px`;
  popupHost.style.top = `${Math.max(0, y + 8)}px`;
}
function showError(message) {
  if (!popupElements) return;
  popupElements.translation.textContent = "Translation error";
  popupElements.meaning.textContent = message;
}
function removePopup() {
  popupHost?.remove(); popupHost = null; popupElements = null;
}
document.addEventListener("click", event => {
  if (popupHost && !popupHost.contains(event.target)) removePopup();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") removePopup();
});