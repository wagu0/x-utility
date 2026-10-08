// 設定のキー
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
// 最後に検出したメディアページのURLを保持する変数
let lastMediaPageUrl = null;
// メディアページの画像選択待機中フラグ
let isWaitingForMediaSelection = false;
// 初期処理
initializeMediaDefaultImage();
// 設定の値を取得しtrueの場合は、メディアのデフォルト画像を表示する処理を実行する
async function initializeMediaDefaultImage() {
  const mediaDefaultImageSetting = await getSetting(
    MEDIA_DEFAULT_IMAGE_SETTING_KEY,
  );
  if (mediaDefaultImageSetting === true) {
    observeMediaPage();
  }
}
// DOMを監視してspaのページ遷移を検知する関数
function observeMediaPage() {
  handleMediaPage(); // 初回ロード時の処理
  const observer = new MutationObserver(() => {
    handleMediaPage();
    selectPhoto(); // メディアページの画像選択処理を呼び出す
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
// メディアページのURLを検出する関数
function handleMediaPage() {
  if (!MEDIA_PATH_PATTERN.test(window.location.pathname)) {
    lastMediaPageUrl = null; // メディアページ以外ではURLをリセット
    isWaitingForMediaSelection = false; // メディアページ以外では待機フラグをリセット
    return;
  }
  if (isWaitingForMediaSelection) {
    return;
  }
  if (window.location.pathname !== lastMediaPageUrl) {
    // クエリパラメーターを取得
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get(MEDIA_PAGE_QUERY_PARAM);
    if (filter === MEDIA_PAGE_PHOTO_PARAM) {
      lastMediaPageUrl = window.location.pathname; // URLを更新
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
    lastMediaPageUrl = window.location.pathname;
    isWaitingForMediaSelection = false; // 選択後は待機フラグをリセット
  }
}
