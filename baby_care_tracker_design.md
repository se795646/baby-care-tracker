# 嬰兒照護紀錄 Web App 系統架構與開發實作指南

本文件為「嬰兒拍照自動化照護紀錄 (Baby Tracker)」的完整系統架構與實作指南，說明如何利用本地端離線儲存 (IndexedDB)、雲端資料庫 (Supabase)、即時資料變更訂閱 (Supabase Realtime) 以及 GitHub / Vercel 的 CI/CD 流程，來完成自動化紀錄與跨裝置多使用者即時同步。

---

## 一、 系統整體架構圖 (System Architecture)

```
[使用者手機/前端 (Vue 3 / PWA / IndexedDB)] ◄───► [Supabase Realtime 訂閱] (即時推播通知)
         │
         ├── 1. 離線優先 (Offline-First)：所有記錄立即存入本地 IndexedDB，相片經壓縮後以 Base64 格式儲存
         ├── 2. 背景雙向同步 (Bi-directional Sync)：自動上傳未同步項目、下載雲端更新、處理刪除日誌
         ▼
[ Supabase 雲端服務 (BaaS - Backend as a Service) ]
         │
         ├── 3. PostgreSQL 資料庫：儲存結構化作息資料 (records 資料表)
         ├── 4. Storage 雲端儲存空間：儲存寶寶相片 (baby-photos 公開 bucket)
         └── 5. Realtime 即時頻道：監聽資料表變更 (postgres_changes)，即時同步給其它正在使用網頁的家人
```

---

## 二、 完整作業流程設計 (End-to-End Workflow)

### 流程 1：離線優先寫入與相片壓縮
1. **新增作息**：家長在前端填寫餵奶（配方奶量、親餵時間等）、睡眠（起訖時間）或體重記錄，並可拍照。
2. **相片壓縮**：若有拍照，前端會自動透過 `<canvas>` 對相片進行等比例縮放與壓縮（輸出品質為 0.7 的 JPEG），防止負擔 IndexedDB 與雲端儲存空間。
3. **寫入本地**：資料以暫時標記 `synced: false` 寫入本地 IndexedDB，相片暫以 Base64 格式保存，確保離線時也能秒速顯示。

### 流程 2：雙向背景同步 (Bi-directional Synchronization)
1. **處理本地刪除**：將記錄在 `localStorage` 的已刪除 ID 傳送至 Supabase 進行刪除，完成後清除本地刪除日誌。
2. **上傳相片與記錄**：
   - 提取本地 `synced: false` 的未同步記錄。
   - 若記錄包含 Base64 相片，先將其轉換為 Blob，上傳至 Supabase Storage `baby-photos` bucket，取得公開圖片 URL 並替換。
   - 將完整的記錄（含圖片 URL）以 `upsert` 方式寫入 Supabase 的 `records` 資料表，並將本地記錄更新為 `synced: true`。
3. **下載雲端更新與合併**：
   - 從 Supabase 下載所有最新記錄。
   - 比對本地與雲端記錄，若本地不存在則直接寫入；若均存在，則比較 `updatedAt` 時間戳記，保留較新的版本（解決衝突）。
4. **同步雲端刪除**：若本地標記為 `synced: true` 的記錄在雲端已被刪除，則本地 IndexedDB 也會同步將其刪除。

### 流程 3：多裝置即時同步 (Real-time Broadcast)
- 使用者開啟網頁後，前端會向 Supabase 建立 WebSocket 長連接並訂閱 `public.records` 資料表的任何變更 (`INSERT`, `UPDATE`, `DELETE`)。
- 當爸爸在外面用手機記了一筆餵奶，Supabase 會即時向媽媽的手機網頁發送通知，媽媽的手機便會自動觸發 `syncWithSupabase()` 下載最新資料並更新圖表。

---

## 三、 資料庫選擇與優勢 (Supabase Database)

本系統全面採用 **Supabase** 作為後端資料庫解決方案，核心優勢包括：
1. **離線優先與雙向同步**：結合客戶端的 IndexedDB，即使在網路訊號差的臥室或離線狀態，家長依然能正常記錄；一旦回復網路，便能與 Supabase 進行完整同步。
2. **多裝置即時推播 (Realtime)**：內建基於 PostgreSQL 邏輯複製的 WebSocket 即時通知，不需輪詢 (polling) 即可達成家人共用、即時同步。
3. **雲端檔案儲存 (Storage)**：自帶 Storage 服務，能無縫儲存寶寶照片並產生公開 CDN URL，省去另建圖床的麻煩。
4. **無需後端代碼 (Serverless Client-Side SDK)**：前端直接透過 Supabase JS Client 即可安全讀寫資料庫，不需要維護伺服器。

---

## 四、 資料庫 Schema 設計 (Data Schema)

資料庫主要包含一個儲存作息與體重數據的 `records` 資料表，其定義如下：

### 1. PostgreSQL 資料表 Schema
```sql
-- 1. 建立 records 資料表
create table public.records (
    id text primary key,                   -- 唯一記錄 ID (例如: milk-1627000000000)
    type text not null,                   -- 記錄類型: milk (餵奶) | sleep (睡眠) | weight (體重)
    timestamp bigint not null,            -- 事件開始時間戳記 (例如: 1627000000000)
    "milkType" text,                      -- 喝奶種類: formula (配方) | breast_bottle (瓶餵) | breast_direct (親餵) | solid (副食品)
    amount numeric,                       -- 數值：喝奶容量 (ml) 或 寶寶體重 (kg)
    "leftDuration" numeric,               -- 左乳親餵時長 (分鐘)
    "rightDuration" numeric,              -- 右乳親餵時長 (分鐘)
    "endTime" bigint,                     -- 睡眠結束時間戳記
    duration numeric,                     -- 睡眠總時長 (分鐘)
    photo text,                           -- 雲端照片 URL 或本地 Base64 暫存
    note text,                            -- 家長備註
    "updatedAt" bigint not null           -- 最後更新時間戳記 (用於同步衝突排解)
);

-- 啟用 RLS (Row Level Security) 政策以提供安全防護
alter table public.records enable row level security;

-- 允許任何人進行讀取與寫入 (適用於免登入的家庭共用模式)
create policy "Allow public access" on public.records for all using (true) with check (true);

-- 2. 啟用即時訂閱機制 (Realtime)
alter publication supabase_realtime add table public.records;
```

---

## 五、 核心程式碼實作

### 1. Supabase 用戶端初始化 (`src/helpers/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured() {
    return !!supabase;
}
```

### 2. 即時監聽與訂閱 (`src/helpers/sync.js`)
```javascript
import { supabase, isSupabaseConfigured } from './supabase.js';

export function subscribeToRealtime(onSyncRequired) {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'records'
            },
            (payload) => {
                console.log('偵測到雲端資料變更:', payload.eventType);
                onSyncRequired(); // 觸發背景同步並重新整理畫面
            }
        )
        .subscribe();

    return channel;
}
```

---

## 六、 GitHub 版控與自動化部署流程 (CI/CD / Vercel 部署指南)

本系統非常適合託管於 **Vercel** 進行自動化部署與發佈，詳細部署規劃如下：

### 1. GitHub 儲存庫連結
- 在 GitHub 建立您的 Repo（例如：`baby-care-tracker`）。
- 本地開發使用 `.env` 管理環境變數（包含 Supabase 憑證），並加入 `.gitignore` 防止敏感資訊外洩。

### 2. Vercel 自動化部署設定步驟
1. **匯入專案**：登入 Vercel 後台，點擊 **Add New** > **Project**，並匯入您的 GitHub 專案。
2. **設定 Build & Development Settings**（Vercel 預設會自動偵測 Vite）：
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **設定環境變數 (Environment Variables)**：
   在部署前，必須在 Vercel 專案設定中加入以下兩個 Supabase 環境變數：
   - `VITE_SUPABASE_URL` : 您的 Supabase 專案 URL。
   - `VITE_SUPABASE_ANON_KEY` : 您的 Supabase 專案 Anon 公開金鑰。
4. **重新部署 (Redeploy)**：
   - ⚠️ **重要提示**：因為 Vite 的 `VITE_` 開頭變數是在**編譯階段 (Build time)** 被直接靜態寫入程式碼中的。若您在部署後才修改環境變數，請務必手動在 Vercel 上點擊 **Redeploy**，讓 Vite 重新將環境變數編譯打包進網頁，否則變數將不會生效。

---

## 七、 專案實作時程規劃 (Milestones)

- **第一階段 (MVP - 核心驗證與離線儲存)：**
  - 建立前端首頁作息記錄介面與計時器。
  - 實作 CameraPicker 元件進行相機拍照與前端相片縮圖壓縮。
  - 基於 Promise 封裝本地 IndexedDB，實現無網狀態下的資料讀寫與相片持久化儲存。

- **第二階段 (Supabase 雲端整合與即時同步 - 目前階段)：**
  - 整合 Supabase 資料庫，建立結構化的 `records` 資料表。
  - 設計 `baby-photos` Storage Bucket 與對應的安全性存取政策。
  - 實作雙向背景同步演算法，處理上傳相片、寫入記錄、比對 `updatedAt` 排除衝突與雲端同步刪除。
  - 實作 WebSocket 即時監聽機制，在多裝置開啟時能自動同步，不需要手動重整網頁。
  - 實作體重與成長曲線頁面（以無套件依賴之 SVG 繪製線條與陰影面積圖）。
  - 實作基於體重之每日建議奶量動態調整（公式：體重 × 150 ml），即時與首頁目標喝奶進度條連動。

- **第三階段 (多使用者權限與安全性強化 - 未來規劃)：**
  - 在前端將 `auth.enabled` 改為 `true`，並串接登入頁面。
  - 串接 Supabase Auth 認證，支援家長註冊與登入。
  - 修改 RLS 政策，將公眾讀寫改為：僅限登入之家庭成員帳號可以對屬於同一個寶寶的使用者群組資料進行讀寫。
