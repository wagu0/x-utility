/** ツイートのセレクタ  */
const MEDIA_TARGET_TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** ツイートに含まれるメディアのセレクタ */
const MEDIA_TARGET_TWEET_IMAGE_SELECTOR = '[data-testid="tweetPhoto"]';
/** すでに非表示にしたツイート要素に付与したdata属性をもとにしたセレクタ */
const HIDDEN_TWEET_SELECTOR = 'article[data-testid="tweet"][data-hidden]';
/** メディアツイート要素に付与したdata属性をもとにしたセレクタ */
const MEDIA_TWEET_SELECTOR = 'article[data-testid="tweet"][data-media]';

/** mediaFilter設定のキー */
const MEDIA_FILTER_SETTING_KEY = "mediaFilter";
/** mediaFilterの現在の設定 */
let isMediaFilterEnabled = false;
//** 現在のフィルターの状態 */
let isMediaFilterActive = false;

// 初回実行
initialize();

// ページが読み込まれたときに実行するためのinitialize関数
async function initialize() {
  isMediaFilterEnabled = (await getSetting(MEDIA_FILTER_SETTING_KEY)) === true;
}
// shift+mキーを判定しmediaFilterの切り替えを行う
document.addEventListener("keydown", (event) => {
  const isShiftM =
    event.key === "M" &&
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey;

  if (!isShiftM || event.repeat) {
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
  // 現在の設定がオフの場合はreturn
  if (!isMediaFilterEnabled) {
    return;
  }
  event.preventDefault();

  toggleMediaFilter();
});
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[MEDIA_FILTER_SETTING_KEY] ===
      true;
    // 最後に反映した設定値と同じ場合は処理しない
    if (newValue === isMediaFilterEnabled) {
      return;
    }
    // 設定の状態を上書き
    if (newValue === true) {
      isMediaFilterEnabled = newValue;
    } else if (newValue === false) {
      isMediaFilterEnabled = newValue;
      // 設定がオフにされたうえでmediaFilterがオンになっている場合はオフにする
      if (isMediaFilterActive) {
        toggleMediaFilter();
      }
    }
  }
});

const mediaFilterObserver = new MutationObserver((mutations) => {
  const tweetElements = new Set();
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      filterAddedTweets(node, tweetElements);
    });
  });
  tweetElements.forEach((tweetElement) => {
    filterMediaTweet(tweetElement);
  });
});
// mediaFilterの設定がオンであれば現在の状態に合わせて実行
function toggleMediaFilter() {
  // 現在のフィルターがonの場合
  if (isMediaFilterActive) {
    stopMediaFilterObserver();
    restoreHiddenTweet();
    showMediaFilterNotification(chrome.i18n.getMessage("mediaFilterOff"));
    isMediaFilterActive = false;
    return;
  }
  if (!isMediaFilterActive) {
    filterExistingTweets();
    mediaFilterObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    showMediaFilterNotification(chrome.i18n.getMessage("mediaFilterOn"));
    isMediaFilterActive = true;
  }
}
// observerを停止する関数
function stopMediaFilterObserver() {
  mediaFilterObserver.disconnect();
}
// 非表示にしたツイートを取得し表示するための関数を呼び出す
function restoreHiddenTweet() {
  const hiddenTweets = document.querySelectorAll(HIDDEN_TWEET_SELECTOR);
  hiddenTweets.forEach((tweetElement) => {
    showTweet(tweetElement);
  });
  // mediaツイートに付与していたdata属性も削除
  clearMediaFilterData();
}
// mediaツイートに付与していたdata属性を削除する関数
function clearMediaFilterData() {
  const mediaTweets = document.querySelectorAll(MEDIA_TWEET_SELECTOR);
  mediaTweets.forEach((tweetElement) => {
    delete tweetElement.dataset.media;
  });
}

function filterExistingTweets() {
  const tweetElements = document.querySelectorAll(MEDIA_TARGET_TWEET_SELECTOR);
  tweetElements.forEach((tweetElement) => {
    filterMediaTweet(tweetElement);
  });
}
// nodeを引数に受け取りツイート要素を取得する関数
function filterAddedTweets(node, tweetElements) {
  // nodeがelement出ない場合return
  if (!(node instanceof Element)) {
    return;
  }
  // nodeがツイート要素の場合
  if (node.matches(MEDIA_TARGET_TWEET_SELECTOR)) {
    tweetElements.add(node);
  }
  // node内にツイート要素があった場合
  const selectorTweets = node.querySelectorAll(MEDIA_TARGET_TWEET_SELECTOR);
  selectorTweets.forEach((tweetElement) => {
    tweetElements.add(tweetElement);
  });
  // nodeがツイート要素の子孫だった場合
  const tmpTweetElement = node.closest(MEDIA_TARGET_TWEET_SELECTOR);
  if (tmpTweetElement) {
    tweetElements.add(tmpTweetElement);
  }
}
// tweetelementを引数に受け取り各ツイートに対しての処理を行う関数
function filterMediaTweet(tweetElement) {
  const imageElement = tweetElement.querySelector(
    MEDIA_TARGET_TWEET_IMAGE_SELECTOR,
  );
  if (imageElement) {
    mediaFilter(tweetElement);
  } else {
    tweetFilter(tweetElement);
  }
}

// mediaツイートに対してdata属性を付与する関数
function mediaFilter(tweetElement) {
  if (!tweetElement.dataset.media) {
    tweetElement.dataset.media = true;
    // すでに検知済みでhidden属性が付与されている場合はhidden属性を削除
    if (tweetElement.dataset.hidden) {
      showTweet(tweetElement);
    }
  }
}
// ツイートに対してdata属性を付与しhidden属性を付与する関数
function tweetFilter(tweetElement) {
  if (!tweetElement.dataset.media && !tweetElement.dataset.hidden) {
    hideTweet(tweetElement);
  }
}
// ツイートに対してdata属性を付与し非表示にする関数
function hideTweet(tweetElement) {
  tweetElement.dataset.hidden = true;
  tweetElement.style.display = "none";
}
// hiddenにしていたツイートを表示し付与していたdata属性を削除する関数
function showTweet(tweetElement) {
  delete tweetElement.dataset.hidden;
  tweetElement.style.removeProperty("display");
}
// メディアフィルターのON/OFF通知
function showMediaFilterNotification(message) {
  const notificationId = "media-filter-notification";

  // 前のメディアフィルター通知があれば削除
  document.getElementById(notificationId)?.remove();

  const notification = document.createElement("div");
  notification.id = notificationId;

  Object.assign(notification.style, {
    position: "fixed",
    bottom: "8%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "99999",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    fontSize: "18px",
    fontFamily: "sans-serif",
    textAlign: "center",
    pointerEvents: "none",
  });

  notification.textContent = message;
  document.body.appendChild(notification);

  // 1.5秒後に、この通知要素だけ削除
  setTimeout(() => {
    notification.remove();
  }, 1500);
}
