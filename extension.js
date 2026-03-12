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

function unwrapEtaComment(text) {
  const match = text.match(/^\s*<%\s*\/\*\s?([\s\S]*?)\s?\*\/\s*%>\s*$/);
  return match ? match[1] : null;
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

  const debugBlockCommentCommand = vscode.commands.registerCommand('eta.debugBlockComment', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const { document, selection } = editor;
    const currentLine = document.lineAt(selection.active.line).text;
    const selectedText = document.getText(selection);

    if (!selection.isEmpty) {
      const unwrappedSelection = unwrapEtaComment(selectedText);
      await editor.edit((editBuilder) => {
        if (unwrappedSelection !== null) {
          editBuilder.replace(selection, unwrappedSelection);
          return;
        }
        editBuilder.replace(selection, `<% /* ${selectedText} */ %>`);
      });
    } else {
      const lineRange = document.lineAt(selection.active.line).range;
      const unwrappedLine = unwrapEtaComment(currentLine);
      if (unwrappedLine !== null) {
        await editor.edit((editBuilder) => {
          editBuilder.replace(lineRange, unwrappedLine);
        });
      } else {
        await editor.insertSnippet(new vscode.SnippetString('<% /* $1 */ %>'), selection.active);
      }
    }
  });

  context.subscriptions.push(formattingProvider, formatCommand, debugBlockCommentCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
