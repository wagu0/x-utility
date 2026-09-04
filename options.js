// 定数
const RECORD_BUTTON_CLASS = ".record-button";
const SHORTCUT_ITEM_CLASS = ".shortcut-item";
/** 追加しているクラスのため.はなし */
const IS_RECORDING_CLASS = "is-recording";
const KEY_CLASS = ".key";
// 初期処理
setUpRecordButton();
loadShortcutSettings();
//　すべてのショートカットボタンにイベントを設定する
function setUpRecordButton() {
  const shortcutButtons = document.querySelectorAll(RECORD_BUTTON_CLASS);
  for (const shortcutButton of shortcutButtons) {
    shortcutButton.addEventListener("click", () => {
      const shortcutItem = shortcutButton.closest(SHORTCUT_ITEM_CLASS);
      startRecording(shortcutItem);
      getRecordingShortcutItem();
    });
  }
}
// ショートカットのレコードが開始されたら該当のshortcutItemにis-recordingクラスを追加する
function startRecording(shortcutItem) {
  shortcutItem.classList.add("is-recording");
}
// キーダウンイベント
document.addEventListener("keydown", (event) => {
  const targetShortcutItem = getRecordingShortcutItem();
  if (!targetShortcutItem) {
    return;
  }
  const keyElement = targetShortcutItem.querySelector(KEY_CLASS);
  // ショートカットの設定を保存する
  saveShortcutSettings(
    targetShortcutItem.dataset.action,
    event.key.toUpperCase(),
  );
  keyElement.textContent = event.key.toUpperCase();
  targetShortcutItem.classList.remove("is-recording");
});
//
function isRecording(shortcutItem) {
  return shortcutItem.classList.contains(IS_RECORDING_CLASS);
}
// record中のshortcutItemを返す関数
function getRecordingShortcutItem() {
  const shortcutItems = document.querySelectorAll(SHORTCUT_ITEM_CLASS);
  for (const shortcutItem of shortcutItems) {
    if (isRecording(shortcutItem)) {
      return shortcutItem;
    }
  }
}
// ショートカットの設定を保存する関数
function saveShortcutSettings(action, key) {
  chrome.storage.local.set({ [action]: key });
}
// ショートカットの設定を取得する関数
function loadShortcutSettings() {
  chrome.storage.local.get(null, (items) => {
    for (const [action, key] of Object.entries(items)) {
      const shortcutItem = document.querySelector(
        `${SHORTCUT_ITEM_CLASS}[data-action="${action}"]`,
      );
      if (shortcutItem) {
        const keyElement = shortcutItem.querySelector(KEY_CLASS);
        keyElement.textContent = key;
      }
    }
  });
}
