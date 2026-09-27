// After deploying the Cloudflare Worker, replace this URL with its workers.dev URL.
//const API_ENDPOINT = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/translate";
const API_ENDPOINT = "https://wordbridge-proxy.retlaw-ai-lab.workers.dev/translate";

const LANGUAGES = {
  hindi: "Hindi",
  marathi: "Marathi",
  kannada: "Kannada",
  gujarati: "Gujarati",
  punjabi: "Punjabi"
};

chrome.runtime.onInstalled.addListener(async (details) => {
  const settings = await chrome.storage.local.get(["language"]);
  if (!settings.language) {
    await chrome.storage.local.set({ language: "hindi" });
  }
  if (details.reason === "install") chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "TRANSLATE_WORD") return;

  translateWord(message.word)
    .then(sendResponse)
    .catch(error => sendResponse({ error: error.message || "Translation failed" }));

  return true;
});

async function translateWord(word) {
  const { language = "hindi" } = await chrome.storage.local.get("language");
  if (!LANGUAGES[language]) throw new Error("Select a supported language.");

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, language })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Proxy API error (${response.status})`);
  }
  return data;
}