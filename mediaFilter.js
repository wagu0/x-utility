/** ツイートのセレクタ  */
const MEDIA_TARGET_TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** ツイートに含まれるメディアのセレクタ */
const MEIDA_TARGET_TWEET_IMAGE_SELECTOR = '[data-testid="tweetPhoto"]';
/** すでに非表示にしたツイート要素に付与されているdata属性をもとにしたセレクタ */
const MEDIA_HIDDEN_TWEET_SELECTOR = 'article[data-testid="tweet"][data-hidden]';
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
// tweetelementを引数に受け取り各ツイートに対しての処理を行う関数
function filterMediaTweet(tweetElement) {
  const imageElement = tweetElement.querySelector(
    MEIDA_TARGET_TWEET_IMAGE_SELECTOR,
  );
  if (imageElement) {
    mediaFilter(tweetElement);
  } else {
    tweetFilter(tweetElement);
  }
}
// ページが読み込まれたときに実行するためのinitialize関数
function initializeMediaFilter() {
  // 初回実行
  filterExistingTweets();
  // DOMの変更を監視
  mediaFilterObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
// observerを停止する関数
function stopMediaFilterObserver() {
  mediaFilterObserver.disconnect();
}
function filterExistingTweets(tweetElement) {
  const tweetElements = document.querySelectorAll(MEDIA_TARGET_TWEET_SELECTOR);
  tweetElements.forEach((tweetElement) => {
    filterMediaTweet(tweetElement);
  });
}
// 初回実行
initializeMediaFilter();
// 10秒後にツイートを再表示
setTimeout(() => {
  console.log("10秒後にツイートを再表示します");
  stopMediaFilterObserver();
  restoreHiddenTweet();
  console.log(document.querySelectorAll("[data-hidden]").length);
}, 10000);
setTimeout(() => {
  initializeMediaFilter();
}, 10000);
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
function restoreHiddenTweet() {
  const hiddenTweets = document.querySelectorAll(MEDIA_HIDDEN_TWEET_SELECTOR);
  hiddenTweets.forEach((tweetElement) => {
    showTweet(tweetElement);
  });
}
