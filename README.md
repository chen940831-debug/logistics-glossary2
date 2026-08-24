# Logistics Starter Guide

國際物流新人學習手冊。從角色、流程、文件與常見名詞建立物流基礎。

## Live Demo

https://chen940831-debug.github.io/logistics-glossary2/

## 目前功能

- 縮寫與關鍵字搜尋
- 空運、海運、費用與報關分類
- Incoterms 2020條規對照
- 翻牌學習模式
- 瀏覽器本機收藏
- 錯誤回報介面
- 物流角色關係圖與一票貨新手導覽
- 物流產業版圖與公開資料規模比較
- 通關流程學習地圖，支援新手教學與完整流程模式
- 已去識別的空白文件訓練範本，支援搜尋、分類、欄位詳情與下載

## 技術

- HTML
- JavaScript
- Tailwind CSS CDN
- LocalStorage

## Local Development

本專案不需要 build。建議使用本機 HTTP server，才能驗證 JSON fetch：

```powershell
python -m http.server 8000
```

開啟 `http://localhost:8000/`。直接開啟 `index.html` 時，網站會使用 `data/*.js` fallback。

## 角色資料維護

`data/roles.json` 是角色、角色關係及新手導覽的正式資料；`data/roles.js` 是直接開啟 HTML 時使用的 fallback，兩者必須同步。角色使用 stable id。流程角色顯示文字透過 `actorAliases` 對應，`Declarant` 等不明確角色不得直接歸類。

Role Map 會從 `data/clearance-processes.json` 的 `detail.actors` 與 `data/document-templates.json` 的 `roleIds` 建立反向索引。請勿在 `roles.json` 重複維護流程或文件清單。

## 市場資料維護

`data/market-data.json` 保存物流產業版圖的完整研究資料；`data/market-data.js` 是供直接開啟 HTML 時使用的台灣三家公司 fallback。更新台灣比較數值時必須同步更新兩個檔案、來源網址與查閱日期；不同年份、範圍或單位不得合併成市占率。

## 通關流程資料維護

`data/clearance-processes.json` 保存空運進口、出口及保稅貨物通關資料；`data/clearance-processes.js` 是供直接開啟 HTML 時使用的同內容 fallback。流程關係以 `entryStepIds` 與 `nextStepIds` 表示，畫面順序不得取代節點關係。每筆流程與步驟須保留來源、複核日期及 `reviewStatus`，更新時必須同步兩個資料檔。

通關頁部署後使用 `fetch` 讀取 JSON；直接開啟 HTML 時改用本機相容資料。若 HTTP 載入 JSON 失敗，也會安全退回本機相容資料，因此直接開啟與部署至 Netlify 都能運作。

## 文件範本維護

`data/document-templates.json` 是文件範本的正式索引，`data/document-templates.js` 為直接開啟 HTML 的相容資料，兩者必須同步。可公開的 DOCX 只能放在 `documents/templates/`，並須先清除個人 metadata、custom properties 與 Word 修訂工作階段識別；原始檔案不得直接連結。預覽 PDF 放在 `documents/previews/`，只有完成轉檔及逐頁檢查後才可設為 `previewStatus: "verified"`。

## 注意

本網站作為學習輔助工具。
物流名詞可能因國家、承運人或公司內部規則不同而有差異，
正式作業仍應以公司SOP及官方資料為準。
