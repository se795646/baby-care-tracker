# Input Contract

這個 skill 需要以下五項輸入齊全才進入實作：

1. env file path
2. frontend-template path
3. Qtify project path
4. target host name
5. docker compose yaml path

這五項可以：

- 全部從 env file 讀
- 或由使用者在 prompt 額外提供 override

規則：

- 顯式 override 優先於 env file
- env file 優先於任何預設值

## 各欄位用途

### 1. env file path

用途：

- 從 env file 讀出 Figma 設計圖網址
- 從 env file 讀出 bootstrap 所需的所有主要輸入

最低要求：

- 檔案存在
- 至少能解析出：
  - 一個明確 Figma URL
  - frontend-template path
  - Qtify project path
  - target host name
  - docker compose yaml path

### 2. frontend-template path

用途：

- 作為新專案複製來源
- 提供既有 Vue / Qtify / Tailwind / router 架構

最低要求：

- 是可讀可複製的本地路徑
- 內含 `package.json` 與 `src/`

env key:

- `STARTER_TEMPLATE_PATH`

### 3. Qtify project path

用途：

- 讓 AI 從 Storybook 或 stories 盤點可用元件
- 避免憑印象亂猜元件 props / slots

最低要求：

- 可讀
- 至少有一種可用來源：
  - Storybook MCP
  - 本地 story files
  - 已部署 Storybook URL

env key:

- `QTIFY_PROJECT_PATH`

### 4. target host name

用途：

- 決定本地或容器內要掛載的網址
- 可用來推導預設新專案資料夾名稱

最低要求：

- 是單一明確 host
- 不與現有服務衝突

env key:

- `APP_HOST`

### 5. docker compose yaml path

用途：

- 套用 service
- 掛上 target host
- 對齊現有開發環境或反向代理慣例

最低要求：

- 檔案存在
- 能看出如何新增或模仿既有 service

env key:

- `DOCKER_COMPOSE_PATH`

## 可自動推導，但不可亂猜

以下項目可在條件足夠時由 AI 自動推導：

- 新專案資料夾名稱
- 新 service 名稱
- 由 host slug 推導的 package name
- 可重用的 Qtify 元件候選

以下項目不可在資訊不足時硬猜：

- Figma URL 對應哪個 env key
- compose host routing 規則
- TLS / cert 要求
- Qtify 元件的實際 props 與互動行為
