import path from "path";
import { exec } from "child_process";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
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
          // if (err || stderr) {
          //   vscode.window.showErrorMessage(
          //     `Failed to run git blame: ${stderr || err.message}`
          //   );
          // }

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

          const pickedAuthor = picked;
          vscode.window.showInformationMessage("Showing changes made by author: " + pickedAuthor.label);

		     const decorations: vscode.DecorationOptions[] = [];

		     vscode.window.showInformationMessage("That shit didnt work 1");


          stdout.split("\n").forEach((line, idx) => {
            // Check each line of git blame output
            const match = line.match(/\(([^)]+)\s+\d{4}-\d{2}-\d{2}/); // Grabs the name inside parentheses before the date
            if (match) {
              const author = match[1].trim(); // Extract the author name
          
              vscode.window.showInformationMessage(`Matched author: ${author}`);
          
              if (author.toLowerCase().includes(pickedAuthor.label.toLowerCase())) {
                const range = new vscode.Range(idx, 0, idx, 1000); // Create range for highlighting
                decorations.push({ range });
              }
            } else {
              vscode.window.showInformationMessage("No match found");
            }
          });

          const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: "rgba(255,255,0,0.3)",
          });

           editor.setDecorations(decorationType, decorations);
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}
