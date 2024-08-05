"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fpath = __importStar(require("path"));
class Repository extends vscode.TreeItem {
    constructor(label, collapsibleState, branch, path) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.branch = branch;
        this.path = path;
        this.iconPath = {
            light: fpath.join(__filename, '..', '..', 'resources', 'light', 'repo.svg'),
            dark: fpath.join(__filename, '..', '..', 'resources', 'dark', 'repo.svg')
        };
        this.tooltip = `${this.label} (${this.branch})`;
        this.description = this.branch;
    }
}
class RepositoryProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.workspaceRoot) {
                vscode.window.showInformationMessage('No repositories in empty workspace');
                return Promise.resolve([]);
            }
            const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
            const git = gitExtension.getAPI(1);
            const repositories = git.repositories;
            return repositories.map((repo) => {
                var _a;
                const repoPath = repo.rootUri.fsPath;
                const repoName = fpath.basename(repoPath);
                return new Repository(repoName, vscode.TreeItemCollapsibleState.None, ((_a = repo.state.HEAD) === null || _a === void 0 ? void 0 : _a.name) || 'No Branch', repoPath);
            });
        });
    }
}
function activate(context) {
    console.log('Git Workspace Manager is now active!');
    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    const repositoryProvider = new RepositoryProvider(workspaceRoot || '');
    vscode.window.registerTreeDataProvider('gitWorkspaceRepositories', repositoryProvider);
    let openPanelDisposable = vscode.commands.registerCommand('git-workspace-manager.openPanel', () => {
        const panel = vscode.window.createWebviewPanel('gitWorkspaceManager', 'Git Workspace Manager', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case 'checkout':
                    yield checkoutBranch(message.branch);
                    break;
                case 'fetch':
                    yield fetchAll();
                    break;
                case 'pull':
                    yield pullAll();
                    break;
                case 'push':
                    yield pushAll();
                    break;
            }
            repositoryProvider.refresh();
        }), undefined, context.subscriptions);
    });
    let refreshDisposable = vscode.commands.registerCommand('git-workspace-manager.refreshRepositories', () => {
        repositoryProvider.refresh();
        vscode.window.showInformationMessage('Git repositories refreshed');
    });
    let checkoutDisposable = vscode.commands.registerCommand('git-workspace-manager.checkoutBranch', () => __awaiter(this, void 0, void 0, function* () {
        const branch = yield vscode.window.showInputBox({ prompt: 'Enter branch name to checkout' });
        if (branch) {
            yield checkoutBranch(branch);
            repositoryProvider.refresh();
        }
    }));
    let fetchDisposable = vscode.commands.registerCommand('git-workspace-manager.fetchAll', () => __awaiter(this, void 0, void 0, function* () {
        yield fetchAll();
        repositoryProvider.refresh();
    }));
    let pullDisposable = vscode.commands.registerCommand('git-workspace-manager.pullAll', () => __awaiter(this, void 0, void 0, function* () {
        yield pullAll();
        repositoryProvider.refresh();
    }));
    let pushDisposable = vscode.commands.registerCommand('git-workspace-manager.pushAll', () => __awaiter(this, void 0, void 0, function* () {
        yield pushAll();
        repositoryProvider.refresh();
    }));
    context.subscriptions.push(openPanelDisposable, refreshDisposable, checkoutDisposable, fetchDisposable, pullDisposable, pushDisposable);
}
exports.activate = activate;
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
function checkoutBranch(branch) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
        const git = gitExtension.getAPI(1);
        for (const repo of git.repositories) {
            try {
                yield repo.checkout(branch);
                vscode.window.showInformationMessage(`Checked out ${branch} in ${repo.rootUri.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to checkout ${branch} in ${repo.rootUri.fsPath}: ${error.message}`);
            }
        }
    });
}
function fetchAll() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
        const git = gitExtension.getAPI(1);
        for (const repo of git.repositories) {
            try {
                yield repo.fetch();
                vscode.window.showInformationMessage(`Fetched in ${repo.rootUri.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to fetch in ${repo.rootUri.fsPath}: ${error.message}`);
            }
        }
    });
}
function pullAll() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
        const git = gitExtension.getAPI(1);
        for (const repo of git.repositories) {
            try {
                yield repo.pull();
                vscode.window.showInformationMessage(`Pulled in ${repo.rootUri.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to pull in ${repo.rootUri.fsPath}: ${error.message}`);
            }
        }
    });
}
function pushAll() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
        const git = gitExtension.getAPI(1);
        for (const repo of git.repositories) {
            try {
                yield repo.push();
                vscode.window.showInformationMessage(`Pushed in ${repo.rootUri.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to push in ${repo.rootUri.fsPath}: ${error.message}`);
            }
        }
    });
}
//# sourceMappingURL=extension.js.map