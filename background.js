chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({
    urlPrefixDepth: 1,
    recording: false,
    urlPrefixes: [],
    startUrl: "",
    tabs: [],
    actions: []
  });
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "startRecording") {
    // 得到点击按钮时当前的Tab
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.storage.local.get("urlPrefixDepth", ({urlPrefixDepth}) => {
      const [urlPrefixes, url] = splitUrl([], urlPrefixDepth, tab.url);

      chrome.storage.local.set({
        urlPrefixes: urlPrefixes,
        startUrl: url,
        tabs: [tab.id],
        actions: []
      });
    });

    processTabs();
  }
});

chrome.tabs.onCreated.addListener(function (tab) {
  chrome.storage.local.get("tabs", ({tabs}) => {
    tabs.push(tab.id)
    chrome.storage.local.set({tabs});
  });
  processTabs();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  processTabs();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.storage.local.get("tabs", ({tabs}) => {
    const index = tabs.indexOf(tabId);
    if (index > -1) {
      tabs.splice(index, 1);
    }
    chrome.storage.local.set({tabs});
  });
});

function processTabs() {
  chrome.storage.local.get(["urlPrefixes", "urlPrefixDepth", "tabs"], async ({urlPrefixes, urlPrefixDepth, tabs}) => {
    for (let i = 0; i < tabs.length; i++) {
      const tab = await chrome.tabs.get(tabs[i]);
      const data = splitUrl(urlPrefixes, urlPrefixDepth, tab.url);
      urlPrefixes = data[0];

      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["utils.js", "listeners.js"]
      }, function () {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: executeScript,
          args: [data[1]]
        });
      });
    }
    chrome.storage.local.set({urlPrefixes});
  });
}

function executeScript(tabUrl) {
  addListeners(tabUrl);
}

function splitUrl(urlPrefixes, urlPrefixDepth, url) {
  const httpPattern = `^((http|https):\/\/(.*?\/){${urlPrefixDepth}})(.*)$`;
  let matches = new RegExp(httpPattern).exec(url);
  let urlPrefix = matches[1];
  let urlPath = matches[4];

  let prefixIdx = urlPrefixes.indexOf(urlPrefix);
  if (prefixIdx === -1) {
    urlPrefixes.push(urlPrefix);
    prefixIdx = urlPrefixes.length - 1;
  }

  return [urlPrefixes, `{${prefixIdx}}${urlPath}`];
}
