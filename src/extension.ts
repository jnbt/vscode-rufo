import * as vscode from 'vscode';
import registerFormatter from './formatter';

const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
  { language: 'ruby', scheme: 'file' },
  { language: 'ruby', scheme: 'untitled' },
];

export function activate(context: vscode.ExtensionContext) {
  // register Rufo-based formatter
  registerFormatter(context, DOCUMENT_SELECTOR);
}

export function deactivate() {
  // nothing yet
}
