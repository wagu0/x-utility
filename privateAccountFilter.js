/** privateAccountFilter設定のキー */
const PRIVATE_ACCOUNT_FILTER_SETTING_KEY = "privateAccountFilter";
/** プライベートアカウントのセレクタ */
const PRIVATE_ACCOUNT_SELECTOR = '[data-testid="icon-lock"]';
/** ツイートのセレクタ content.jsと協業するため変数名を別名に変更 */
const TARGET_TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** observerの定義 */
const privateTweetObserver = new MutationObserver(handleTweetMutations);
// 最後に変更された設定の状態
let lastPrivateAccountFilterSetting = null;

// 初期処理
initializePrivateAccountFilter();

// 設定の値を取得し設定の値を返す関数
async function initializePrivateAccountFilter() {
  const privateAccountFilterSetting =
    (await getSetting(PRIVATE_ACCOUNT_FILTER_SETTING_KEY)) === true;

  // 最後の設定の状態を保存
  if (privateAccountFilterSetting === true) {
    observeTweets();
    processExistingTweets();
    lastPrivateAccountFilterSetting = true;
  } else if (privateAccountFilterSetting === false) {
    lastPrivateAccountFilterSetting = false;
    return;
  }
}
// chrome.storage.localの変更を監視する関数
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
    // 設定を取得しtrueかfalseに変換
    const newValue =
      changes[SETTINGS_STORAGE_KEY].newValue?.[
        PRIVATE_ACCOUNT_FILTER_SETTING_KEY
      ] === true;
    // 最後に反映した設定値と同じ場合は処理しない
    if (newValue === lastPrivateAccountFilterSetting) {
      return;
    }
    if (newValue === true) {
      observeTweets();
      processExistingTweets();
      // 最後に変更された設定の状態を更新
      lastPrivateAccountFilterSetting = true;
    } else if (newValue === false) {
      stopPrivateTweetObserver();
      resetAllPrivateTweetBlur();
      // 最後に変更された設定の状態を更新
      lastPrivateAccountFilterSetting = false;
    }
  }
});
// ツイート要素を監視して、プライベートアカウントのアイコンが存在する場合にぼかしを適用する
function observeTweets() {
  privateTweetObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
// 対象のツイートにぼかしを適用する関数
function handleTweetMutations(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // node自身が対象のツイートの場合の処理
        if (node.matches(TARGET_TWEET_SELECTOR)) {
          processPrivateTweet(node);
        }
        const tweetElements = node.querySelectorAll(TARGET_TWEET_SELECTOR);
        tweetElements.forEach((tweetElement) => {
          processPrivateTweet(tweetElement);
        });
      }
    });
  });
}
// tweetElementが対象であるかを判定しapplyPrivateTweetBlurを実行する
function processPrivateTweet(tweetElement) {
  const privateAccountIcon = tweetElement.querySelector(
    PRIVATE_ACCOUNT_SELECTOR,
  );
  // プライベートアカウントのアイコンが存在し、まだぼかしが適用されていない場合にぼかしを適用する
  if (privateAccountIcon && !tweetElement.dataset.privateState) {
    applyPrivateTweetBlur(tweetElement);
  }
}
// すでに表示済みのツイートにぼかしを適用する関数
function processExistingTweets() {
  const tweetElements = document.querySelectorAll(TARGET_TWEET_SELECTOR);
  tweetElements.forEach((tweetElement) => {
    processPrivateTweet(tweetElement);
  });
}
// ツイートにぼかしを適用する関数
function applyPrivateTweetBlur(tweetElement) {
  tweetElement.style.filter = "blur(5px)";
  tweetElement.dataset.privateState = "blurred"; // ぼかし済みを示すdata属性を付与
  // 一回だけクリックイベントを追加して、クリック時にイベントを停止する
  tweetElement.addEventListener("click", handlePrivateTweetClick, {
    once: true,
  });
}
// ツイート要素に付与するためのクリックイベントハンドラ
function handlePrivateTweetClick(event) {
  const tweetElement = event.currentTarget;
  // X側のイベントをキャンセル
  event.preventDefault();
  event.stopPropagation();
  tweetElement.style.removeProperty("filter"); // クリック時にぼかしを解除
  tweetElement.dataset.privateState = "revealed"; // ぼかし解除済みを示すdata属性に変更
}
// observerを停止する関数
function stopPrivateTweetObserver() {
  privateTweetObserver.disconnect();
}
// すでに処理済みのツイートへの変更をすべて解除する
function resetAllPrivateTweetBlur() {
  // 設定したdata属性をセレクタに用いて取得
  const tweetElements = document.querySelectorAll("[data-private-state]");
  tweetElements.forEach((tweetElement) => {
    // ぼかされているツイートに対してぼかしを解除しdata属性を削除
    tweetElement.style.removeProperty("filter");
    delete tweetElement.dataset.privateState;
    tweetElement.removeEventListener("click", handlePrivateTweetClick);
  });
}
