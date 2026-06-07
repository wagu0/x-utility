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
    }
});