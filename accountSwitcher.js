/** accountSwitcher設定のキー */
const ACCOUNT_SWITCHER_SETTING_KEY = "accountSwitcher";
/** アカウントメニューのセレクタ */
const ACCOUNT_MENU_SELECTOR = '[data-testid="SideNav_AccountSwitcher_Button"]';
/** アカウントメニュークリック後に表示されるメニューのセレクタ プロフィールホバーで表示される要素もhoverCardParentのためhasを指定 */
const HOVER_CARD_SELECTOR =
  '[data-testid="hoverCardParent"]:has([data-testid="AccountSwitcher_ManageAccounts_Button"])';
// 最後に変更された設定の状態
let lastAccountSwitcherSetting = false;
/** Observerの定義 */
const hoverCardObserver = new MutationObserver(handleHoverCardMutations);

/** タイムアウト管理 */
let hoverCardTimeoutId = null;

// 初期処理
initializeAccountSwitcher();

async function initializeAccountSwitcher() {
  const accountSwitcherSetting =
    (await getSetting(ACCOUNT_SWITCHER_SETTING_KEY)) === true;
  // true falseで取得できているためそのまま上書き
  lastAccountSwitcherSetting = accountSwitcherSetting;
}
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[ACCOUNT_SWITCHER_SETTING_KEY] ===
      true;
    // 最後に反映した設定値と同じ場合は処理しない
    if (newValue === lastAccountSwitcherSetting) {
      return;
    }
    lastAccountSwitcherSetting = newValue;
  }
});
document.addEventListener("keydown", (event) => {
  // 最後に参照した設定がfalseの場合は処理を行わない
  if (lastAccountSwitcherSetting === false) {
    return;
  }
  // shift+spaceキーのみ判定 spaceは空白で判定 別の修飾キーが押された場合は処理を行わない
  const isShiftSpace =
    event.key === " " &&
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey;

  // shift+spaceキーのみ判定をする repeatは除外
  if (!isShiftSpace || event.repeat) {
    return;
  }
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }

  event.preventDefault();

  clickAccountMenu();
});
// アカウントメニューを取得しクリックする関数
function clickAccountMenu() {
  const accountMenuElement = document.querySelector(ACCOUNT_MENU_SELECTOR);
  if (accountMenuElement) {
    observeHoverCard();
    accountMenuElement.click();
  }
}
// DOM変更時の処理
function handleHoverCardMutations() {
  const hoverCardElement = document.querySelector(HOVER_CARD_SELECTOR);
  if (!hoverCardElement) {
    return;
  }

  stopObservingHoverCard();
  hoverCardStyle(hoverCardElement);
}

// 監視開始
function observeHoverCard() {
  stopObservingHoverCard();

  hoverCardObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  hoverCardTimeoutId = setTimeout(stopObservingHoverCard, 2000);
}

// 監視停止
function stopObservingHoverCard() {
  hoverCardObserver.disconnect();
  clearTimeout(hoverCardTimeoutId);
  hoverCardTimeoutId = null;
}

// アカウントメニュークリック後に表示されるメニューのスタイルを変更する関数
function hoverCardStyle(hoverCardElement) {
  hoverCardElement.dataset.accountSwitcherCentered = "true";
}
