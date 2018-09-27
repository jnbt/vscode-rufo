import * as vscode from 'vscode';
import Rufo from './rufo';

export default class EditProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {
  private rufo: Rufo;

  constructor() {
    this.rufo = new Rufo();
  }

  public register(ctx: vscode.ExtensionContext, documentSelector: vscode.DocumentSelector) {
    this.rufo.test().then(() => {
      ctx.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(documentSelector, this),
        vscode.languages.registerDocumentRangeFormattingEditProvider(documentSelector, this)
      );
    });
  }

  public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
    const range = document.validateRange(new vscode.Range(0, 0, Infinity, Infinity));
    return this.formatDocument(document, range);
  }

  public provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument, range: vscode.Range,
    options: vscode.FormattingOptions, token: vscode.CancellationToken):
    Thenable<vscode.TextEdit[]> {
    return this.formatDocument(document, range);
  }

  private formatDocument(document: vscode.TextDocument, range: vscode.Range) {
    const fileName = document.fileName ? document.fileName : vscode.workspace.rootPath;
    const input = document.getText(range);
    return this.rufo.format(input, fileName)
      .then(
        result => {
          if(this.shouldRemoveTrailingNewline(document, range, result)) {
            result = result.slice(0, -1);
          }
          return [new vscode.TextEdit(document.validateRange(range), result)];
        },
        err => {
          // will be handled in format
          return [];
        }
      );
  }

  private shouldRemoveTrailingNewline(document: vscode.TextDocument, range: vscode.Range, result: string) {
    return range.end.line !== document.lineCount - 1 && result.slice(-1) === '\n';
  }
}
