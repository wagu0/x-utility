/** Hide Other Account Notifications設定のキー */
const HIDE_OTHER_ACCOUNT_NOTIFICATIONS_SETTING_KEY =
  "hideOtherAccountNotifications";
/** 追加する要素のstyle  */
const HIDE_NOTIFICATION_STYLE_ID = "hide-other-account-notifications";
// 初期化
initializeOtherAccountNotification();

async function initializeOtherAccountNotification() {
  const hideOtherAccountNotificationsSetting =
    (await getSetting(HIDE_OTHER_ACCOUNT_NOTIFICATIONS_SETTING_KEY)) === true;
  // 設定値がtrueなら非表示にする
  if (hideOtherAccountNotificationsSetting) {
    hideOtherAccountNotification();
  }
}
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[
        HIDE_OTHER_ACCOUNT_NOTIFICATIONS_SETTING_KEY
      ] === true;

    if (newValue === true) {
      hideOtherAccountNotification();
    } else if (newValue === false) {
      showOtherAccountNotification();
    }
  }
});

// styleを作成し通知属性を非表示にするcssを適用する
function hideOtherAccountNotification() {
  // cssが存在する場合はreturn
  if (existsOtherAccountNotificationStyle()) {
    return;
  }
  const hideCSS = document.createElement("style");
  // 日本語と英語の両方に対応
  hideCSS.textContent =
    "[data-testid='SideNav_AccountSwitcher_Button'] div[aria-label$='件の未読項目'], " +
    "[data-testid='SideNav_AccountSwitcher_Button'] div[aria-label$='undefined unread items'] {display: none;}";
  hideCSS.id = HIDE_NOTIFICATION_STYLE_ID;
  document.head.appendChild(hideCSS);
}
// styleを削除し通知を再表示する
function showOtherAccountNotification() {
  // cssが存在しない場合はreturn
  if (!existsOtherAccountNotificationStyle()) {
    return;
  }
  const hideCSS = document.getElementById(HIDE_NOTIFICATION_STYLE_ID);
  document.head.removeChild(hideCSS);
}
// すでにcssが存在するかどうかをbool型で返す
function existsOtherAccountNotificationStyle() {
  return document.getElementById(HIDE_NOTIFICATION_STYLE_ID) !== null;
}
