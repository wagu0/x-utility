/** Hide DM Notifications設定のキー */
const HIDE_DM_NOTIFICATIONS_SETTING_KEY = "hideDMNotifications";
/** 追加する要素のstyle  */
const HIDE_DM_NOTIFICATIONS_STYLE_ID = "hide-dm-notifications";
// 初期化
initializeHideDMNotifications();

async function initializeHideDMNotifications() {
  const hideDMNotificationsSetting =
    (await getSetting(HIDE_DM_NOTIFICATIONS_SETTING_KEY)) === true;
  // 設定値がtrueなら非表示にする
  if (hideDMNotificationsSetting) {
    hideDMNotification();
  }
}
chrome.storage.localの変更を監視する関数;
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[
        HIDE_DM_NOTIFICATIONS_SETTING_KEY
      ] === true;

    if (newValue === true) {
      hideDMNotification();
    } else if (newValue === false) {
      showDMNotification();
    }
  }
});
// styleを作成し通知属性を非表示にするcssを適用する
function hideDMNotification() {
  // cssが存在する場合はreturn
  if (existsDMNotificationStyle()) {
    return;
  }
  const hideCSS = document.createElement("style");
  // 日本語と英語の両方に対応
  hideCSS.textContent =
    "[data-testid='AppTabBar_DirectMessage_Link'] div[aria-label$='件の未読項目'], " +
    "[data-testid='AppTabBar_DirectMessage_Link'] div[aria-label$='unread items'] {display: none;}";
  hideCSS.id = HIDE_DM_NOTIFICATIONS_STYLE_ID;
  document.head.appendChild(hideCSS);
}
// styleを削除し通知を再表示する
function showDMNotification() {
  // cssが存在しない場合はreturn
  if (!existsDMNotificationStyle()) {
    return;
  }
  const hideCSS = document.getElementById(HIDE_DM_NOTIFICATIONS_STYLE_ID);
  document.head.removeChild(hideCSS);
}
// すでにcssが存在するかどうかをbool型で返す
function existsDMNotificationStyle() {
  return document.getElementById(HIDE_DM_NOTIFICATIONS_STYLE_ID) !== null;
}
