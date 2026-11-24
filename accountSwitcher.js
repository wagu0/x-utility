/** accountSwitcher設定のキー */
const ACCOUNT_SWITCHER_SETTING_KEY = "accountSwitcher";
/** switchAccountsViaPostBoxAvatar設定のキー */
const SWITCH_ACCOUNTS_VIA_POST_BOX_AVATAR_SETTING_KEY =
  "switchAccountsViaPostBoxAvatar";
/** アカウントメニューのセレクタ */
const ACCOUNT_MENU_SELECTOR = '[data-testid="SideNav_AccountSwitcher_Button"]';
/** アカウントメニュークリック後に表示されるメニューのセレクタ プロフィールホバーで表示される要素もhoverCardParentのためhasを指定 */
const HOVER_CARD_SELECTOR =
  '[data-testid="hoverCardParent"]:has([data-testid="AccountSwitcher_ManageAccounts_Button"])';
// 最後に変更されたaccountSwitcherの状態
let lastAccountSwitcherSetting = false;
// 最後に変更されたswitchAccountsViaPostBoxAvatarの状態
let lastSwitchAccountsViaPostBoxAvatarSetting = false;

/** Observerの定義 */
const hoverCardObserver = new MutationObserver(handleHoverCardMutations);
/** ユーザーアバター用のcssセレクタ */
const USER_AVATAR_SELECTOR = '[data-testid^="UserAvatar-Container-"]';
/** ホーム上部に存在するポスト入力欄の親要素cssセレクタ */
const POST_INPUT_PARENT_SELECTOR = '[data-testid="tweetTextarea_0"]';
/** css切り替え用定数 */
const ACCOUNT_MENU_POSITION = {
  CENTER: "center",
  COMPOSER: "composer",
};
/** css保存用変数 */
let currentMenuPosition = ACCOUNT_MENU_POSITION.CENTER;
/** タイムアウト管理 */
let hoverCardTimeoutId = null;

// 初期処理
initializeAccountSwitcher();
initializeSwitchAccountsViaPostBoxAvatar();

// accountSwitcherの初期化
async function initializeAccountSwitcher() {
  const accountSwitcherSetting =
    (await getSetting(ACCOUNT_SWITCHER_SETTING_KEY)) === true;
  // true falseで取得できているためそのまま上書き
  lastAccountSwitcherSetting = accountSwitcherSetting;
}
// switchAccountsViaPostBoxAvatarの初期化
async function initializeSwitchAccountsViaPostBoxAvatar() {
  const switchAccountsViaPostBoxAvatarSetting =
    (await getSetting(SWITCH_ACCOUNTS_VIA_POST_BOX_AVATAR_SETTING_KEY)) ===
    true;
  // true falseで取得できているためそのまま上書き
  lastSwitchAccountsViaPostBoxAvatarSetting =
    switchAccountsViaPostBoxAvatarSetting;
}
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // accountSwitcherの設定を取得しtrueかfalseに変換
    const newAccountSwitcherValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[ACCOUNT_SWITCHER_SETTING_KEY] ===
      true;
    // 設定を取得しtrueかfalseに変換
    const newPostBoxAvatarValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[
        SWITCH_ACCOUNTS_VIA_POST_BOX_AVATAR_SETTING_KEY
      ] === true;
    // 最後に反映した設定値と違う場合は更新
    if (newAccountSwitcherValue !== lastAccountSwitcherSetting) {
      lastAccountSwitcherSetting = newAccountSwitcherValue;
    }
    if (newPostBoxAvatarValue !== lastSwitchAccountsViaPostBoxAvatarSetting) {
      lastSwitchAccountsViaPostBoxAvatarSetting = newPostBoxAvatarValue;
    }
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

  clickAccountMenu(ACCOUNT_MENU_POSITION.CENTER);
});
// アカウントメニューを取得しクリックする関数
function clickAccountMenu(position) {
  const accountMenuElement = document.querySelector(ACCOUNT_MENU_SELECTOR);
  if (accountMenuElement) {
    observeHoverCard();
    currentMenuPosition = position;
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
  if (currentMenuPosition === ACCOUNT_MENU_POSITION.CENTER) {
    hoverCardElement.dataset.accountMenuPosition = "center";
  }
  if (currentMenuPosition === ACCOUNT_MENU_POSITION.COMPOSER) {
    hoverCardElement.dataset.accountMenuPosition = "composer";
  }
}
// documentのクリックイベントリスナー
document.addEventListener(
  "click",
  (event) => {
    // 最後に参照した設定がfalseの場合は処理を行わない
    if (lastSwitchAccountsViaPostBoxAvatarSetting === false) {
      return;
    }
    const targetElement = event.target.closest("a");
    const userAvatarElement = targetElement?.closest(USER_AVATAR_SELECTOR);
    if (!userAvatarElement) {
      return;
    }
    // 3階層上の親要素からポスト入力欄の親要素を取得し、存在する場合はアカウントメニューをクリックする
    const inputElement =
      userAvatarElement.parentElement?.parentElement?.parentElement?.querySelector(
        POST_INPUT_PARENT_SELECTOR,
      );
    if (!inputElement) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const rect = userAvatarElement.getBoundingClientRect();

    document.documentElement.style.setProperty(
      "--account-menu-top",
      `${rect.bottom + 8}px`,
    );

    document.documentElement.style.setProperty(
      "--account-menu-left",
      `${rect.left - 100}px`,
    );
    clickAccountMenu(ACCOUNT_MENU_POSITION.COMPOSER);
  },
  { capture: true },
);
