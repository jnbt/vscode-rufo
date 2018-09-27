import * as assert from 'assert';
import * as vscode from 'vscode';
import Rufo from "../formatter/rufo";

suite("Rufo Tests", () => {
  const FIXTURE = `class  NeedsChanges
  def a_method( with_bizarre_formatting)
  end
end`;
  const CORRECT = `class NeedsChanges
  def a_method(with_bizarre_formatting)
  end
end
`;
  const PARTIALLY = `class  NeedsChanges
def a_method(with_bizarre_formatting)
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
    rufo.format("echo  'a'", undefined).then((result) => {
      assert.equal('echo "a"\n', result);
      done();
    });
  });

  test("formats whole documents", () => {
    const time = "formatDocument";
    let document: vscode.TextDocument;
    return vscode.workspace.openTextDocument({language: "ruby", content: FIXTURE})
      .then((doc) => {
        document = doc;
        return vscode.window.showTextDocument(doc);
      })
      .then(() => wait(200)) // we need to wait a little bit until rufo is loaded
      .then(() => console.time(time))
      .then(() => vscode.commands.executeCommand("editor.action.formatDocument"))
      .then(() => {
        console.timeEnd(time);
        assert.equal(CORRECT, document.getText());
      })
      .then(() => vscode.commands.executeCommand("workbench.action.closeActiveEditor"));
  });

  test("formats text selection", () => {
    const time = "formatSelection";
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
        return wait(200);
      })
      .then(() => console.time(time))
      .then(() => {
        const selection = new vscode.Selection(1, 0, 2, 5);
        textEdit.selection = selection;
        return vscode.commands.executeCommand("editor.action.formatSelection");
      })
      .then(() => {
        console.timeEnd(time);
        assert.equal(PARTIALLY, document.getText());
      })
      .then(() => vscode.commands.executeCommand("workbench.action.closeActiveEditor"));
  });
});
