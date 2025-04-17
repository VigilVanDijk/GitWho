import path from "path";
import { exec } from "child_process";
import * as vscode from "vscode";


function getRandomPastelColor(): string {
  const hue = Math.floor(Math.random() * 360); 
  const safeHue = (hue >= 45 && hue <= 65) ? (hue + 30) % 360 : hue;

  return `hsl(${safeHue}, 40%, 40%)`;
}

let decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'red', // just a placeholder, is never actually set to red
});

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

  const clearHighlightsCommand = vscode.commands.registerCommand("GitWho.clearHighlights", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    editor.setDecorations(decorationType, []);
    statusBarItem.hide();
  });

  context.subscriptions.push(clearHighlightsCommand);

statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(trash) Clear Highlights";
  statusBarItem.tooltip = "Clear author highlights";
  statusBarItem.command = "GitWho.clearHighlights";
  context.subscriptions.push(statusBarItem);

  const disposable = vscode.commands.registerCommand(
    "GitWho.showAuthorChanges",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;


      const exec = require("child_process").exec;

      const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      function getGitRoot(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
          exec(
            "git rev-parse --show-toplevel",
            { cwd: path.dirname(filePath) },
            (err: any, stdout: string) => {
              if (err) {
                reject(err);
              } else {
                resolve(stdout.trim());
              }
            }
          );
        });
      }

      const filePath = editor.document.uri.fsPath;
      const gitRoot = await getGitRoot(filePath);
      const relativePath = path.relative(gitRoot, filePath);

      exec(
        `git blame -- "${relativePath}"`,
        { cwd: gitRoot },
        async (err: { message: any }, stdout: string, stderr: any) => {
          if (!stdout.trim()) {
            vscode.window.showInformationMessage("git blame returned nothing 🤷‍♂️");
          }  
          if (err || stderr) {
            vscode.window.showErrorMessage(
              `Failed to run git blame: ${stderr || err.message}`
            );
          }

          const authors: vscode.QuickPickItem[] = Array.from(
            new Set(
              stdout
                .split("\n")
                .map((line) => {
                  const match = line.match(/\(([^)]+)\)/);
                  const name = match?.[1]?.trim().split(" ")[0];
                  return name;
                })
                .filter((name): name is string => !!name)
            )
          ).map((name) => ({ label: name }));

          const quickPickItems = authors;

          const picked = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: "Select an author to highlight their changes",
          });

          if (!picked) return;


          editor.setDecorations(decorationType, []);

          const pickedAuthor = picked;

          vscode.window.showInformationMessage("Showing changes made by author: " + pickedAuthor.label)
           

		     const decorations: vscode.DecorationOptions[] = [];

          stdout.split("\n").forEach((line, idx) => {
            // Check each line of git blame output
            const match = line.match(/\(([^)]+)\s+\d{4}-\d{2}-\d{2}/); 
            if (match) {
              const author = match[1].trim(); 
          
              vscode.window.showInformationMessage(`Matched author: ${author}`);
          
              if (author.toLowerCase().includes(pickedAuthor.label.toLowerCase())) {
                const range = new vscode.Range(idx, 0, idx, 1000); // Create range for highlighting
                decorations.push({ range });
              }
            } else {
              vscode.window.showInformationMessage("No match found");
            }
          });

          const bgcolor = getRandomPastelColor();
          decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: bgcolor,
            overviewRulerColor: bgcolor,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            isWholeLine: false
          });
           editor.setDecorations(decorationType, decorations);
          statusBarItem.show();
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  vscode.window.activeTextEditor?.setDecorations(decorationType, []);
}