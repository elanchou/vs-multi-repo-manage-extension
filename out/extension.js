"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const multiGitManagerProvider_1 = require("./multiGitManagerProvider");
function activate(context) {
    const multiGitManagerProvider = new multiGitManagerProvider_1.MultiGitManagerProvider(vscode.workspace.workspaceFolders);
    vscode.window.registerTreeDataProvider('multiGitManagerView', multiGitManagerProvider);
    context.subscriptions.push(vscode.commands.registerCommand('multiGitManager.refreshView', () => multiGitManagerProvider.refresh()), vscode.commands.registerCommand('multiGitManager.checkoutAll', () => multiGitManagerProvider.checkoutAll()));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map