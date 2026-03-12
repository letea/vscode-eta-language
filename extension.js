const vscode = require('vscode');
const { formatEtaText } = require('./formatter');

function getConfiguredIndentSize() {
  const config = vscode.workspace.getConfiguration('eta.formatter');
  const configured = config.get('indentSize');
  if (typeof configured === 'number' && Number.isFinite(configured)) {
    return Math.max(1, Math.floor(configured));
  }
  return 2;
}

function createFullDocumentRange(document) {
  const lastLine = Math.max(0, document.lineCount - 1);
  const lastCharacter = document.lineAt(lastLine).text.length;
  return new vscode.Range(0, 0, lastLine, lastCharacter);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(
    { language: 'eta' },
    {
      provideDocumentFormattingEdits(document, options) {
        const sourceText = document.getText();
        const formattedText = formatEtaText(sourceText, {
          tabSize: options.tabSize,
          insertSpaces: options.insertSpaces,
          indentSize: getConfiguredIndentSize(),
        });

        if (formattedText === sourceText) {
          return [];
        }

        return [vscode.TextEdit.replace(createFullDocumentRange(document), formattedText)];
      },
    }
  );

  const formatCommand = vscode.commands.registerCommand('eta.formatDocument', async () => {
    await vscode.commands.executeCommand('editor.action.formatDocument');
  });

  context.subscriptions.push(formattingProvider, formatCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
