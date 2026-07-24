# Figma + Qtify 快速搭建脈絡整理

針對 `frontend-template` 搭配 `Qtify` 與 `figma-remote-mcp` 快速搭建 UI 的討論脈絡，供目前 session 直接延續使用。

## 目標

使用者要的不是泛用設計轉碼，而是：

- 直接在 `frontend-template` 上試作
- 以 Figma 節點為輸入
- 用 `figma-remote-mcp` 讀設計
- 以 `Qtify` 元件與既有 template 結構實作畫面
- 顏色、樣式盡量落到 `Qtify` 已定義 token

一句話總結：

> 在 frontend-template 上，利用 Figma MCP + Qtify + color token，快速把指定 Figma 節點落地成可跑的 Vue UI。

## 明確約束

- 顏色要用 `color token`
- 樣式優先用 `tailwind @apply`
- token 只能用 `Qtify` 裡已有定義
- 若能做 token 置換，優先用 token 置換方式
- 不應修改 `Qtify` 本體或進 `Qtify` container 動手
- 測試或執行應只在目前 frontend-template 專案環境進行
- 試作性改動不要全部進 commit，只有結構性且真正必要的改動才提交
