# chrome-app-download-copy
Chrome App to Copy Download File to Specific Directory


## 

"downloads" is only allowed for extensions. って出て Chrome App だと使えないから困った。
ダウンロードディレクトリを見つけるところから始めないといかん。

## minifest.json で見る箇所

File Handler: https://developer.chrome.com/apps/manifest/file_handlers

## 

Mac だと `chrome.fileSystem.getVolumeList(function (volumes) {` 使えないっぽい。
エラー "Operation not supported on the current platform." が発生する。

## File Copy の例

https://stackoverflow.com/questions/33341616/chrome-packaged-app-copy-a-fileentry-to-users-download-directory
