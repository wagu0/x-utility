//todo 画像保存時にファイル名に投稿者のIDと投稿日時を付与する
//todo 画像保存場所をユーザーが選択できるようにする

/** 画像が含まれたツイートを検知するためのセレクタ */
const IMAGE_TWEET_SELECTOR = '[data-testid="tweetPhoto"]';
/** ホバーしているツイート内の画像を保存する変数 */
let targetTweetImg = null;

const SAVE_TRIGGER_KEY = "l"; // 画像保存のトリガーキーを定義
const IMG_REGEX = /https:\/\/pbs\.twimg\.com\/media\/\w+\.\w+&name=\w+/; // 画像URLの正規表現

// マウスホバーしているツイート内の画像を検出するイベントリスナー
document.addEventListener("mouseover", (event) => {
    const closestTweetImg = event.target.closest(IMAGE_TWEET_SELECTOR);
    // ツイートが保存されているか確認し、保存されていない場合は新たに保存する
    if (closestTweetImg) {
        if (targetTweetImg === closestTweetImg) {
            console.log("検知済みの画像ツイート");
            return;
        }
        // 保存された画像ツイートの出力
        console.log("TweetImg hovered:", closestTweetImg);
        // 保存された画像ツイートを更新
        targetTweetImg = closestTweetImg;
    }
});
// トリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
    // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
        return;
    }
    // トリガーキーが押されたときのみ後続処理
    if (event.key === SAVE_TRIGGER_KEY) {
        console.log("Lキーが押されました！");
        const img = targetTweetImg.querySelector("img");

        if (!img) {
            console.log("保存対象の画像が見つかりませんでした。");
            return;
        }
        console.log("保存対象の画像要素:", img);

        // src属性からURLを取得して、URLをそぎ落としてorigを取得する処理をここに追加
        const imgSrc = img.getAttribute("src");
        if (!imgSrc) {
            console.log("画像のURLが見つかりませんでした。");
            return;
        }
        console.log("画像のURL:", imgSrc);

        // 画像URLからorigを抽出する処理
        const origUrl = imgSrc.replace(/&name=\w+/, "&name=orig");
        console.log("orig画像のURL:", origUrl);
        console.log("chrome.donwloads:", chrome.downloads);

        //service_worker.jsに送信するテスト
        chrome.runtime.sendMessage({ action: "downloadImage", url: origUrl }, (response) => {
            if (response && response.success) {
                console.log("画像のダウンロードが成功しました。");
                showSavingIndicator(); // 保存中のインジケーターを表示
            } else {
                console.error("画像のダウンロードに失敗しました。");
            }
        });
    }
});
/**
 * 保存中のインジケーターを表示
 */
function showSavingIndicator() {
    const nav = document.createElement('nav');
    nav.innerHTML = `
<style>
#png-saving {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.85);
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
#png-saving h3 {
    color: #ffffff;
    font-size: 24px;
    font-family: sans-serif;
    margin: 0;
    text-align: center;
}
</style>
<div id="png-saving">
  <h3>PNG保存中...</h3>
</div>`;
    // UIを画面に表示
    const element = document.body.appendChild(nav);
    // 1.5秒後に表示を削除
    setTimeout(() => element.remove(), 1500);
}