---
name: vue-figma-qtify-bootstrap
description: "從 env file 讀取 Figma 設計圖網址、frontend-template 路徑、Qtify 專案路徑、target host 與 docker compose 路徑，自動建立新的 Vue 專案骨架並規劃後續實作。Use when the user provides an env file for bootstrap, optionally with explicit overrides for frontend-template path, Qtify project path, host name, or docker compose yaml path. Stop and ask RD for missing or ambiguous information before continuing."
---

使用這個 skill 時，將輸入視為一份建立新專案的 contract，而不是單純 UI 轉碼任務。

建議呼叫方式：

```text
Use $vue-figma-qtify-bootstrap with:
- env file: <path>
```

可選 override：

```text
Use $vue-figma-qtify-bootstrap with:
- env file: <path>
- frontend-template: <path>
- qtify project: <path>
- host: <hostname>
- docker compose: <path>
```

必要時先讀：

- `references/input-contract.md`
- `references/blocker-checklist.md`
- `assets/.env.example`

## Phase 0: 驗證輸入

先讀 `assets/.env.example` 對照 env file，優先從 env file 解析以下欄位：

- `FIGMA_URL`
- `APP_HOST`
- `STARTER_TEMPLATE_PATH`
- `QTIFY_PROJECT_PATH`
- `DOCKER_COMPOSE_PATH`

若使用者有另外提供顯式參數，則視為 override，優先級高於 env file。

接著確認最終生效的五個輸入都有值且路徑存在：

- env file path
- frontend-template path
- Qtify project path
- target host name
- docker compose yaml path

任何一項缺失時，停止並用 `references/blocker-checklist.md` 的問題模板請 RD 補資訊。

## Phase 1: 從 env file 找 Figma URL

先用 `assets/.env.example` 對照提供的 env file，再開始解析。只從提供的 env file 或顯式 override 讀取，不憑記憶猜設計稿。

依序尋找常見 key：

- `FIGMA_URL`
- `FIGMA_FILE_URL`
- `FIGMA_DESIGN_URL`
- `VITE_FIGMA_URL`
- `VITE_FIGMA_DESIGN_URL`

若沒有找到：

- 停止
- 請 RD 明確提供 env key 名稱或直接提供 Figma URL

若找到多個不同 Figma URL：

- 停止
- 列出候選 key
- 請 RD 指定這次應使用哪一個

找到後，使用 `figma-design` skill 的流程讀取：

- 先做結構探索
- 需要樣式細節時再縮小到最小節點
- 不要一開始就對大範圍節點呼叫設計 context

## Phase 2: 盤點 frontend-template

在最終生效的 `frontend-template path` 內確認至少存在：

- `package.json`
- `src/`
- 既有 Qtify / Tailwind / router 結構

如果模板不是標準 frontend-template 結構：

- 停止
- 請 RD 確認這個路徑是不是正確模板，或提供正確模板 repo/path

## Phase 3: 盤點 Qtify 專案與 Storybook 能力

在最終生效的 `Qtify project path` 內確認是否存在可用的 Storybook 線索，例如：

- `.storybook/`
- `stories/`
- `storybook-static/`
- package scripts 中的 storybook 命令

若 session 內有 Storybook MCP / 資源：

- 用它查可重用元件、props、states、design tokens

若沒有 Storybook MCP，但本地 Qtify 專案可以直接讀 story 檔：

- 讀 story 檔與元件定義作為退化方案

若兩者都沒有：

- 停止
- 請 RD 補其一：
  - 啟用 Storybook MCP
  - 提供可讀的本地 stories
  - 提供已部署的 Storybook URL

不要憑記憶猜 Qtify props 或 slot。

## Phase 4: 決定新專案目錄

若使用者沒有另外指定輸出目錄，預設：

- 將新專案建立在 frontend-template 的同層目錄
- 目錄名使用 target host name slug 化後的結果

例如：

- host `quiz-admin.example.test`
- project folder `quiz-admin-example-test`

若目錄已存在：

- 停止
- 請 RD 決定要覆用、改名、或先清理舊目錄

複製模板時：

- 複製 frontend-template 內容到新目錄
- 不要沿用原模板 `.git`
- 是否 `git init` / 設 remote，若未明確要求，先不要自動推遠端

## Phase 5: 套用 host 與 docker compose

先閱讀最終生效的 docker compose yaml 與鄰近服務慣例，確認 host 是怎麼掛上的。

優先依既有模式操作，例如：

- reverse proxy labels
- env vars
- extra hosts
- nginx / traefik router 規則

若 compose 檔沒有足夠脈絡判斷如何把新專案掛到 target host：

- 停止
- 請 RD 補：
  - 一個可模仿的既有 service
  - TLS / cert 需求
  - 入口 port / router 規則

不要自行發明新的 routing 規約。

## Phase 6: 對齊 Figma 與 Qtify

把 Figma 設計轉成實作時，遵守以下順序：

1. 先用 `figma-design` 讀結構與 tokens
2. 再用 Qtify / Storybook 找可直接重用的元件
3. 優先使用 Qtify token 與元件
4. 樣式優先使用現有 Tailwind / `@apply`
5. 不修改 Qtify library 本體

如果 Figma 與 Qtify 無法一對一對上：

- 先產生最小可運行版本
- 在回報中標記哪些區塊需要 RD / 設計確認

## Phase 7: 缺資訊就停

以下情況不得硬做：

- env file 中沒有明確 Figma URL
- frontend-template path 不是可用模板
- Qtify 專案沒有可讀 stories，且沒有 Storybook MCP / URL
- docker compose 無法推斷 host 綁定方式
- 專案名稱、輸出目錄、路由規則與現有服務衝突
遇到上述情況時，直接整理缺口，請 RD 補完再繼續。

## 輸出要求

完成後至少回報：

- 使用的 Figma URL 與關鍵 node
- 新專案路徑
- 套用的 host name
- 修改了哪些 compose / routing 設定
- 使用了哪些 Qtify 元件
- 哪些資訊仍需 RD 補充

## Rules

- 先驗證，再複製模板，再做 UI
- 優先重用 `figma-design`、`vue-create`、`qtify-compose` 的方法，不重新發明流程
- 不要假設 env key 名稱、host routing 規則、Qtify 元件 API
- 缺資訊時不要繞過，直接停下來請 RD 補
