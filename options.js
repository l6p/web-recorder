const urlPrefixDepthInput = document.getElementById("urlPrefixDepth");
const saveBtn = document.getElementById("saveBtn");

function fillOptions() {
  chrome.storage.local.get("urlPrefixDepth", ({urlPrefixDepth}) => {
    urlPrefixDepthInput.value = urlPrefixDepth;
  });
}
fillOptions();

saveBtn.addEventListener("click", async () => {
  chrome.storage.local.set({
    urlPrefixDepth: parseInt(urlPrefixDepthInput.value)
  });
});
