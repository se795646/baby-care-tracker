# 嬰兒照護紀錄 Web App 系統架構與開發實作指南

本文件為「嬰兒拍照自動化照護紀錄 (Milk & Sleep Tracker)」的完整系統架構與實作計畫指南，說明如何利用照片分析、Serverless 後端、Notion API 資料庫，以及 GitHub / Vercel CI/CD 流程來完成自動化紀錄與統計分析。

---

## 一、 系統整體架構圖 (System Architecture)

```
[使用者手機/前端 (Vue 3 / PWA)]
        │
        ├── 1. 拍照 / 上傳照片 (奶瓶/睡眠狀態)
        ▼
[ Serverless API / 後端中介層 (Vercel Functions) ]
        │
        ├── 2. 影像辨識與結構化萃取 (OpenAI GPT-4o / Claude Vision API)
        │      └── 辨識出：時間、事件類型 (飲奶/睡眠)、容量(ml)、備註
        │
        ├── 3. 寫入資料庫 (Notion Database)
        │      └── Notion API (方便手動檢視與修正，無須建置後台)
        │
        └── 4. 統計與報表聚合 (Aggregated Insights)
               └── 產出每日總奶量、睡眠時數、時間間隔趨勢分析
```

---

## 二、 完整作業流程設計 (End-to-End Workflow)

### 流程 1：拍照上傳與 AI 結構化萃取
1. **拍照上傳：** 家長在 Web App 點擊拍照（例如拍攝奶瓶剩餘刻度，或是嬰兒在床上睡覺/醒來的照片）。
2. **傳送至後端：** 前端將照片（Base64 或 Blob）透過 POST 請求發送至 Serverless API (`/api/recognize`)。
3. **AI Vision 判讀：** 後端呼叫 Vision API 並帶入專屬 Prompt，自動擷取事件資訊：
   - **喝奶範例：** 「辨識奶瓶刻度，輸出剩餘與總奶量，算出本次喝奶量」。
   - **睡眠範例：** 「辨識照片狀況判斷入睡/醒來，結合目前時間標記事件」。
4. **回傳與確認：** API 回傳 JSON 結構給前端，前端顯示辨識結果供家長快速確認（可微調刻度或時間），確認後寫入資料庫。

### 流程 2：資料庫儲存與維護
- **事件寫入**：將確認後的紀錄透過 Notion API 寫入 Notion 資料庫。
- **人工修正機制**：若家長事後發現記錄有誤，可以直接在 Web App 介面編修，或直接開啟 Notion 頁面進行手動修正與刪除。


### 流程 3：統計分析與可視化
- **每日總結：** 計算當日累計喝奶量 (ml)、總喝奶次數、平均間隔時間、總睡眠時數。
- **圖表繪製：** 前端使用 **Chart.js** 或 **Recharts** 繪製「24小時時序圖」與「每日趨勢圖」，方便觀察寶寶的作息規律。

---

## 三、 資料庫選擇與優勢 (Notion Database)

本系統全面採用 **Notion Database** 作為主要儲存資料庫，其核心優勢包括：
1. **現成的視覺化界面**：家長無需任何額外的後台管理系統，直接用手機打開 Notion App 就能以表格（Table View）或日曆（Calendar View）直觀檢視與修改記錄。
2. **零建置成本**：提供免費的雲端儲存空間，API 文件豐富且設定簡單，非常適合個人與家庭日常使用。
3. **靈活度高**：家長可隨意在 Notion 中新增自訂欄位，不影響前端核心 API 運作。

---

## 四、 資料庫 Schema 設計 (Data Schema)

本系統之 JSON 資料欄位與 Notion Database / Supabase 欄位屬性對照表如下：

### 1. JSON 資料結構
```json
{
  "id": "uuid-v4",
  "user_id": "user_12345",
  "event_type": "MILK", // 必填：MILK (喝奶) | SLEEP_START (入睡) | SLEEP_END (醒來) | DIAPER (換尿布) | WEIGHT (體重)
  "timestamp": "2026-07-24T14:30:00Z", // 事件時間
  "amount_ml": 150, // 數值：喝奶量 (ml) 或是 寶寶體重 (kg，僅 WEIGHT 事件使用)
  "duration_minutes": 120, // 睡眠時數 (分鐘)，僅 SLEEP_END 事件計算
  "diaper_status": "WET", // 尿布狀態，僅 DIAPER 事件使用，可選值：WET (濕) | DIRTY (乾) | BOTH (乾濕)
  "image_url": "https://storage.example.com/photos/abc.jpg", // 拍照照片備份網址
  "note": "喝得比較慢，有打嗝", // 備註
  "created_at": "2026-07-24T14:31:05Z"
}
```

### 2. 資料庫屬性對照
| 欄位名稱 | 資料庫類型 | 對應 JSON 欄位 | 說明 |
| :--- | :--- | :--- | :--- |
| **ID** | Text / Title | `id` | 唯一的記錄 ID (主鍵，必填) |
| **事件類型** | Text / Select | `event_type` | 可選值：MILK, SLEEP_START, SLEEP_END, DIAPER, WEIGHT |
| **時間** | Bigint / Date | `timestamp` | 事件發生時間 |
| **數值(奶量/體重)**| Numeric / Number| `amount_ml` | 喝奶容量 (ml) 或是 寶寶體重 (kg) |
| **睡眠時數(分)** | Numeric / Number| `duration_minutes` | 睡眠時間 (分鐘) |
| **尿布狀態** | Text / Select | `diaper_status` | 可選值：WET, DIRTY, BOTH |
| **照片網址** | Text / URL | `image_url` | 雲端照片儲存網址 |
| **使用者ID** | Text / Rich text | `user_id` | 使用者 ID |
| **備註** | Text / Rich text | `note` | 記錄備註資訊 |
| **更新時間** | Bigint / Date | `updated_at` | 系統記錄更新時間 |

---

## 五、 核心程式碼範例 (Code Snippets)

### 1. Vision API 辨識照片 API (`api/recognize.js`)

```javascript
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { imageBase64 } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `你是一個嬰兒照護辨識助手。請分析照片並輸出 JSON 格式：
          {
            "event_type": "MILK" | "SLEEP_START" | "SLEEP_END" | "DIAPER" | "UNKNOWN",
            "amount_ml": 數字(若為奶瓶刻度，請辨識並計算出喝奶量毫升數，否則為 null),
            "diaper_status": "WET" | "DIRTY" | "BOTH" (若是尿布照片，否則為 null),
            "confidence": 0.0~1.0,
            "description": "簡短的辨識結果描述，例如：'奶瓶剩餘 50ml，估算喝了 150ml' 或 '寶寶入睡中' 或 '尿布濕了'"
          } 只能回傳符合 Schema 的 JSON，不要有任何 Markdown 標記或其它多餘文字。`
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 2. 寫入 Notion Database API (`api/log-event.js`)

```javascript
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const {
    id,
    user_id,
    event_type,
    timestamp,
    amount_ml,
    duration_minutes,
    diaper_status,
    image_url,
    note,
    created_at
  } = req.body;

  try {
    const properties = {
      "ID": { title: [{ text: { content: id || `event-${Date.now()}` } }] },
      "事件類型": { select: { name: event_type } },
      "時間": { date: { start: timestamp } }
    };

    // 依據事件類型與資料內容動態寫入可選欄位，避免空值錯誤
    if (amount_ml !== undefined && amount_ml !== null) {
      properties["奶量(ml)"] = { number: Number(amount_ml) };
    }
    if (duration_minutes !== undefined && duration_minutes !== null) {
      properties["睡眠時數(分)"] = { number: Number(duration_minutes) };
    }
    if (diaper_status) {
      properties["尿布狀態"] = { select: { name: diaper_status } };
    }
    if (image_url) {
      properties["照片網址"] = { url: image_url };
    }
    if (user_id) {
      properties["使用者ID"] = { rich_text: [{ text: { content: user_id } }] };
    }
    if (note) {
      properties["備註"] = { rich_text: [{ text: { content: note } }] };
    }
    if (created_at) {
      properties["建立時間"] = { date: { start: created_at } };
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties
    });

    return res.status(200).json({ success: true, message: '成功寫入 Notion！' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 六、 GitHub 版控與自動化部署流程 (CI/CD Workflow)

1. **Repository 設定：**
   - 在 GitHub 建立 Private Repo（例如：`baby-care-tracker`）。
   - 本地開發使用 `.env.local` 管理環境變數（包含 API Key），並加入 `.gitignore` 避免外洩。

2. **Vercel 自動部署整合：**
   - 登入 Vercel 並匯入該 GitHub Repo。
   - 在 Vercel 後台設定 **Environment Variables**：
     - `OPENAI_API_KEY`
     - `NOTION_KEY`
     - `NOTION_DATABASE_ID`
   - **分支部署機制：**
     - 推送至 `main` 分支 ➔ 自動觸發 Production 部署。
     - 推送至 `feature/*` 分支 ➔ 自動產生 Preview 測試網址。

---

## 七、 專案實作時程規劃 (Milestones)

- **第一階段 (MVP - 核心驗證)：**
  - 建立前端相機拍攝/檔案選擇介面。
  - 串接 Vision API 成功辨識刻度與時間。
  - 串接 Notion API 實現單筆紀錄自動寫入。

- **第二階段 (UI/UX 強化與統計)：**
  - 新增辨識結果預覽與人工手動校正介面。
  - 實作當日奶量與睡眠時間總計圖表。
  - 實作體重與成長曲線頁面（以無套件依賴之 SVG 繪製線條與陰影面積圖）。
  - 實作基於體重之每日建議奶量動態調整（公式：體重 × 150 ml），即時與首頁目標喝奶進度條連動。
  - 支援 PWA (Progressive Web App)，讓手機可新增至主畫面當作原生 App 使用。

- **第三階段 (多使用者與優化 - 選配)：**
  - 若有其他家庭成員/保母共同記錄，可透過 Notion 團隊共享資料庫，或由後端 API 進行多帳號權限過濾。
  - 增加快取與即時推送通知 (例：距離上次喝奶已過 4 小時提醒)。
