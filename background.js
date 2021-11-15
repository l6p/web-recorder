chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    recording: false,
    startUrl: "",
    tabs: [],
    actions: []
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startRecording") {
    processTabs();
  }
});

chrome.tabs.onCreated.addListener(function (tab) {
  chrome.storage.sync.get("tabs", ({tabs}) => {
    tabs.push(tab.id)
    chrome.storage.sync.set({tabs});
  });
  processTabs();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  processTabs();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.storage.sync.get("tabs", ({tabs}) => {
    const index = tabs.indexOf(tabId);
    if (index > -1) {
      tabs.splice(index, 1);
    }
    chrome.storage.sync.set({tabs});
  });
});

function processTabs() {
  chrome.storage.sync.get("tabs", async ({tabs}) => {
    for (let i = 0; i < tabs.length; i++) {
      const tab = await chrome.tabs.get(tabs[i]);
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["utils.js", "listeners.js"]
      }, function () {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: addListeners,
          args: [tab.url]
        });
      });
    }
  });
}

function addListeners(tabUrl) {
  addInputListener(tabUrl);
  addClickListener(tabUrl);
}
