// 定数
const RECORD_BUTTON_CLASS = ".record-button";
const SHORTCUT_ITEM_CLASS = ".shortcut-item";
const CLEAR_BUTTON_CLASS = ".clear-button";
const ERROR_CLASS = ".shortcut-error";
/** 追加しているクラスのため.はなし */
const IS_RECORDING_CLASS = "is-recording";
const KEY_CLASS = ".key";
// 初期処理
setUpRecordButton();
setUpClearButton();
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
// すべてのクリアボタンにイベントを設定する
function setUpClearButton() {
  const clearButtons = document.querySelectorAll(CLEAR_BUTTON_CLASS);
  for (const clearButton of clearButtons) {
    clearButton.addEventListener("click", () => {
      const shortcutItem = clearButton.closest(SHORTCUT_ITEM_CLASS);
      clearShortcutSetting(shortcutItem);
    });
  }
}
// ショートカットのレコードが開始されたら該当のshortcutItemにis-recordingクラスを追加する
function startRecording(shortcutItem) {
  // すでにrecord中のshortcutItemがある場合は、そちらのrecordを終了する
  const recordingShortcutItem = getRecordingShortcutItem();
  if (recordingShortcutItem) {
    stopRecording(recordingShortcutItem);
  }
  shortcutItem.classList.add("is-recording");
}
// ショートカットのレコードが終了したら該当のshortcutItemからis-recordingクラスを削除する
function stopRecording(shortcutItem) {
  shortcutItem.classList.remove("is-recording");
  hideErrorMessages(shortcutItem);
}
// キーダウンイベント
document.addEventListener("keydown", async (event) => {
  const targetShortcutItem = getRecordingShortcutItem();
  if (!targetShortcutItem) {
    return;
  }
  // ESCキーが押された場合はレコードをキャンセルする
  if (event.key === "Escape") {
    stopRecording(targetShortcutItem);
    return;
  }
  // 修飾キーが押されている場合は無視する
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    return;
  }
  // すでに同じキーが設定されている場合は無視する
  const actionName = await getActionName(event.key.toUpperCase());
  if (actionName) {
    const errorElement = targetShortcutItem.querySelector(ERROR_CLASS);
    errorElement.classList.add("is-visible");

    return;
  }
  hideErrorMessages(targetShortcutItem);
  const keyElement = targetShortcutItem.querySelector(KEY_CLASS);
  // ショートカットの設定を保存する
  saveShortcutSettings(
    targetShortcutItem.dataset.action,
    event.key.toUpperCase(),
  );
  keyElement.textContent = event.key.toUpperCase();
  targetShortcutItem.classList.remove("is-recording");
});
// shortcutItemがrecord中かどうかを判定する関数
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
// ショートカットの設定をクリアする関数
function clearShortcutSetting(shortcutItem) {
  const targetAction = shortcutItem.dataset.action;
  chrome.storage.local.remove(targetAction);
  const keyElement = shortcutItem.querySelector(KEY_CLASS);
  keyElement.textContent = "Not set";
}
// キーからアクション名を取得する関数
async function getActionName(key) {
  const items = await chrome.storage.local.get(null);
  for (const [action, value] of Object.entries(items)) {
    if (value === key) {
      return action;
    }
  }
  return null;
}
// エラーメッセージを非表示にする関数
function hideErrorMessages(shortcutItem) {
  const errorElement = shortcutItem.querySelector(ERROR_CLASS);
  errorElement.classList.remove("is-visible");
}
