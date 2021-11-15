const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultArea = document.getElementById("resultArea");

function syncRecordBtn() {
  chrome.storage.sync.get("recording", ({recording}) => {
    if (recording) {
      startBtn.className = "disable";
      stopBtn.className = "stop";
      resultArea.value = "";
    } else {
      startBtn.className = "stop";
      stopBtn.className = "disable";
    }
  });
}

syncRecordBtn();

startBtn.addEventListener("click", async () => {
  // 得到点击按钮时当前的Tab
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  // 改变点击按钮的状态
  chrome.storage.sync.set({
    recording: true,
    startUrl: tab.url,
    tabs: [tab.id],
    actions: []
  });
  syncRecordBtn();

  // 发送按钮点击事件
  chrome.runtime.sendMessage({action: 'startRecording'});
});

stopBtn.addEventListener("click", async () => {
  // 改变点击按钮的状态
  chrome.storage.sync.set({
    recording: false,
  });
  syncRecordBtn();

  chrome.storage.sync.get(["startUrl", "actions"], (data) => {
    resultArea.value = JSON.stringify(data, null, 2);
  });
});
