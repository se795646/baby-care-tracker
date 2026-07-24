# Vue + Figma + Qtify Skill Map

## 現有 skill 如何分工

- `figma-design`
  - 負責讀 Figma URL、切 node、取 screenshot / metadata / token
  - 適合做設計理解，不負責建立專案

- `vue-create`
  - 負責從 `frontend-template` 建新 Vue 專案
  - 已包含 starter 複製、Figma 讀取、token mapping 的基本思路
  - 但沒有把 `env file`、`host`、`docker compose`、`Qtify project path` 收成固定 contract

- `qtify-compose`
  - 負責從需求查 Qtify 元件並組 Vue template
  - 適合單頁或區塊組裝，不負責整體專案 bootstrap

## 新 skill 補上的缺口

新 skill `vue-figma-qtify-bootstrap` 多了下面幾件事：

- 把輸入固定成五項 contract
- 強制從 env file 找 Figma URL
- 強制檢查 Qtify / Storybook 能力
- 強制檢查 docker compose 與 host 掛載方式
- 缺資訊時，不允許 AI 硬做，必須先請 RD 補充

## 建議使用方式

當你要建立新專案時，現在建議優先把資訊都放進 env file，然後只丟 env file 給 AI：

```text
Use $vue-figma-qtify-bootstrap with:
- env file: /path/to/.env
```

若某些值想臨時覆蓋，再額外帶 override。

如果資訊足夠，AI 應該：

1. 優先從 env file 解析五項輸入
2. 從 env file 讀 Figma URL
3. 從 Figma 讀設計
4. 從 Qtify / Storybook 找元件
5. 複製 frontend-template 成新資料夾專案
6. 依 docker compose 現有規則把網址掛到指定 host

如果資訊不足，AI 應該先停下來，列出缺口，請 RD 補充後再繼續。
