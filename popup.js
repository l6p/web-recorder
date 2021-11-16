const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultArea = document.getElementById("resultArea");

function syncRecordBtn() {
  chrome.storage.local.get("recording", ({recording}) => {
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
  // 改变点击按钮的状态
  chrome.storage.local.set({
    recording: true,
  });
  syncRecordBtn();

  // 发送按钮点击事件
  chrome.runtime.sendMessage({action: 'startRecording'});
});

stopBtn.addEventListener("click", async () => {
  // 改变点击按钮的状态
  chrome.storage.local.set({
    recording: false,
  });
  syncRecordBtn();

  chrome.storage.local.get(["urlPrefixes", "startUrl", "actions"], (data) => {
    resultArea.value = JSON.stringify(data, null, 2);
  });
});
