"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const multiGitManagerProvider_1 = require("./multiGitManagerProvider");
function activate(context) {
    console.log('Activating Multi-Git Manager');
    const multiGitManagerProvider = new multiGitManagerProvider_1.MultiGitManagerProvider(vscode.workspace.workspaceFolders);
    vscode.window.registerTreeDataProvider('multiGitManagerView', multiGitManagerProvider);
    context.subscriptions.push(vscode.commands.registerCommand('multiGitManager.refreshView', () => {
        console.log('Refreshing view');
        multiGitManagerProvider.refresh();
    }), vscode.commands.registerCommand('multiGitManager.checkoutAll', () => {
        console.log('Checking out all repositories');
        multiGitManagerProvider.checkoutAll();
    }), vscode.commands.registerCommand('multiGitManager.pullAll', () => {
        console.log('Pulling all repositories');
        multiGitManagerProvider.pullAll();
    }), vscode.commands.registerCommand('multiGitManager.fetchAll', () => {
        console.log('Fetching all repositories');
        multiGitManagerProvider.fetchAll();
    }), vscode.commands.registerCommand('multiGitManager.pushAll', () => {
        console.log('Pushing all repositories');
        multiGitManagerProvider.pushAll();
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map