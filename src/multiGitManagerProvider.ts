import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class MultiGitManagerProvider implements vscode.TreeDataProvider<RepoItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RepoItem | undefined | null | void> = new vscode.EventEmitter<RepoItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RepoItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RepoItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: RepoItem): Promise<RepoItem[]> {
        if (!this.workspaceFolders) {
            return Promise.resolve([]);
        }

        if (element) {
            // If element is provided, we're getting children of a specific repo
            return this.getBranchesForRepo(element.repoPath);
        } else {
            // If no element, we're getting the root items (repos)
            return this.getRepos();
        }
    }

    private async getRepos(): Promise<RepoItem[]> {
        const repos: RepoItem[] = [];

        for (const folder of this.workspaceFolders!) {
            const repoPath = folder.uri.fsPath;
            if (fs.existsSync(path.join(repoPath, '.git'))) {
                const currentBranch = await this.getCurrentBranch(repoPath);
                repos.push(new RepoItem(
                    path.basename(repoPath),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    repoPath,
                    currentBranch
                ));
            }
        }

        return repos;
    }

    private async getBranchesForRepo(repoPath: string): Promise<RepoItem[]> {
        const { stdout } = await execAsync('git branch', { cwd: repoPath });
        const branches = stdout.split('\n').filter(Boolean).map(b => b.trim().replace('* ', ''));
        return branches.map(b => new RepoItem(b, vscode.TreeItemCollapsibleState.None, repoPath, b));
    }

    private async getCurrentBranch(repoPath: string): Promise<string> {
        const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
        return stdout.trim();
    }

    async checkoutAll(): Promise<void> {
        const branchName = await vscode.window.showInputBox({
            placeHolder: 'Enter branch name to checkout in all repositories',
            prompt: 'Leave empty to cancel'
        });

        if (!branchName) {
            return;
        }

        for (const folder of this.workspaceFolders!) {
            const repoPath = folder.uri.fsPath;
            if (fs.existsSync(path.join(repoPath, '.git'))) {
                try {
                    await execAsync(`git checkout ${branchName}`, { cwd: repoPath });
                    vscode.window.showInformationMessage(`Checked out ${branchName} in ${path.basename(repoPath)}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to checkout ${branchName} in ${path.basename(repoPath)}: ${error}`);
                }
            }
        }

        this.refresh();
    }
}

class RepoItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly repoPath: string,
        public readonly currentBranch: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.currentBranch})`;
        this.description = this.currentBranch;
        this.iconPath = new vscode.ThemeIcon('repo');
    }

    contextValue = 'repository';
}