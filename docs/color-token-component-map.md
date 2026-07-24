# Qtify Color Token → Component 對應表

換品牌色時，修改 `src/assets/css/module/qtifyOverride.css` 即可。
本表列出每個 token 實際用在哪些元件的哪些狀態，方便確認改色後的影響範圍。

> 來源：`@benqcloud/qtify` tailwind.config.base.cjs + src/components/

---

## Common 語意色

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--color-primary` | royal-blue-7 | QBtn, QTextField, QTextArea, QSelect, QDatePicker, QSettingListNormal, QSubSettingItems, QListItem, QList, QPageErrorStatus, TimePicker/FlexModeField | 主色：focus 邊框、選中文字、primary 圖示 |
| `--color-secondary` | gray-8 | — | 次色（預留） |
| `--color-brand` | navy-peony-10 | — | 品牌色（預留） |
| `--color-navigation` | navy-peony-10 | — | 導航色（預留） |
| `--color-danger` | carmine-pink-10 | QBtn, QSettingListNormal, QSubSettingItems, QListItem, QList | 危險操作按鈕、危險文字 |
| `--color-status-error` | carmine-pink-10 | TimePicker/FlexModeField, QTab | 錯誤狀態邊框、錯誤文字 |
| `--color-status-success` | ocean-green-9 | — | 成功狀態 |
| `--color-status-notification` | carmine-pink-10 | Header/Notification | 通知紅點 |
| `--color-text-link` | royal-blue-7 | QHyperlink | 連結文字預設色 |
| `--color-text-link-hover-with-icon` | royal-blue-7 | QHyperlink | 帶 icon 連結 hover |
| `--color-text-link-hover-no-icon` | royal-blue-6 | QHyperlink | 純文字連結 hover |
| `--color-text-link-disable` | gray-3 | QHyperlink | 連結 disabled |

## Header

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--header-bg-color` | navy-peony-10 | QHeader | header 背景色 |
| `--header-text-color` | white | QHeader | app name + org 文字色 |
| `--header-divider-border-color` | white | QHeader | 分隔線顏色 |
| `--header-org-bg-color-hover` | navy-peony-8 | QHeader | 組織切換 hover 背景 |
| `--header-org-bg-color-selected` | navy-peony-10 | QHeader | 組織切換 selected 背景 |
| `--header-org-border-color-selected` | white | QHeader | 組織切換 selected 邊框 |
| `--header-org-icon-color` | white | QHeader | 組織切換 icon 色 |

## Side Navigation

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--nav-bg-color` | navy-peony-10 | QSideNavigation | 側欄背景 |
| `--nav-arrow-icon-color` | white | QSideNavigation | 收合箭頭 icon |
| `--nav-item-text-color` | white | QSideNavigation, NavItem | 項目文字色 |
| `--nav-item-bg-color-hover` | navy-peony-8 | QSideNavigation, NavItem | 項目 hover 背景 |
| `--nav-item-bg-color-selected` | royal-blue-6 | NavItem | 項目 selected 背景 |
| `--nav-item-icon-color-hover` | white | NavItem | 項目 hover icon |
| `--nav-item-icon-color-selected` | white | NavItem | 項目 selected icon |
| `--nav-item-text-color-hover` | white | NavItem | 項目 hover 文字 |
| `--nav-item-text-color-selected` | white | NavItem | 項目 selected 文字 |
| `--nav-item-with-sub-text-color` | navy-peony-4 | NavItem | 子項文字色 |
| `--nav-item-with-sub-text-color-hover` | navy-peony-4 | NavItem | 子項 hover 文字 |
| `--nav-item-with-sub-text-color-selected` | white | NavItem | 子項 selected 文字 |
| `--nav-heading-text-color` | gray-3 | QSideNavigation | 群組標題色 |
| `--nav-divider-border-color` | navy-peony-7 | QSideNavigation | 分隔線色 |
| `--nav-collapse-icon-color` | white | QSideNavigation, NavItem | 收合 icon 色 |
| `--nav-collapse-icon-color-selected` | royal-blue-5 | NavItem | 收合 icon selected |
| `--nav-app-name-text-color` | navy-peony-3 | QSideNavigation | App 名稱文字 |

## Button

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--btn-bg-color-primary-default` | royal-blue-7 | QBtn, QAddBtn | Primary 按鈕背景 |
| `--btn-bg-color-primary-hover-selected` | royal-blue-6 | QBtn, QAddBtn | Primary hover/selected 背景 |
| `--btn-bg-color-secondary-hover-selected` | royal-blue-1 | QBtn, QTab | Secondary hover 背景 |
| `--btn-text-color-secondary-hover-selected` | royal-blue-7 | QBtn | Secondary hover 文字 |
| `--btn-border-color-secondary` | gray-3 | QBtn | Secondary 邊框 |
| `--btn-bg-color-disabled` | gray-1 | QBtn | Disabled 背景 |
| `--btn-border-color-secondary-disabled` | gray-2 | QBtn | Secondary disabled 邊框 |

## Icon Button

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--icon-btn-bg-color-primary-default` | royal-blue-7 | QIconBtn | Primary 背景 |
| `--icon-btn-bg-color-primary-hover-selected` | royal-blue-6 | QIconBtn | Primary hover 背景 |
| `--icon-btn-bg-color-secondary-hover-selected` | royal-blue-1 | QIconBtn | Secondary hover 背景 |
| `--icon-btn-border-color-secondary` | gray-2 | QIconBtn | Secondary 邊框 |
| `--icon-btn-bg-color-secondary-hollow-hover-selected` | royal-blue-1 | QIconBtn | Hollow hover 背景 |

## Checkbox

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--checkbox-bg-color-bulk-check-actived` | royal-blue-7 | QCheckbox | 選中背景 |
| `--checkbox-border-color-uncheck-actived` | gray-5 | QCheckbox | 未選中邊框 |
| `--checkbox-border-color-uncheck-disabled` | gray-2 | QCheckbox | Disabled 未選中邊框 |
| `--checkbox-bg-color-bulk-check-disabled` | gray-3 | QCheckbox | Disabled 選中背景 |

## Switch

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--switch-on-mix-track-color-active` | royal-blue-7 | QSwitch | 開啟時 track 色 |
| `--switch-on-mix-control-color-active` | white | QSwitch | 開啟時 thumb 色 |
| `--switch-on-mix-icon-color-active` | royal-blue-7 | QSwitch | 開啟時 icon 色 |
| `--switch-off-track-color-active` | gray-3 | QSwitch | 關閉時 track 色 |
| `--switch-off-icon-color-active` | gray-5 | QSwitch | 關閉時 icon 色 |

## Progress

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--progress-bar` | royal-blue-5 | QDataTable | 進度條色 |
| `--progress-bar-na` | gray-2 | — | 無資料進度條 |

## Dropdown

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--dropdown-list-hover` | royal-blue-1 | QDropdown, QList, QRadio, QBottomSheet, QDataTable | 下拉選項 hover 背景 |

## DatePicker

| Token | 預設值 | 使用元件 | 用途 |
|-------|--------|---------|------|
| `--date-picker-fill-color-hover` | royal-blue-1 | QDatePicker | 日期 hover 背景 |
| `--date-picker-fill-color-range` | royal-blue-1 | QDatePicker | 範圍選取背景 |
| `--date-picker-fill-color-selected` | royal-blue-7 | QDatePicker | 選中日期背景 |
| `--date-picker-border-color-today` | royal-blue-7 | QDatePicker | 今天日期邊框 |
| `--date-picker-fill-color-calendar-btn-hover` | royal-blue-1 | QDatePicker | 月曆按鈕 hover |
| `--date-picker-fill-color-month-year-hover` | royal-blue-1 | QDatePicker | 月/年選擇 hover |
| `--date-picker-text-color-month-year-hover` | royal-blue-7 | QDatePicker | 月/年選擇 hover 文字 |
| _(其餘 DatePicker tokens 為 gray/white，通常不需覆蓋)_ | | | |

---

## 換色快速指南

### 只換 Primary（最常見）
替換 `qtifyOverride.css` 中所有 `royal-blue` → 你的色系名。
影響：按鈕、連結、checkbox、switch、progress、dropdown hover、date picker。

### 換 Header + Nav（深色底 → 淺色底）
1. `--header-bg-color` 換成你的品牌色
2. 所有 `--nav-*` token 改為淺色模式（參考 AMS example）
3. 注意：深色底用 white 文字，淺色底要改成 gray-8 文字

### 完整換色（如 AMS）
參考 `qtifyOverride.css` 底部的 AMS avocado 完整範例。
