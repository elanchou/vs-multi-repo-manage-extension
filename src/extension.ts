import * as vscode from 'vscode';
import * as fpath from 'path';

class Repository extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly branch: string,
        public readonly path: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.branch})`;
        this.description = this.branch;
    }

    iconPath = {
        light: fpath.join(__filename, '..', '..', 'resources', 'light', 'repo.svg'),
        dark: fpath.join(__filename, '..', '..', 'resources', 'dark', 'repo.svg')
    };
}

class RepositoryProvider implements vscode.TreeDataProvider<Repository> {
    private _onDidChangeTreeData: vscode.EventEmitter<Repository | undefined | null | void> = new vscode.EventEmitter<Repository | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Repository | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Repository): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: Repository): Promise<Repository[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No repositories in empty workspace');
            return Promise.resolve([]);
        }

        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension.getAPI(1);

        const repositories = git.repositories;
        return repositories.map((repo: any) => {
          const repoPath: string = repo.rootUri.fsPath;
          const repoName: string = fpath.basename(repoPath);
          return new Repository(repoName, vscode.TreeItemCollapsibleState.None, repo.state.HEAD?.name || 'No Branch', repoPath);
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Workspace Manager is now active!');

    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    const repositoryProvider = new RepositoryProvider(workspaceRoot || '');
    vscode.window.registerTreeDataProvider('gitWorkspaceRepositories', repositoryProvider);

    let openPanelDisposable = vscode.commands.registerCommand('git-workspace-manager.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'gitWorkspaceManager',
            'Git Workspace Manager',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'checkout':
                        await checkoutBranch(message.branch);
                        break;
                    case 'fetch':
                        await fetchAll();
                        break;
                    case 'pull':
                        await pullAll();
                        break;
                    case 'push':
                        await pushAll();
                        break;
                }
                repositoryProvider.refresh();
            },
            undefined,
            context.subscriptions
        );
    });

    let refreshDisposable = vscode.commands.registerCommand('git-workspace-manager.refreshRepositories', () => {
        repositoryProvider.refresh();
        vscode.window.showInformationMessage('Git repositories refreshed');
    });

    let checkoutDisposable = vscode.commands.registerCommand('git-workspace-manager.checkoutBranch', async () => {
        const branch = await vscode.window.showInputBox({ prompt: 'Enter branch name to checkout' });
        if (branch) {
            await checkoutBranch(branch);
            repositoryProvider.refresh();
        }
    });

    let fetchDisposable = vscode.commands.registerCommand('git-workspace-manager.fetchAll', async () => {
        await fetchAll();
        repositoryProvider.refresh();
    });

    let pullDisposable = vscode.commands.registerCommand('git-workspace-manager.pullAll', async () => {
        await pullAll();
        repositoryProvider.refresh();
    });

    let pushDisposable = vscode.commands.registerCommand('git-workspace-manager.pushAll', async () => {
        await pushAll();
        repositoryProvider.refresh();
    });

    context.subscriptions.push(
        openPanelDisposable,
        refreshDisposable,
        checkoutDisposable,
        fetchDisposable,
        pullDisposable,
        pushDisposable
    );
}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Git Workspace Manager</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
            }
            .container {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .card {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 5px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .input-group {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            input {
                flex-grow: 1;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                padding: 5px 10px;
                border-radius: 3px;
            }
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .button-group {
                display: flex;
                gap: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <h2>Branch Operations</h2>
                <div class="input-group">
                    <input type="text" id="branchName" placeholder="Enter branch name">
                    <button onclick="checkout()">Checkout</button>
                </div>
                <div class="button-group">
                    <button onclick="fetch()">Fetch All</button>
                    <button onclick="pull()">Pull All</button>
                    <button onclick="push()">Push All</button>
                </div>
            </div>
        </div>
        <script>
            const vscode = acquireVsCodeApi();

            function checkout() {
                const branch = document.getElementById('branchName').value;
                vscode.postMessage({ command: 'checkout', branch: branch });
            }

            function fetch() {
                vscode.postMessage({ command: 'fetch' });
            }

            function pull() {
                vscode.postMessage({ command: 'pull' });
            }

            function push() {
                vscode.postMessage({ command: 'push' });
            }
        </script>
    </body>
    </html>`;
}

async function checkoutBranch(branch: string) {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension.getAPI(1);

    for (const repo of git.repositories) {
        try {
            await repo.checkout(branch);
            vscode.window.showInformationMessage(`Checked out ${branch} in ${repo.rootUri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to checkout ${branch} in ${repo.rootUri.fsPath}: ${(error as Error).message}`);
        }
    }
}

async function fetchAll() {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension.getAPI(1);

    for (const repo of git.repositories) {
        try {
            await repo.fetch();
            vscode.window.showInformationMessage(`Fetched in ${repo.rootUri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch in ${repo.rootUri.fsPath}: ${(error as Error).message}`);
        }
    }
}

async function pullAll() {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension.getAPI(1);

    for (const repo of git.repositories) {
        try {
            await repo.pull();
            vscode.window.showInformationMessage(`Pulled in ${repo.rootUri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to pull in ${repo.rootUri.fsPath}: ${(error as Error).message}`);
        }
    }
}

async function pushAll() {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension.getAPI(1);

    for (const repo of git.repositories) {
        try {
            await repo.push();
            vscode.window.showInformationMessage(`Pushed in ${repo.rootUri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to push in ${repo.rootUri.fsPath}: ${(error as Error).message}`);
        }
    }
}