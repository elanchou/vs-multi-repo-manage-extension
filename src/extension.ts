import * as vscode from 'vscode';
import { MultiGitManagerProvider } from './multiGitManagerProvider';

export function activate(context: vscode.ExtensionContext) {
    const multiGitManagerProvider = new MultiGitManagerProvider(vscode.workspace.workspaceFolders);
    vscode.window.registerTreeDataProvider('multiGitManagerView', multiGitManagerProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('multiGitManager.refreshView', () => multiGitManagerProvider.refresh()),
        vscode.commands.registerCommand('multiGitManager.checkoutAll', () => multiGitManagerProvider.checkoutAll())
    );
}

export function deactivate() {}