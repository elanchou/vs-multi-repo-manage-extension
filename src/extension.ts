import * as vscode from 'vscode';
import { MultiGitManagerProvider } from './multiGitManagerProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating Multi-Git Manager');
    const multiGitManagerProvider = new MultiGitManagerProvider(vscode.workspace.workspaceFolders);
    vscode.window.registerTreeDataProvider('multiGitManagerView', multiGitManagerProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('multiGitManager.refreshView', () => {
            console.log('Refreshing view');
            multiGitManagerProvider.refresh();
        }),
        vscode.commands.registerCommand('multiGitManager.checkoutAll', () => {
            console.log('Checking out all repositories');
            multiGitManagerProvider.checkoutAll();
        }),
        vscode.commands.registerCommand('multiGitManager.pullAll', () => {
            console.log('Pulling all repositories');
            multiGitManagerProvider.pullAll();
        }),
        vscode.commands.registerCommand('multiGitManager.fetchAll', () => {
            console.log('Fetching all repositories');
            multiGitManagerProvider.fetchAll();
        }),
        vscode.commands.registerCommand('multiGitManager.pushAll', () => {
            console.log('Pushing all repositories');
            multiGitManagerProvider.pushAll();
        })
    );
}

export function deactivate() {}