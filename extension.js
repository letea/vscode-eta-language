const vscode = require('vscode');
const { html: htmlBeautify } = require('js-beautify');

/**
 * Regex for Eta blocks: <<%~, <%=, <%~, or <% ... until [-_\s]*%>
 * Matches opening (aligned with syntaxes/eta.tmLanguage.json) then content until closing.
 */
const ETA_BLOCK_REGEX = /(<<%[-_\s]*~|<%[-_\s]*=|<%[-_\s]*~|<%)[\s\S]*?[-_\s]*%>/g;

const PLACEHOLDER_PREFIX = '<!--ETA_PH_';
const PLACEHOLDER_SUFFIX = '_ETA-->';

/**
 * Replace all Eta blocks with single-line placeholders; return replaced text and blocks array.
 * @param {string} text
 * @returns {{ text: string, blocks: string[] }}
 */
function replaceEtaBlocksWithPlaceholders(text) {
  const blocks = [];
  const replaced = text.replace(ETA_BLOCK_REGEX, (match) => {
    const index = blocks.length;
    blocks.push(match);
    return PLACEHOLDER_PREFIX + index + PLACEHOLDER_SUFFIX;
  });
  return { text: replaced, blocks };
}

/**
 * Restore Eta blocks from placeholders.
 * @param {string} text
 * @param {string[]} blocks
 * @returns {string}
 */
function restoreEtaBlocks(text, blocks) {
  let result = text;
  for (let i = 0; i < blocks.length; i++) {
    const placeholder = PLACEHOLDER_PREFIX + i + PLACEHOLDER_SUFFIX;
    result = result.replace(placeholder, blocks[i]);
  }
  return result;
}

/**
 * Format Eta file: placeholder → html_beautify → restore.
 * @param {string} text
 * @param {vscode.FormattingOptions} options
 * @returns {string}
 */
function formatEtaText(text, options) {
  const { text: withPlaceholders, blocks } = replaceEtaBlocksWithPlaceholders(text);
  const indentChar = options.insertSpaces ? ' ' : '\t';
  const indentSize = options.insertSpaces ? options.tabSize : 1;
  const formatted = htmlBeautify(withPlaceholders, {
    indent_size: indentSize,
    indent_char: indentChar,
    indent_inner_html: true,
    wrap_line_length: 0,
    preserve_newlines: false,
  });
  return restoreEtaBlocks(formatted, blocks);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const formatter = {
    provideDocumentFormattingEdits(document, options, _token) {
      const text = document.getText();
      const formatted = formatEtaText(text, options);
      if (formatted === text) {
        return [];
      }
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      return [vscode.TextEdit.replace(fullRange, formatted)];
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('eta', formatter)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
