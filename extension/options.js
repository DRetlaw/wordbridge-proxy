const languageSelect = document.getElementById("language");
const status = document.getElementById("status");
async function loadSettings() {
  const settings = await chrome.storage.local.get("language");
  languageSelect.value = settings.language || "hindi";
}
document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({ language: languageSelect.value });
  status.textContent = "Language saved!";
});
loadSettings();