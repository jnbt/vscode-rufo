import * as cp from 'child_process';
import * as vscode from 'vscode';

type RufoOptions = {
  exe: string,
  useBundler: boolean
};

const DEFAULT_OPTIONS: RufoOptions = {
  exe: "rufo",
  useBundler: false
};

export default class Rufo {
  public test(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rufo = this.spawn(['-v']);

      if (rufo.stderr === null) {
        const msg = "Couldn't initialize STDERR";
        console.warn(msg);
        vscode.window.showErrorMessage(msg);
        reject(msg);
        return;
      }

      rufo.on('error', err => {
        console.warn(err);

        if (err.message.includes('ENOENT')) {
          vscode.window.showErrorMessage(`couldn't find ${this.exe} for formatting (ENOENT)`);
        } else {
          vscode.window.showErrorMessage(`couldn't run ${this.exe} '${err.message}'`);
        }
        reject(err);
      });

      rufo.stderr.on('data', data => {
        // for debugging
        console.log(`Rufo stderr ${data}`);
      });

      rufo.on('exit', code => {
        if (code) {
          vscode.window.showErrorMessage(`Rufo failed with exit code: ${code}`);
          return reject();
        }
        resolve();
      });
    });
  }

  public format(data: string, fileName: string | undefined): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = ["-x"]; // Simple exit codes: 1 or 0

      if(fileName) {
        args.push(`--filename=${fileName}`);
      }

      const rufo = this.spawn(args);

      if (rufo.stdin === null || rufo.stdout === null) {
        const msg = "Couldn't initialize STDIN or STDOUT";
        console.warn(msg);
        vscode.window.showErrorMessage(msg);
        reject(msg);
        return;
      }

      let result = '';
      rufo.on('error', err => {
        console.warn(err);
        vscode.window.showErrorMessage(`couldn't run ${this.exe} '${err.message}'`);
        reject(err);
      });
      rufo.stdout.on('data', data => {
        result += data.toString();
      });
      rufo.on('exit', code => {
        if (code) {
          vscode.window.showErrorMessage(`Rufo failed with exit code: ${code}`);
          return reject();
        }
        resolve(result);
      });
      rufo.stdin.write(data);
      rufo.stdin.end();
    });
  }

  private get exe(): string[] {
    const {exe, useBundler} = this.options;
    return useBundler ? [`bundle exec ${exe}`] : [exe];
  }

  private get options(): RufoOptions {
    const config = vscode.workspace.getConfiguration('rufo');
    const opts = Object.assign({}, DEFAULT_OPTIONS, config);
    return opts;
  }

  private spawn = (args: string[], spawnOpt: cp.SpawnOptions = {}): cp.ChildProcess => {
    const exe = this.exe;

    if (!spawnOpt.cwd) {
      spawnOpt.cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }
    const cmd = exe.shift() as string;
    return cp.spawn(cmd, exe.concat(args), spawnOpt);
  };
}
