import { DocumentSelector, ExtensionContext } from 'vscode';
import EditProvider from './edit_provider';

export default function registerFormatter(ctx: ExtensionContext, documentSelector: DocumentSelector) {
  new EditProvider().register(ctx, documentSelector);
}
