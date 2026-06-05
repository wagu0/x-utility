/** ツイートのセレクタ */
const TWEET_SELECTOR = 'article[data-testid="tweet"]';
/** ホバーしているツイートを保存する変数 */
let targetTweet = null;

// マウスホバーしているツイートを検出するイベントリスナー
document.addEventListener("mouseover", (event) => {
    console.log("mouseover event detected");
    const closestTweet = event.target.closest(TWEET_SELECTOR);
    // ツイートが保存されているか確認し、保存されていない場合は新たに保存する
    if (closestTweet) {
        if (targetTweet === closestTweet) {
            console.log("Already hovering over this tweet, ignoring.");
            return;
        }
        console.log("Tweet hovered:", closestTweet);
        targetTweet = closestTweet;
    }
});