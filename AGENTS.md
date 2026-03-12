# AGENTS

## 專案定位

`vscode-eta-language` 是針對 `.eta` 檔案的 Cursor / VS Code 擴充功能，核心能力包含：
- Eta 語法高亮（含嵌入 JavaScript）
- `eta.debugBlockComment` 註解快捷命令
- 文件格式化（`eta.formatDocument` + format on save）

## 規範來源優先順序

1. Eta 官方文件與範例：<https://eta.js.org/>
2. 本專案現況實作：`package.json`、`extension.js`、`formatter.js`、`README.md`
3. 若兩者不一致，先記錄現況行為，再提出對齊官網語意的最小改動方案

## 主要檔案地圖

- `package.json`: extension manifest、activation events、commands、keybindings、configuration
- `extension.js`: 命令註冊、format provider 註冊、editor 行為入口
- `formatter.js`: Eta/HTML 混合縮排演算法（HTML depth + Eta structure depth）
- `syntaxes/*.json`: TextMate grammar 與 injection 規則
- `README.md`: 使用者可見功能說明與設定方式

## 標準工作流程

1. 先閱讀 `README.md` 與 `package.json`，確認使用者可見功能與註冊點
2. 若改 `extension.js`，同步檢查 command id、activationEvents、keybinding 是否仍一致
3. 若改 `formatter.js`，先定義最小案例（input/output）再調整邏輯
4. 若改公開行為（命令、格式化、設定），同步更新 `README.md`

## Formatter 護欄

- 目標是「調整排版」，不是改寫模板語意
- Eta tag 行為需符合官方語意：如 `<%=`, `<%~`, `<% ... %>`, `/* ... */`, whitespace control (`-`)
- 對混合行（Eta + HTML）修改時，需覆蓋至少一個包含 `%>` 後接 HTML 的案例
- 不要在沒有必要時改動 tag 內容字串與 JS 程式片段

## 命令與註冊一致性檢查

每次涉及命令或格式化器改動時，逐項確認：
- `package.json` 的 `activationEvents` 是否包含對應 command / language
- `contributes.commands` 與 `extension.js` 註冊 id 完整一致
- keybinding `when` 條件與 `editorLangId == eta` 需求一致
- formatter 設定項（如 `eta.formatter.indentSize`）與執行程式碼相符

## 完成定義（DoD）

- 行為與官方 Eta 語意無衝突，且未破壞既有功能
- 規格/文件同步（至少更新 `README.md` 中受影響段落）
- 提供簡短驗證步驟：如何在 `.eta` 檔確認命令與格式化結果

