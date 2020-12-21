import * as assert from 'assert';
import * as vscode from 'vscode';
import Rufo from '../../formatter/rufo';

suite("Rufo Tests", () => {
  const FIXTURE = `class  NeedsChanges
  def a_method( with_bizarre_formatting)
    non_latin='你好'
  end
end`;
  const CORRECT = `class NeedsChanges
  def a_method(with_bizarre_formatting)
    non_latin = "你好"
  end
end
`;
  const PARTIALLY = `class  NeedsChanges
def a_method(with_bizarre_formatting)
  non_latin = "你好"
end
end`;
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  test("test detects rufo", (done) => {
    const rufo = new Rufo();
    rufo.test().then(() => {
      done();
    });
  });

  test("formats text via rufo", (done) => {
    const rufo = new Rufo();
    rufo.format("echo  'a'", undefined).then((result: any) => {
      assert.strictEqual(result, 'echo "a"\n');
      done();
    });
  });

  test("formats whole documents", () => {
    let document: vscode.TextDocument;
    return vscode.workspace.openTextDocument({language: "ruby", content: FIXTURE})
      .then((doc) => {
        document = doc;
        return vscode.window.showTextDocument(doc);
      })
      .then(() => wait(1500)) // we need to wait a little bit until rufo is loaded
      .then(() => vscode.commands.executeCommand("editor.action.formatDocument"))
      .then(() => wait(500)) // wait until rufo executed
      .then(() => {
        assert.strictEqual(document.getText(), CORRECT);
      });
  }).timeout(20000);

  test("formats text selection", () => {
    let document: vscode.TextDocument;
    let textEdit: vscode.TextEditor;
    return vscode.workspace.openTextDocument({language: "ruby", content: FIXTURE})
      .then((doc) => {
        document = doc;
        return vscode.window.showTextDocument(doc);
      })
      .then((text) => {
        textEdit = text;
        // we need to wait a little bit until rufo is loaded
        return wait(1000);
      })
      .then(() => {
        const selection = new vscode.Selection(1, 0, 3, 5);
        textEdit.selection = selection;
        return vscode.commands.executeCommand("editor.action.formatSelection");
      })
      .then(() => wait(500)) // wait until rufo executed
      .then(() => {
        assert.strictEqual(document.getText(), PARTIALLY);
      });
  });
});
