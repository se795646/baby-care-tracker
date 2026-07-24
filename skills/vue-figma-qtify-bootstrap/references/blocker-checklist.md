# Blocker Checklist

當缺資訊時，直接整理缺口並停止，不要半做。

## 必停條件

- env file 裡沒有 Figma URL
- env file 裡缺 `STARTER_TEMPLATE_PATH`、`QTIFY_PROJECT_PATH`、`APP_HOST`、或 `DOCKER_COMPOSE_PATH`，且使用者也未提供 override
- env file 裡有多個不同 Figma URL
- frontend-template path 不是可用模板
- Qtify 專案無法從 Storybook MCP、本地 stories、或部署網址取得元件資訊
- docker compose 看不出 host 該怎麼掛
- target host 與現有服務衝突

## 對 RD 的提問模板

### Figma 缺口

請 RD 補充以下其中一項：

- env file 裡實際用來放 Figma URL 的 key 名稱
- 或直接提供這次要使用的 Figma URL

### 路徑 / Host 缺口

請 RD 補充以下欄位，放進 env file 或直接在 prompt override：

- `STARTER_TEMPLATE_PATH`
- `QTIFY_PROJECT_PATH`
- `APP_HOST`
- `DOCKER_COMPOSE_PATH`

### Qtify / Storybook 缺口

請 RD 補充以下其中一項：

- 啟用可用的 Storybook MCP
- 提供 Qtify stories 在 repo 內的實際路徑
- 提供已部署的 Storybook URL

### Docker / Host 缺口

請 RD 補充：

- 現有可模仿的 compose service 名稱
- target host 的 router / reverse proxy 規則
- 是否需要 TLS / cert
