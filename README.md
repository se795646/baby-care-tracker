# 👶 寶寶作息記錄儀 (Baby Tracker)

這是一個專為父母設計的純前端嬰兒作息記錄器。旨在提供一個優雅、溫馨且流暢的介面，幫助父母隨手記錄與追蹤嬰兒的**喝奶量**與**睡眠作息**。

本專案採用 **Vue 3 (Composition API) + Vite + TailwindCSS** 開發，並整合了 **BenQ Design System (Qtify)** 元件與 **Vuetify** 進行排版。

---

## ✨ 核心特色

- **🍼 智能餵奶記錄**
  - 支援配方奶、母乳瓶餵、母乳親餵與副食品記錄。
  - 針對母乳親餵，貼心提供左右乳房親餵時間的分開記錄（哺乳媽媽必備！）。
  - 提供快捷奶量按鈕，一鍵輸入常用毫升數。

- **💤 實時睡眠計時器**
  - 首頁一鍵點擊「寶寶開始睡覺」啟動計時器，動態更新入睡時長。
  - 寶寶醒來時點擊「寶寶醒了」，系統會自動計算睡眠總時長，並開啟睡眠對話框供補齊備註或拍照，實現最輕鬆的記錄體驗。

- **📸 拍照留念與影像記錄**
  - 調用網頁視訊鏡頭（Web Camera）或呼叫手機原生相機直接進行拍照。
  - 前端自動進行圖片壓縮與縮小，防止瀏覽器記憶體與儲存負載。
  - 相片數據儲存於瀏覽器當地的 **IndexedDB**，即使重新整理或離線使用，相片也不會遺失！

- **📊 視覺化今日統計**
  - 採用溫馨配色與 SVG 動態圓環進度條展示今日累計喝奶量與睡眠時長。
  - 協助快速掌握寶寶今天的作息與達成率是否達標。

- **🔍 歷史日誌與搜尋篩選**
  - 以精美卡片和時間線形式呈現所有歷史記錄。
  - 支援按照「全部」、「餵奶」、「睡眠」進行類別篩選，以及依備註關鍵字搜尋。
  - 支援點擊相片縮圖展開大圖檢視，並可隨時刪除錯誤記錄。

---

## 🛠️ 開發與建置指令

在專案目錄下，您可以使用以下指令來運行或測試專案：

- **啟動開發環境**:
  ```bash
  npm run dev
  ```
  啟動後，在瀏覽器開啟 `http://localhost:5173` 即可使用。

- **專案構建 (Build)**:
  ```bash
  npm run build
  ```
  構建完成後，會生成 `dist` 資料夾，即可佈署到任何靜態網站主機（例如 GitHub Pages、Vercel、Netlify 等）。

- **類型檢查**:
  ```bash
  npm run type-check
  ```

- **程式碼 Lint 檢查**:
  ```bash
  npm run lint
  ```

- **單元測試**:
  ```bash
  npm run test:unit
  ```
  執行 Vitest 進行單元測試。我們已經為 IndexedDB 儲存與首頁載入邏輯編寫了單元測試。

---

## 📂 專案架構說明

主要的核心程式碼位於以下路徑：

- [src/views/Dashboard/Overview.vue](file:///D:/Projects/baby-tracker/src/views/Dashboard/Overview.vue) - 作息記錄的主控面板 (Dashboard) 與對話框邏輯。
- [src/components/CameraPicker.vue](file:///D:/Projects/baby-tracker/src/components/CameraPicker.vue) - 結合 Web Cam 與原生拍照的相機選擇器元件，支援前端圖片縮圖壓縮。
- [src/helpers/db.js](file:///D:/Projects/baby-tracker/src/helpers/db.js) - 基於 Promise 的 IndexedDB 儲存封裝，並提供 localStorage/記憶體降級 fallback，以確保離線與單元測試環境穩定運行。
- [test/unit/helpers/db.spec.js](file:///D:/Projects/baby-tracker/test/unit/helpers/db.spec.js) - 針對 IndexedDB 封裝的 CRUD 單元測試。
- [test/unit/SampleMain.spec.js](file:///D:/Projects/baby-tracker/test/unit/SampleMain.spec.js) - 針對主控面板渲染與基本文字的單元測試。

---

## 🚀 部署至 GitHub Pages 建議

如果您想部署到 GitHub Pages，可以參考以下步驟：

1. 建立一個 GitHub 儲存庫（例如 `baby-tracker`）。
2. 在您的本機專案執行以下指令以連結 GitHub：
   ```bash
   git add .
   git commit -m "feat: init baby tracker app with IndexedDB and camera support"
   git branch -M main
   git remote add origin https://github.com/您的帳號/baby-tracker.git
   git push -u origin main
   ```
3. 在 `vite.config.js` 中，將 `base` 設定為您的 repo 名稱（如 `/baby-tracker/`）。
4. 使用 `gh-pages` 套件或 GitHub Actions 自動進行部署。
