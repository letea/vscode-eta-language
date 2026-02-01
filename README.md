# Eta Language Support

Cursor / VS Code 擴充套件：為 `.eta`（Eta 模板）檔案提供語法高亮與基本編輯支援。

## 功能

- **語法高亮**：HTML 區塊、Eta 標籤（`<%=`、`<%~`、`<%`）、以及標籤內的 JavaScript
- **嵌入 JavaScript**：在 `<% ... %>` 內享有括號配對、註解（`//`、`/* */`）等與 JS 一致的編輯行為
- **存檔時格式化**：可註冊為 Eta 的 formatter，支援「Format Document」與「Format on Save」（需在設定中啟用）

## 安裝與驗證

### 在 Cursor 中載入（開發模式）

1. 在 Cursor 中按 `Cmd+Shift+P`（macOS）或 `Ctrl+Shift+P`（Windows/Linux）開啟命令面板
2. 執行 **「擴充功能：從資料夾安裝擴充功能」** 或 **「開發：從擴充功能開發主機執行」**
3. 選擇本專案目錄 `eta-language-format`
4. 會開啟新的 Cursor 視窗，其中已載入此擴充套件
5. 在新視窗中開啟或建立副檔名為 `.eta` 的檔案，即可看到語法高亮

### 範例檔案

專案內含 `sample.eta`，可用於檢查三種 Eta 標籤與 HTML 的高亮是否正確。

### 存檔時格式化

擴充會註冊 Eta 的 **Document Formatting** 提供者；HTML 區塊會依 `js-beautify` 規則縮排，Eta 標籤（`<% ... %>`）內容會保留不變。

若要存檔時自動格式化，請在 Cursor/VS Code 的 `settings.json` 中為 Eta 啟用：

```json
"[eta]": {
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "eta-language-format"
}
```

若工作區或使用者已啟用 `editor.formatOnSave`，且未針對 `[eta]` 關閉，存檔時也會使用本擴充的 formatter；此時可省略 `editor.defaultFormatter`。

## 支援的 Eta 語法

| 標籤        | 範例                                    | 說明             |
| ----------- | --------------------------------------- | ---------------- |
| 插值        | `<%= it.name %>`                        | 輸出並跳脫       |
| 原始輸出    | `<%~ it.html %>`、`<<%~ it.body %>`     | 輸出原始 HTML    |
| 程式碼/註解 | `<% /* comment */ %>`、`<% if (x) { %>` | 執行 JS          |
| 空白控制    | `<%-= ... -%>`                          | 可選的 `-` / `_` |

## 授權

MIT
