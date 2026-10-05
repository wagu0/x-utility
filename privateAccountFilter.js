// TODO 鍵垢ツイートにぼかし済みを示すdata属性を付与する
// TODO クリックでぼかし解除した際にdata属性も削除する
// TODO 同じツイートへのぼかし処理・クリックイベントの多重登録を防ぐ
// TODO Optionsに鍵垢ツイートぼかし機能のON/OFF設定を追加する
// TODO ON/OFF設定をchrome.storage.localに保存する
// TODO ページ読み込み時に設定値を取得する
// TODO ON時のみMutationObserverで鍵垢ツイートを監視する
// TODO OFF → ON時に監視を開始し、表示済みツイートにもぼかしを適用する
// TODO ON → OFF時にMutationObserverを停止する
// TODO ON → OFF時にぼかし済みツイートをすべて解除する
// TODO 初期表示されている鍵垢ツイートも検出できるか確認する
// TODO スクロール・hover・画面遷移後も正常に動作するか確認する
/** プライベートアカウントのセレクタ */
const PRIVATE_ACCOUNT_SELECTOR = '[data-testid="icon-lock"]';
//ツイート要素を監視して、プライベートアカウントのアイコンが存在する場合にぼかしを適用する
function observeTweets() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tweetElements = node.querySelectorAll(TWEET_SELECTOR);
          tweetElements.forEach((tweetElement) => {
            const privateAccountIcon = tweetElement.querySelector(
              PRIVATE_ACCOUNT_SELECTOR,
            );
            // プライベートアカウントのアイコンが存在する場合
            if (privateAccountIcon) {
              applyPrivateTweetBlur(tweetElement);
            }
          });
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
// ツイートにぼかしを適用する関数
function applyPrivateTweetBlur(tweetElement) {
  tweetElement.style.filter = "blur(5px)";
  // 一回だけクリックイベントを追加して、クリック時にイベントを停止する
  tweetElement.addEventListener(
    "click",
    (event) => {
      console.log("Clicked element:", event.target);
      event.preventDefault();
      event.stopPropagation();
      tweetElement.style.filter = "none"; // クリック時にぼかしを解除
    },
    { once: true },
  );
}
