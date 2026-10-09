// mediaDefaultImage設定のキー
const MEDIA_DEFAULT_IMAGE_SETTING_KEY = "mediaDefaultImage";
// メディアページのURLパターン
const MEDIA_PATH_PATTERN = /^\/[A-Za-z0-9_]{1,15}\/media\/?$/;
const MEDIA_PAGE_QUERY_PARAM = "filter";
// メディアページの画像が選択されているときのクエリパラメーターの値
const MEDIA_PAGE_PHOTO_PARAM = "photo";
// メディアページのフィルタタブのセレクター
const FILTER_TAB_SELECTOR = 'a[role="tab"][aria-haspopup="menu"]';
// メディアページのフィルタタブのメニューのセレクター
const MEDIA_FILTER_MENUITEM_SELECTOR =
  '[data-testid="Dropdown"] [role="menuitem"]';
// observerの定義
const observer = new MutationObserver(() => {
  handleMediaPage();
  selectPhoto(); // メディアページの画像選択処理を呼び出す
});
// 最後に検出したメディアページのURLを保持する変数
let lastMediaPagePath = null;
// メディアページの画像選択待機中フラグ
let isWaitingForMediaSelection = false;
// 最後に変更された設定の状態
let lastMediaDefaultImageSetting = null;
// 初期処理
initializeMediaDefaultImage();

// 設定の値を取得し設定の値を返す関数
async function initializeMediaDefaultImage() {
  const mediaDefaultImageSetting =
    (await getSetting(MEDIA_DEFAULT_IMAGE_SETTING_KEY)) === true;

  // 初回の設定の状態を保存
  if (mediaDefaultImageSetting === true) {
    observeMediaPage();
    lastMediaDefaultImageSetting = true;
  } else if (mediaDefaultImageSetting === false) {
    lastMediaDefaultImageSetting = false;
    return;
  }
}
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[
        MEDIA_DEFAULT_IMAGE_SETTING_KEY
      ] === true;
    // 最後に反映した設定値と同じ場合は処理しない
    if (newValue === lastMediaDefaultImageSetting) {
      return;
    }
    if (newValue === true) {
      observeMediaPage();
      // 最後に変更された設定の状態を更新
      lastMediaDefaultImageSetting = true;
    } else if (newValue === false) {
      stopObserver();
      // 最後に変更された設定の状態を更新
      lastMediaDefaultImageSetting = false;
    }
  }
});
// DOMを監視してspaのページ遷移を検知する関数
function observeMediaPage() {
  observer.observe(document.body, { childList: true, subtree: true });
  handleMediaPage(); // mediaページを直接開いた場合と設定が変更された場合のための呼び出し
}
// メディアページのURLを検出する関数
function handleMediaPage() {
  if (!MEDIA_PATH_PATTERN.test(window.location.pathname)) {
    lastMediaPagePath = null; // メディアページ以外ではURLをリセット
    isWaitingForMediaSelection = false; // メディアページ以外では待機フラグをリセット
    return;
  }
  if (isWaitingForMediaSelection) {
    return;
  }
  if (window.location.pathname !== lastMediaPagePath) {
    // クエリパラメーターを取得
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get(MEDIA_PAGE_QUERY_PARAM);
    if (filter === MEDIA_PAGE_PHOTO_PARAM) {
      lastMediaPagePath = window.location.pathname; // URLを更新
      return; // すでに画像フィルタが選択されている場合は処理を終了
    }
    const filterTab = document.querySelector(FILTER_TAB_SELECTOR);
    if (filterTab) {
      filterTab.click();
      isWaitingForMediaSelection = true;
    }
  }
}
// メディアのフィルタタブから画像を選択する関数
function selectPhoto() {
  if (!isWaitingForMediaSelection) {
    return;
  }
  // メディアのフィルタメニューを取得し2番目の要素をクリックする
  const mediaFilterMenu = document.querySelectorAll(
    MEDIA_FILTER_MENUITEM_SELECTOR,
  );
  const photoMenuItem = mediaFilterMenu[1]; // 2番目の要素を取得
  if (photoMenuItem) {
    photoMenuItem.click();
    lastMediaPagePath = window.location.pathname;
    isWaitingForMediaSelection = false; // 選択後は待機フラグをリセット
  }
}
// observerを停止する関数
function stopObserver() {
  observer.disconnect();
  lastMediaPagePath = null;
  isWaitingForMediaSelection = false;
}
