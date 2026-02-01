# Eta Language Support

Cursor / VS Code extension: provides syntax highlighting and basic editing support for `.eta` (Eta template) files.

## Features

- **Syntax highlighting**: HTML blocks, Eta tags (`<%=`, `<%~`, `<%`), and JavaScript inside tags
- **Embedded JavaScript**: Inside `<% ... %>`, enjoy bracket matching, comments (`//`, `/* */`), and other JS-consistent editing behavior
- **Format on save**: Can be registered as Eta's formatter, supporting "Format Document" and "Format on Save" (enable in settings)

## Installation and Verification

### Load in Cursor (development mode)

1. Open the Command Palette in Cursor with `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Run **"Extensions: Install Extension from Folder"** or **"Development: Run Extension in Development Host"**
3. Select this project directory (e.g. `vscode-eta-language`)
4. A new Cursor window will open with this extension loaded
5. Open or create a file with the `.eta` extension in the new window to see syntax highlighting

### Sample file

The project includes `sample.eta`, which you can use to verify that all three Eta tag types and HTML are highlighted correctly.

### Format on save

The extension registers an Eta **Document Formatting** provider; HTML blocks are indented according to `js-beautify` rules, and Eta tag (`<% ... %>`) contents are left unchanged.

To enable automatic formatting on save, add the following to your Cursor/VS Code `settings.json` for Eta:

```json
"[eta]": {
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "vscode-eta-language"
}
```

If workspace or user settings already enable `editor.formatOnSave` and do not disable it for `[eta]`, the extension's formatter will be used on save; in that case you may omit `editor.defaultFormatter`.

## Supported Eta syntax

| Tag           | Example                                   | Description          |
| ------------- | ----------------------------------------- | -------------------- |
| Interpolation | `<%= it.name %>`                          | Output and escape    |
| Raw output    | `<%~ it.html %>`, `<<%~ it.body %>`       | Output raw HTML      |
| Code/comment  | `<% /* comment */ %>`, `<% if (x) { %>`   | Execute JS           |
| Whitespace    | `<%-= ... -%>`                            | Optional `-` / `_`   |

## License

MIT
