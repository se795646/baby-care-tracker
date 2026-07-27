# 👶 寶寶作息記錄儀 (Baby Tracker)

這是一個專為父母設計的純前端嬰兒作息記錄器。旨在提供一個優雅、溫馨且流暢的介面，幫助父母隨手記錄與追蹤嬰兒的**喝奶量**與**睡眠作息**。

本專案採用 **Vue 3 (Composition API) + Vite + TailwindCSS** 開發，並整合了 **Vuetify** 進行元件開發與排版。

---

## ✨ 核心特色

- **🍼 智能餵奶記錄**
  - 支援配方奶、母乳瓶餵、母乳親餵與副食品記錄。
  - 針對母乳親餵，貼心提供左右乳房親餵時間的分開記錄（哺乳媽媽必備！）。
  - 提供快捷奶量按鈕，一鍵輸入常用毫升數。

- **💤 實時睡眠計時器與智慧清醒追蹤**
  - 首頁一鍵點擊「寶寶開始睡覺」啟動計時器，動態更新入睡時長；醒來時點擊「寶寶醒了」自動帶入時間。
  - **智慧小睡預測**：當寶寶清醒時，系統會自動在首頁顯示寶寶已清醒時長，並根據**月齡自動調整**（0~12個月以上不同發育階段）建議的清醒極限區間。
  - **個體化疲憊耐受度微調**：提供「容易累」、「標準」、「較耐累」三種耐受度設定，智慧校正推薦的下一次小睡黃金時機，防範寶寶過累鬧脾氣。

- **📸 拍照留念與影像記錄**
  - 調用網頁視訊鏡頭（Web Camera）或呼叫手機原生相機直接進行拍照。
  - 前端自動進行圖片壓縮與縮小，防止瀏覽器記憶體與儲存負載。
  - 相片數據儲存於瀏覽器當地的 **IndexedDB**，即使重新整理或離線使用，相片也不會遺失！

- **📊 視覺化今日統計**
  - 採用溫馨配色與 SVG 動態圓環進度條展示今日累計喝奶量與睡眠時長。
  - 協助快速掌握寶寶今天的作息與達成率是否達標。

- **📈 體重記錄、生長曲線與智慧助推器**
  - **每週自動提醒更新**：距離上次體重記錄超過 7 天時，系統會自動在首頁彈出溫馨的提醒橫幅，預防數據過期。
  - **大人抱秤相減助手**：貼心解決家裡沒有嬰兒專用秤的痛點！只需輸入「大人抱寶寶重」和「大人單獨重」，系統會自動換算寶寶體重，一鍵填入。
  - **WHO 發育指標健康評估**：設定寶寶生日後，App 自動對比 WHO 官方標準成長百分位，提供溫馨且客觀的發育回饋，極大地緩解新手爸媽的育兒焦慮。
  - **科學化動態奶量目標**：依小兒科醫師建議之公式（體重 kg × 150 ml）自動計算每日建議總奶量，並即時更新首頁的喝奶進度與每餐建議量。

- **🔍 歷史日誌與搜尋篩選**
  - 以精美卡片和時間線形式呈現所有歷史記錄（自動在全部日誌中過濾體重記錄，不 clutter 作息日誌）。
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
- [src/views/Dashboard/Growth.vue](file:///D:/Projects/baby-tracker/src/views/Dashboard/Growth.vue) - 體重記錄與 SVG 成長曲線趨勢頁面。
- [src/components/CameraPicker.vue](file:///D:/Projects/baby-tracker/src/components/CameraPicker.vue) - 結合 Web Cam 與原生拍照的相機選擇器元件，支援前端圖片縮圖壓縮。
- [src/helpers/db.js](file:///D:/Projects/baby-tracker/src/helpers/db.js) - 基於 Promise 的 IndexedDB 儲存封裝，並提供 localStorage/記憶體降級 fallback，以確保離線與單元測試環境穩定運行。
- [test/unit/helpers/db.spec.js](file:///D:/Projects/baby-tracker/test/unit/helpers/db.spec.js) - 針對 IndexedDB 封裝的 CRUD 單元測試。
- [test/unit/SampleMain.spec.js](file:///D:/Projects/baby-tracker/test/unit/SampleMain.spec.js) - 針對主控面板渲染與基本文字的單元測試。

---

## 🚀 雲端部署指南 (Vercel & GitHub Pages)

本專案是一個純靜態前端應用，非常適合託管在 **Vercel** 上，可享受自動化的雙向即時同步。在部署前，您需要先準備一個**完全免費**的 Supabase 雲端資料庫來儲存寶寶的作息與體重數據：

### 1. 準備工作：建立免費的 Supabase 資料庫

為了讓您和家人（多個裝置）可以同時登入並即時同步，請跟著以下步驟建立您的資料庫：

1. **註冊帳號**：前往 [Supabase 官網 (supabase.com)](https://supabase.com/)，點選 **Sign Up** 註冊。您可以使用您的 GitHub 帳號一鍵登入。
2. **建立新專案**：
   - 進入控制台後，點選 **New Project**。
   - 設定專案名稱（例如：`my-baby-tracker`）。
   - 設定一個安全的資料庫密碼（請先記在備忘錄中）。
   - 區域（Region）選擇離您最近的地方（例如：亞洲選 `Singapore` 或 `Tokyo`）。
   - 點選 **Create new project**，等待約 1-2 分鐘資料庫建立完成。
3. **建立資料表 (Records Table)**：
   - 專案建立完成後，在左側選單中點選 **SQL Editor**（一個像大於 `>` 符號的圖示）。
   - 點選右上角的 **New query** 按鈕建立一個新輸入視窗。
   - 複製您專案目錄下的 [supabase_schema.sql](file:///D:/Projects/baby-tracker/supabase_schema.sql) 檔案裡面的所有 SQL 程式碼。
   - 將程式碼貼入 Supabase 網頁的編輯器中，點選右下角的 **Run** 按鈕。
   - 看到綠色的 `Success` 提示即代表資料表與即時同步政策已成功建立！
4. **取得金鑰資訊**：
   - 點選左下角的 **Project Settings**（齒輪圖示）。
   - 點選選單中的 **API**。
   - 您會看到以下兩個重要欄位，請將它們複製備用：
     - **Project URL**（對應環境變數中的 `VITE_SUPABASE_URL`）
     - **anon public** (JWT 欄位下方的 Anon 金鑰，對應環境變數中的 `VITE_SUPABASE_ANON_KEY`)

---

### 2. 部署至 Vercel (推薦)

1. **GitHub 推送**：建立一個 GitHub 儲存庫，將本地程式碼推送上去。
2. **導入專案**：登入 Vercel 後台，點選 **Add New** > **Project**，導入您的 GitHub 儲存庫。
3. **環境變數設定 (Environment Variables)**：
   在部署前的環境變數設定區塊，新增以下兩個變數，並填入您在 Supabase 取得的值：
   - `VITE_SUPABASE_URL` : 貼上您的 Supabase Project URL。
   - `VITE_SUPABASE_ANON_KEY` : 貼上您的 Supabase anon public 金鑰。
4. **⚠️ 重要注意**：因為 Vite 的 `VITE_` 開頭變數是在**打包編譯時 (Build time)** 被直接靜態寫入 JavaScript 檔案中的。所以在 Vercel 設定或更新環境變數後，**必須在 Vercel 該部署控制台點擊「Redeploy」（重新部署）**，變數才會真正生效。

---

### 3. 部署至 GitHub Pages (替代方案)

1. 在 `vite.config.js` 中，將 `base` 修改為您的 GitHub 專案名稱（例如：`base: '/baby-care-tracker/'`）。
2. 可利用 `gh-pages` npm 套件，或設定 GitHub Actions 自動將 `dist` 編譯內容部署至 `gh-pages` 分支。
