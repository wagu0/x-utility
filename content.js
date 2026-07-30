//todo 画像保存場所をユーザーが選択できるようにする
//todo メディアツイート画面からも正常に画像を保存できるようにする
//todo メディアが複数存在する場合も正常に画像を保存およびファイル名にナンバリングをつける
//todo 保存済みの画像をローカルストレージに保存しておき、同じ画像を保存しようとした場合に警告を出すようにする
/**
 * todo 画像を開いたときの矢印ボタンを任意のトリガーキーで操作できるようにする
 * data-testidは振られていないため、aria-labelを使って矢印ボタンを取得する予定
 * aria-label="前のスライド"
 * aria-label="次のスライド"
 */

/** 画像が含まれたツイートを検知するためのセレクタ */
const TWEET_IMAGE_SELECTOR = '[data-testid="tweetPhoto"]';
/** ツイートのセレクタ */
const TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** いいねボタンのセレクタ */
const LIKE_BUTTON_SELECTOR = '[data-testid="like"]';
/** いいね済みボタンのセレクタ */
const LIKED_BUTTON_SELECTOR = '[data-testid="unlike"]';
/** ブックマークボタンのセレクタ */
const BOOKMARK_BUTTON_SELECTOR = '[data-testid="bookmark"]';
/** ブックマーク済みボタンのセレクタ */
const BOOKMARKED_BUTTON_SELECTOR = '[data-testid="removeBookmark"]';
/** リツイートボタンのセレクタ */
const RETWEET_BUTTON_SELECTOR = '[data-testid="retweet"]';
/** リツイート済みボタンのセレクタ */
const RETWEETED_BUTTON_SELECTOR = '[data-testid="unretweet"]';
/** プロフィールページのセレクタ */
const PROFILE_PAGE_SELECTOR = '[data-testid="User-Name"]';
/** ダイレクトメッセージのセレクタ */
const DM_MENU_SELECTOR = '[data-testid="AppTabBar_DirectMessage_Link"]';
/** ツイートのURLに含まれる文字列 */
const STATUS = "status";
/** ツイートの投稿日時を取得するためのセレクタ */
const TWEET_TIME_TAG = "time";
const TWEET_TIME_DATETIME = "datetime";
/** ホバーしているツイート内の画像を保存する変数 */
let hoveredTweetImage = null;
/** 画像の拡張子を保存する変数 */
let imageExtension = null;
/** ユーザーIDを保存する変数 */
let userID = "UnknownUser";
/** ツイートの投稿日時を保存する変数 */
let tweetDateForJST = "UnknownDate";
/** ツイート要素を保存する変数 */
let hoveredTweet = null;
let lastHoveredTweet = null;

const SAVE_TRIGGER_KEY = "l"; // 画像保存のトリガーキーを定義
const LIKE_TRIGGER_KEY = "k"; // いいねのトリガーキーを定義
const BOOKMARK_TRIGGER_KEY = "b"; // ブックマークのトリガーキーを定義
const RETWEET_TRIGGER_KEY = "r"; // リツイートのトリガーキーを定義
const DM_TRIGGER_KEY = "m"; // ダイレクトメッセージのトリガーキーを定義
const IMG_REGEX = /https:\/\/pbs\.twimg\.com\/media\/\w+\.\w+&name=\w+/; // 画像URLの正規表現

// マウスホバーしているツイートを検出するイベントリスナー
document.addEventListener("mouseover", (event) => {
  hoveredTweet = event.target.closest(TWEET_SELECTOR);
  if (!hoveredTweet) {
    return;
  } else {
    console.log("ツイートがあります");
  }
  if (hoveredTweet === lastHoveredTweet) {
    return;
  }
  // 画像を含むツイートの場合の処理
  if (hoveredTweet.querySelector(TWEET_IMAGE_SELECTOR)) {
    console.log("ツイートが画像ツイートです");
    const closestTweetImg = hoveredTweet.querySelector(TWEET_IMAGE_SELECTOR);
    const userNameElement =
      hoveredTweet.querySelector(PROFILE_PAGE_SELECTOR) || "UnknownUser";
    const tweetTimeElement = hoveredTweet.querySelector(TWEET_TIME_TAG);
    const tweetTime = tweetTimeElement
      ? tweetTimeElement.getAttribute(TWEET_TIME_DATETIME)
      : "UnknownTime";
    const tweetTimeforJST = tweetTime
      ? new Date(tweetTime).toLocaleString("ja-JP")
      : "UnknownTime";
    tweetDateForJST = tweetTimeforJST
      ? tweetTimeforJST.split(" ")[0]
      : "UnknownDate";
    tweetDateForJST = tweetDateForJST.replace(/\//g, "-"); // ファイル名に使用するため、日付の区切りをスラッシュからハイフンに変換

    // ツイートが保存されているか確認し、保存されていない場合は新たに保存する
    if (closestTweetImg) {
      if (hoveredTweetImage === closestTweetImg) {
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
      console.log("ツイートの投稿日時（日本時間、日時のみ）:", tweetDateForJST);
      console.log(
        "ファイル名の例" + `${tweetDateForJST}_${userID}.${imageExtension}`,
      );

      // 保存された画像ツイートを更新
      hoveredTweetImage = closestTweetImg;
    }
  } else {
    // ツイートが画像ツイートでない場合の処理
    hoveredTweetImage = null;
  }
  // 画像の有無にかかわらず、ツイートを更新する
  lastHoveredTweet = hoveredTweet;
});
// 保存トリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // トリガーキーが押されたときのみ後続処理
  if (event.key === SAVE_TRIGGER_KEY) {
    console.log("Lキーが押されました！");
    if (hoveredTweetImage === null) {
      console.log("ツイートの画像が見つかりませんでした。");
      return;
    }
    const targetTweetImage = hoveredTweetImage.querySelector("img");

    event.preventDefault(); // Lキーのデフォルトの動作（ツイートのいいね）を防止

    if (!targetTweetImage) {
      console.log("保存対象の画像が見つかりませんでした。");
      return;
    }
    console.log("保存対象の画像要素:", targetTweetImage);

    // src属性からURLを取得して、URLをそぎ落としてorigを取得する処理をここに追加
    const imgSrc = targetTweetImage.getAttribute("src");
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
    try {
      chrome.runtime.sendMessage(
        {
          action: "downloadImage",
          url: origUrl,
          filename: `${tweetDateForJST}_${userID}.${imageExtension}`,
        },
        (response) => {
          // service_workerからのエラー処理
          if (chrome.runtime.lastError) {
            console.error(
              "chrome.runtime.sendMessageのエラー:",
              chrome.runtime.lastError,
            );
            return;
          }
          if (response && response.success) {
            console.log("画像のダウンロードが成功しました。");
            showSavingIndicator(); // 保存中のインジケーターを表示
          } else {
            console.error("画像のダウンロードに失敗しました。");
          }
        },
      );
    } catch (error) {
      console.error("chrome.runtime.sendMessageのエラー:", error);
    }
  }
});
/**
 * 保存中のインジケーターを表示
 */
function showSavingIndicator() {
  const nav = document.createElement("nav");
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
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // トリガーキーが押されたときのみ後続処理
  if (event.key === LIKE_TRIGGER_KEY) {
    console.log("Kキーが押されました！");
    event.preventDefault(); // Kキーのデフォルトの動作（ツイートのいいね）を防止

    if (!hoveredTweet) {
      console.log("いいね対象のツイートが見つかりませんでした。");
      return;
    }
    const likeButton = hoveredTweet.querySelector(LIKE_BUTTON_SELECTOR);
    if (!likeButton) {
      console.log("いいねボタンが見つかりませんでした。");
    } else {
      likeButton.click();
      console.log("いいねボタンをクリックしました。");
      return;
    }
    const likedButton = hoveredTweet.querySelector(LIKED_BUTTON_SELECTOR);
    if (!likedButton) {
      console.log("いいね済みボタンが見つかりませんでした。");
    } else {
      likedButton.click();
      console.log("いいね済みボタンをクリックしました。");
    }
  }
});
// ブックマークボタンのトリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // トリガーキーが押されたときのみ後続処理
  if (event.key === BOOKMARK_TRIGGER_KEY) {
    console.log("Bキーが押されました！");
    event.preventDefault(); // Bキーのデフォルトの動作（ツイートのブックマーク）を防止

    if (!hoveredTweet) {
      console.log("ブックマーク対象のツイートが見つかりませんでした。");
      return;
    }
    const bookmarkButton = hoveredTweet.querySelector(BOOKMARK_BUTTON_SELECTOR);
    if (!bookmarkButton) {
      console.log("ブックマークボタンが見つかりませんでした。");
    } else {
      bookmarkButton.click();
      console.log("ブックマークボタンをクリックしました。");
      return;
    }
    const bookmarkedButton = hoveredTweet.querySelector(
      BOOKMARKED_BUTTON_SELECTOR,
    );
    if (!bookmarkedButton) {
      console.log("ブックマーク済みボタンが見つかりませんでした。");
    } else {
      bookmarkedButton.click();
      console.log("ブックマーク済みボタンをクリックしました。");
    }
  }
});
//リツイートボタンのトリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // トリガーキーが押されたときのみ後続処理
  // Ctrl Rが押された場合はリツイートのデフォルト動作を行うため、Ctrlキーが押されていない場合のみ処理を行う
  if (event.key === RETWEET_TRIGGER_KEY && !event.ctrlKey) {
    console.log("Rキーが押されました！");
    event.preventDefault(); // Rキーのデフォルトの動作（ツイートのリツイート）を防止
    if (!hoveredTweet) {
      console.log("リツイート対象のツイートが見つかりませんでした。");
      return;
    }
    const retweetButton = hoveredTweet.querySelector(RETWEET_BUTTON_SELECTOR);
    if (!retweetButton) {
      console.log("リツイートボタンが見つかりませんでした。");
    } else {
      retweetButton.click();
      console.log("リツイートボタンをクリックしました。");
      return;
    }
    const retweetedButton = hoveredTweet.querySelector(
      RETWEETED_BUTTON_SELECTOR,
    );
    if (!retweetedButton) {
      console.log("リツイート済みボタンが見つかりませんでした。");
    } else {
      retweetedButton.click();
      console.log("リツイート済みボタンをクリックしました。");
    }
  }
});
// ダイレクトメッセージのトリガーキーが押されたときの処理を定義
document.addEventListener("keydown", (event) => {
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // トリガーキーが押されたときのみ後続処理
  if (event.key === DM_TRIGGER_KEY) {
    event.preventDefault();
    const dmButton = document.querySelector(DM_MENU_SELECTOR);
    if (!dmButton) {
      console.log("ダイレクトメッセージボタンが見つかりませんでした。");
    } else {
      dmButton.click();
      console.log("ダイレクトメッセージボタンをクリックしました。");
      return;
    }
  }
});
