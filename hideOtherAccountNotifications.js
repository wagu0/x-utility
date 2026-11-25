/** Hide Other Account Notifications設定のキー */
const HIDE_OTHER_ACCOUNT_NOTIFICATIONS_SETTING_KEY =
  "hideOtherAccountNotifications";
/** 左下のアカウント切り替えボタンに設定するstyleID  */
const HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_STYLE_ID =
  "hide-account-switcher-button-notifications";
/** アカウントメニューに設定するstyleID */
const HIDE_ACCOUNT_MENU_NOTIFICATIONS_STYLE_ID =
  "hide-account-menu-notifications";
/** 左下のアカウント切り替えボタンに設定するCSS */
const HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_CSS =
  "[data-testid='SideNav_AccountSwitcher_Button'] [aria-label$='件の未読項目'], " +
  "[data-testid='SideNav_AccountSwitcher_Button'] [aria-label$='unread items'] {display: none !important;}";
/** アカウントメニューに設定するCSS */
const HIDE_ACCOUNT_MENU_NOTIFICATIONS_CSS =
  "[data-testid='UserCell'] [aria-label$='件の未読項目'], " +
  "[data-testid='UserCell'] [aria-label$='unread items'] {display: none !important;}";
// 初期化
initializeHideOtherAccountNotification();

async function initializeHideOtherAccountNotification() {
  const hideOtherAccountNotificationsSetting =
    (await getSetting(HIDE_OTHER_ACCOUNT_NOTIFICATIONS_SETTING_KEY)) === true;
  // 設定値がtrueなら非表示にする
  if (hideOtherAccountNotificationsSetting) {
    hideAccountSwitcherButtonNotifications();
    hideAccountMenuNotifications();
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
      hideAccountSwitcherButtonNotifications();
      hideAccountMenuNotifications();
    } else if (newValue === false) {
      showAccountSwitcherButtonNotifications();
      showAccountMenuNotifications();
    }
  }
});

// styleを作成し左下のアカウント切り替えボタンに通知を非表示にするcssを適用する
function hideAccountSwitcherButtonNotifications() {
  // cssが存在する場合はreturn
  if (existAccountSwitcherButtonNotificationsStyle()) {
    return;
  }
  const hideCSS = document.createElement("style");
  // 日本語と英語の両方に対応
  hideCSS.textContent = HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_CSS;
  hideCSS.id = HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_STYLE_ID;
  document.head.appendChild(hideCSS);
}
// styleを削除しアカウント切り替えボタンの通知を再表示する
function showAccountSwitcherButtonNotifications() {
  // cssが存在しない場合はreturn
  if (!existAccountSwitcherButtonNotificationsStyle()) {
    return;
  }
  const hideCSS = document.getElementById(
    HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_STYLE_ID,
  );
  document.head.removeChild(hideCSS);
}
// すでにcssが存在するかどうかをbool型で返す
function existAccountSwitcherButtonNotificationsStyle() {
  return (
    document.getElementById(
      HIDE_ACCOUNT_SWITCHER_BUTTON_NOTIFICATIONS_STYLE_ID,
    ) !== null
  );
}
// styleを作成しアカウントメニューの通知を非表示にするcssを適用する
function hideAccountMenuNotifications() {
  // cssが存在する場合はreturn
  if (existAccountMenuNotificationsStyle()) {
    return;
  }
  const hideCSS = document.createElement("style");
  // 日本語と英語の両方に対応
  hideCSS.textContent = HIDE_ACCOUNT_MENU_NOTIFICATIONS_CSS;
  hideCSS.id = HIDE_ACCOUNT_MENU_NOTIFICATIONS_STYLE_ID;
  document.head.appendChild(hideCSS);
}
// styleを削除しアカウントメニューの通知を再表示する
function showAccountMenuNotifications() {
  // cssが存在しない場合はreturn
  if (!existAccountMenuNotificationsStyle()) {
    return;
  }
  const hideCSS = document.getElementById(
    HIDE_ACCOUNT_MENU_NOTIFICATIONS_STYLE_ID,
  );
  document.head.removeChild(hideCSS);
}
// すでにcssが存在するかどうかをbool型で返す
function existAccountMenuNotificationsStyle() {
  return (
    document.getElementById(HIDE_ACCOUNT_MENU_NOTIFICATIONS_STYLE_ID) !== null
  );
}
s;
