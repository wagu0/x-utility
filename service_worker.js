chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "downloadImage") {

        console.log("画像ダウンロード要求を受信");
        console.log("URL:", message.url);
        console.log("ファイル名:", message.filename);
        // ダウンロードAPIを使用して画像をダウンロード
        chrome.downloads.download
            ({
                url: message.url,
                filename: message.filename // ダウンロードするファイル名を指定
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error("ダウンロードエラー:", chrome.runtime.lastError);
                    return;
                }
            });
        sendResponse({
            success: true
        });
    }

});