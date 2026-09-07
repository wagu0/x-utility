// 保存するフォルダを設定する
// 画像を保存するフォルダ
const DOWNLOAD_FOLDER = "X_Images";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadImage") {
    // ダウンロードAPIを使用して画像をダウンロード
    chrome.downloads.download(
      {
        url: message.url,
        filename: `${DOWNLOAD_FOLDER}/${message.filename}`, // ダウンロードするファイル名を指定
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("ダウンロードエラー:", chrome.runtime.lastError);
          // エラーが発生した場合は、sendResponseで失敗を通知
          sendResponse({
            success: false,
          });
          return;
        }
        // ダウンロードが成功した場合は、sendResponseで成功を通知
        sendResponse({
          success: true,
        });
      },
    );
    return true; // 非同期でsendResponseを呼び出すためにtrueを返す
  }
});
