"use strict";
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
exports.MultiGitManagerProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class MultiGitManagerProvider {
    constructor(workspaceFolders) {
        this.workspaceFolders = workspaceFolders;
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
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.workspaceFolders) {
                return Promise.resolve([]);
            }
            if (element) {
                return this.getBranchesForRepo(element.repoPath);
            }
            else {
                return this.getRepos();
            }
        });
    }
    getRepos() {
        return __awaiter(this, void 0, void 0, function* () {
            const repos = [];
            for (const folder of this.workspaceFolders) {
                const repoPath = folder.uri.fsPath;
                if (fs.existsSync(path.join(repoPath, '.git'))) {
                    const currentBranch = yield this.getCurrentBranch(repoPath);
                    repos.push(new RepoItem(path.basename(repoPath), vscode.TreeItemCollapsibleState.Collapsed, repoPath, currentBranch));
                }
            }
            return repos;
        });
    }
    getBranchesForRepo(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout } = yield execAsync('git branch', { cwd: repoPath });
            const branches = stdout.split('\n').filter(Boolean).map(b => b.trim().replace('* ', ''));
            return branches.map(b => new RepoItem(b, vscode.TreeItemCollapsibleState.None, repoPath, b));
        });
    }
    getCurrentBranch(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout } = yield execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
            return stdout.trim();
        });
    }
    checkoutAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const branchName = yield vscode.window.showInputBox({
                placeHolder: 'Enter branch name to checkout in all repositories',
                prompt: 'Leave empty to cancel'
            });
            if (!branchName) {
                return;
            }
            for (const folder of this.workspaceFolders) {
                const repoPath = folder.uri.fsPath;
                if (fs.existsSync(path.join(repoPath, '.git'))) {
                    try {
                        yield this.checkoutOrCreateBranch(repoPath, branchName);
                        vscode.window.showInformationMessage(`Checked out ${branchName} in ${path.basename(repoPath)}`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to checkout or create ${branchName} in ${path.basename(repoPath)}: ${error}`);
                    }
                }
            }
            this.refresh();
        });
    }
    checkoutOrCreateBranch(repoPath, branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield execAsync(`git checkout ${branchName}`, { cwd: repoPath });
            }
            catch (error) {
                // If checkout fails, try to create and checkout the new branch
                yield execAsync(`git checkout -b ${branchName}`, { cwd: repoPath });
            }
        });
    }
    pullAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeGitCommandForAll('git pull', 'Pulled');
        });
    }
    fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeGitCommandForAll('git fetch', 'Fetched');
        });
    }
    pushAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeGitCommandForAll('git push', 'Pushed');
        });
    }
    executeGitCommandForAll(command, actionName) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const folder of this.workspaceFolders) {
                const repoPath = folder.uri.fsPath;
                if (fs.existsSync(path.join(repoPath, '.git'))) {
                    try {
                        yield execAsync(command, { cwd: repoPath });
                        vscode.window.showInformationMessage(`${actionName} in ${path.basename(repoPath)}`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to ${actionName.toLowerCase()} in ${path.basename(repoPath)}: ${error}`);
                    }
                }
            }
            this.refresh();
        });
    }
}
exports.MultiGitManagerProvider = MultiGitManagerProvider;
class RepoItem extends vscode.TreeItem {
    constructor(label, collapsibleState, repoPath, currentBranch) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.repoPath = repoPath;
        this.currentBranch = currentBranch;
        this.contextValue = 'repository';
        this.tooltip = `${this.label} (${this.currentBranch})`;
        this.description = this.currentBranch;
        this.iconPath = new vscode.ThemeIcon('repo');
    }
}
//# sourceMappingURL=multiGitManagerProvider.js.map