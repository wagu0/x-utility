//todo 画像保存場所をユーザーが選択できるようにする
//todo メディアツイート画面からも正常に画像を保存できるようにする
//todo メディアが複数存在する場合保存する画像名にナンバリングをつける
//todo 任意のキー入力でホバーしているツイートに対してブックマークをできるようにする。ツイートを選択していると既存機能でもできるためイベントを阻止する。

/** 画像が含まれたツイートを検知するためのセレクタ */
const IMAGE_TWEET_SELECTOR = '[data-testid="tweetPhoto"]';
/** ツイートのセレクタ */
const TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** いいねボタンのセレクタ */
const LIKE_BUTTON_SELECTOR = '[data-testid="like"]';
/** いいね済みボタンのセレクタ */
const LIKED_BUTTON_SELECTOR = '[data-testid="unlike"]';
/** プロフィールページのセレクタ */
const PROFILE_PAGE_SELECTOR = '[data-testid="User-Name"]';
/** ツイートのURLに含まれる文字列 */
const STATUS = "status";
/** ツイートの投稿日時を取得するためのセレクタ */
const TWEET_TIME_TAG = 'time';
const TWEET_TIME_DATATIME = "datetime";
/** ホバーしているツイート内の画像を保存する変数 */
let targetTweetImg = null;
/** 画像の拡張子を保存する変数 */
let imageExtension = null;
/** ユーザーIDを保存する変数 */
let userID = "UnknownUser";
/** ツイートの投稿日時を保存する変数 */
let tweetDateforJST = "UnknownDate";
/** ツイート要素を保存する変数 */
let targetTweet = null;

const SAVE_TRIGGER_KEY = "l"; // 画像保存のトリガーキーを定義
const LIKE_TRIGGER_KEY = "k"; // いいねのトリガーキーを定義
const IMG_REGEX = /https:\/\/pbs\.twimg\.com\/media\/\w+\.\w+&name=\w+/; // 画像URLの正規表現


// マウスホバーしているツイート内の画像を検出するイベントリスナー
document.addEventListener("mouseover", (event) => {
    const closestTweetImg = event.target.closest(IMAGE_TWEET_SELECTOR);
    if (!closestTweetImg) {
        return;
    }
    targetTweet = closestTweetImg.closest(TWEET_SELECTOR);
    if (!targetTweet) {
        return;
    }
    const userNameElement = targetTweet.querySelector(PROFILE_PAGE_SELECTOR) || "UnknownUser";
    const tweetTimeElement = targetTweet.querySelector(TWEET_TIME_TAG);
    const tweetTime = tweetTimeElement ? tweetTimeElement.getAttribute(TWEET_TIME_DATATIME) : "UnknownTime";
    const tweetTimeforJST = tweetTime ? new Date(tweetTime).toLocaleString("ja-JP") : "UnknownTime";
    tweetDateforJST = tweetTimeforJST ? tweetTimeforJST.split(" ")[0] : "UnknownDate";
    tweetDateforJST = tweetDateforJST.replace(/\//g, "-"); // ファイル名に使用するため、日付の区切りをスラッシュからハイフンに変換

    // ツイートが保存されているか確認し、保存されていない場合は新たに保存する
    if (closestTweetImg) {
        if (targetTweetImg === closestTweetImg) {
            console.log("検知済みの画像ツイート");
            return;
        }
        // 保存された画像ツイートの出力
        userID = findUserID(userNameElement);
        console.log("TweetImg hovered:", closestTweetImg);
        console.log("ユーザー名:", userNameElement);
        console.log("ユーザー名テキスト:", userNameElement.textContent);
        console.log("ユーザーID:", userID);
        console.log("ツイートの投稿日時:", tweetTime);
        console.log("ツイートの投稿日時（日本時間）:", tweetTimeforJST);
        console.log("ツイートの投稿日時（日本時間、日時のみ）:", tweetDateforJST);
        console.log("ファイル名の例" + `${tweetDateforJST}_${userID}.${imageExtension}`);

        // 保存された画像ツイートを更新
        targetTweetImg = closestTweetImg;
    }
});
// 保存トリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
    // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
        return;
    }
    // トリガーキーが押されたときのみ後続処理
    if (event.key === SAVE_TRIGGER_KEY) {
        console.log("Lキーが押されました！");
        const img = targetTweetImg.querySelector("img");

        event.preventDefault(); // Lキーのデフォルトの動作（ツイートのいいね）を防止

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
        imageExtension = new URL(origUrl).searchParams.get("format");
        console.log("画像の拡張子:", imageExtension);

        if (!imageExtension) {
            console.log("画像の拡張子がURLから取得できませんでした。");
            return;
        }

        console.log("orig画像のURL:", origUrl);
        console.log("chrome.donwloads:", chrome.downloads);

        //service_worker.jsに送信するテスト
        chrome.runtime.sendMessage({
            action: "downloadImage", url: origUrl, filename: `${tweetDateforJST}_${userID}.${imageExtension}`
        }, (response) => {
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
// ユーザーIDを取得する関数
// 現状aタグのhrefの1個目と2個目が/ユーザー名となっているため1個目のaタグのhrefからユーザーIDを取得する想定
function findUserID(userNameElement) {
    const links = userNameElement.querySelectorAll("a");
    console.log("ユーザー名内のリンク:", links);

    if (links.length > 0) {
        const userID = links[0].getAttribute("href").replace("/", ""); // 最初のaタグのhrefからユーザーIDを抽出
        console.log("ユーザーID:", userID);
        return userID;
    } else {
        console.log("ユーザーIDが見つかりませんでした。");
        return "UnknownUser";
    }
}
// いいねボタンのトリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
    // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
        return;
    }
    // トリガーキーが押されたときのみ後続処理
    if (event.key === LIKE_TRIGGER_KEY) {
        console.log("Kキーが押されました！");
        event.preventDefault(); // Kキーのデフォルトの動作（ツイートのいいね）を防止

        if (!targetTweet) {
            console.log("いいね対象のツイートが見つかりませんでした。");
            return;
        }
        const likeButton = targetTweet.querySelector(LIKE_BUTTON_SELECTOR);
        if (!likeButton) {
            console.log("いいねボタンが見つかりませんでした。");
        } else {
            likeButton.click();
            console.log("いいねボタンをクリックしました。");
            return;
        }
        const likedButton = targetTweet.querySelector(LIKED_BUTTON_SELECTOR);
        if (!likedButton) {
            console.log("いいね済みボタンが見つかりませんでした。");
        } else {
            likedButton.click();
            console.log("いいね済みボタンをクリックしました。");
        }
    }
});