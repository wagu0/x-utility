//todo 画像保存場所をユーザーが選択できるようにする
//todo メディアツイート画面からも正常に画像を保存できるようにする
//todo 保存済みの画像をローカルストレージに保存しておき、同じ画像を保存しようとした場合に警告を出すようにする
//todo デバッグをしやすいようにインスタンスが増殖するのを対策したい
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
/** ツイート内のプロフィール情報のセレクタ */
const TWEET_PROFILE_SELECTOR = '[data-testid="User-Name"]';
/** ダイレクトメッセージのセレクタ */
const DM_MENU_SELECTOR = '[data-testid="AppTabBar_DirectMessage_Link"]';
/** プロフィールページのセレクタ */
const USER_PROFILE_SELECTOR = '[data-testid="AppTabBar_Profile_Link"]';
/** ツイートのURLに含まれる文字列 */
const STATUS = "status";
/** ツイートの投稿日時を取得するためのセレクタ */
const TWEET_TIME_TAG = "time";
const TWEET_TIME_DATETIME = "datetime";
/** ツイート要素を保存する変数 */
let hoveredTweet = null;
/** ツイート内の画像要素を保存する変数 */
let hoveredTweetImageElement = null;

/** トリガーキーと対応するaction名を保持するMap */
const shortcutKeyMap = new Map([]);
/** action名と関数名を保持するMap */
const actionMap = new Map([
  ["saveImage", saveImage],
  // ["likeTweet", likeTweet],
  // ["bookmarkTweet", bookmarkTweet],
  // ["retweetTweet", retweetTweet],
  // ["openDirectMessage", openDirectMessage],
  // ["openProfilePage", openProfilePage],
]);
// 初期処理
getShortcutKey();

// ショートカットの設定を取得して、shortcutKeyMapに保存する関数
function getShortcutKey() {
  chrome.storage.local.get(null, (items) => {
    for (const [action, key] of Object.entries(items)) {
      shortcutKeyMap.set(key, action);
    }
    console.log(shortcutKeyMap);
  });
}

// マウスホバーしているツイートを検出するイベントリスナー
document.addEventListener("mouseover", (event) => {
  // ホバーしているツイートを取得
  const targetTweet = event.target.closest(TWEET_SELECTOR);
  // ツイート要素下をホバーしている場合のみ処理
  if (targetTweet) {
    hoveredTweet = targetTweet;
  } else {
    return;
  }
  console.log("ツイートがホバーされました:");
  // 画像がホバーされている場合ホバー中の画像を取得する
  const targetImage = event.target.closest(TWEET_IMAGE_SELECTOR);
  if (targetImage) {
    hoveredTweetImageElement = targetImage;
  } else {
    hoveredTweetImageElement = null;
  }
});
// キーダウンが発生したときの共通処理
document.addEventListener("keydown", (event) => {
  console.log("キーダウンが発生しました。");
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.isContentEditable
  ) {
    return;
  }
  // Ctrl+Rが押された場合はリツイートのデフォルト動作を行うため、Ctrlキーが押されていない場合のみ処理を行う
  if (event.ctrlKey && event.key === "r") {
    return;
  }
  // 押されたキーに対応するactuion名を取得
  const actionName = shortcutKeyMap.get(event.key.toUpperCase());
  console.log("押されたキー:", event.key.toUpperCase());
  console.log("押されたキーに対応するaction名:", actionName);
  // action名に対応する関数を取得
  const action = actionMap.get(actionName);
  if (!action) {
    console.log("対応するアクションが見つかりませんでした。");
    return;
  }

  console.log(
    "ショートカットキーが押されました:",
    event.key,
    "対応する関数:",
    action,
  );
  event.preventDefault(); // トリガーキーのデフォルトの動作を防止
  action(event); // 対応する関数を実行
});
// 保存トリガーキーが押されたときの処理を定義
function saveImage() {
  let fileName;
  // 画像を含むツイートの場合の処理
  if (!hoveredTweet || !hoveredTweetImageElement) {
    console.log("保存対象のツイートまたは画像が見つかりませんでした。");
    return;
  }
  if (hoveredTweetImageElement) {
    // ユーザーIDとツイートの投稿日時を保持する変数
    let userID = "UnknownUser";
    let tweetDateForJST = "UnknownDate";
    const userNameElement =
      hoveredTweet.querySelector(TWEET_PROFILE_SELECTOR) || "UnknownUser";
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
    // 画像要素からimgタグ部分を取得
    const targetTweetImage = hoveredTweetImageElement.querySelector("img");

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
    const imageExtension = new URL(origUrl).searchParams.get("format");
    console.log("画像の拡張子:", imageExtension);

    if (!imageExtension) {
      console.log("画像の拡張子がURLから取得できませんでした。");
      return;
    }
    // ここから画像が複数あった際のナンバリング処理
    const tweetImageElements =
      hoveredTweet.querySelectorAll(TWEET_IMAGE_SELECTOR);
    const tweetImageCount = tweetImageElements.length;
    let imageCount;
    tweetImageElements.forEach((imageElement, index) => {
      index += 1; // インデックスを1から始めるために1を加算
      if (imageElement == hoveredTweetImageElement) {
        imageCount = index;
        console.log("ホバー中の画像のインデックス:", imageCount);
      }
    });
    // ユーザーIDを取得する関数を呼び出す
    userID = findUserID(userNameElement);
    if (tweetImageCount === 1) {
      fileName = `${tweetDateForJST}_${userID}.${imageExtension}`;
      console.log("画像が1枚の場合のファイル名:");
    } else {
      fileName = `${tweetDateForJST}_${userID}_${imageCount}.${imageExtension}`;
      console.log("画像が複数枚の場合のファイル名:");
    }

    // 保存された画像ツイートの情報の出力
    console.log("TweetImg hovered:", hoveredTweetImageElement);
    console.log("ユーザー名:", userNameElement);
    console.log("ユーザー名テキスト:", userNameElement.textContent);
    console.log("ユーザーID:", userID);
    console.log("ツイートの投稿日時:", tweetTime);
    console.log("ツイートの投稿日時（日本時間）:", tweetTimeforJST);
    console.log("ツイートの投稿日時（日本時間、日時のみ）:", tweetDateForJST);
    console.log("orig画像のURL:", origUrl);
    //service_worker.jsに送信するテスト
    console.log(
      "ファイル名の例(各変数別々で呼び出し)" +
        `${tweetDateForJST}_${userID}_${imageCount}.${imageExtension}`,
    );
    console.log("fileName", fileName);
    try {
      chrome.runtime.sendMessage(
        {
          action: "downloadImage",
          url: origUrl,
          filename: fileName,
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
  } else {
    console.log("ホバー中のツイートに画像が含まれていません。");
    return;
  }
}
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
  <h3>画像保存中...</h3>
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
function likeTweet(event) {
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
// ブックマークボタンのトリガーキーが押されたときの処理を定義
function bookmarkTweet(event) {
  // フォームの入力欄（ツイート検索やリプ欄など）でタイピングしている時は動作させないためのガード
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
//リツイートボタンのトリガーキーが押されたときの処理を定義
function retweetTweet(event) {
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
  const retweetedButton = hoveredTweet.querySelector(RETWEETED_BUTTON_SELECTOR);
  if (!retweetedButton) {
    console.log("リツイート済みボタンが見つかりませんでした。");
  } else {
    retweetedButton.click();
    console.log("リツイート済みボタンをクリックしました。");
  }
}
// ダイレクトメッセージのトリガーキーが押されたときの処理を定義
function openDirectMessage(event) {
  const dmButton = document.querySelector(DM_MENU_SELECTOR);
  if (!dmButton) {
    console.log("ダイレクトメッセージボタンが見つかりませんでした。");
  } else {
    dmButton.click();
    console.log("ダイレクトメッセージボタンをクリックしました。");
    return;
  }
}
// プロフィールページを開く関数
function openProfilePage() {
  const profileButton = document.querySelector(USER_PROFILE_SELECTOR);
  if (!profileButton) {
    console.log("プロフィールページボタンが見つかりませんでした。");
  } else {
    profileButton.click();
    console.log("プロフィールページボタンをクリックしました。");
    return;
  }
}
