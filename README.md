# Multi-Git Manager

Multi-Git Manager is a powerful Visual Studio Code extension designed to streamline your workflow when working with multiple Git repositories within a single workspace.

![Multi-Git Manager](images/multi-git-manager-preview.gif)

## Features

- **Repository Overview**: Get a quick glance at all Git repositories in your workspace.
- **Bulk Operations**: Perform Git operations (pull, push, fetch) on multiple repositories simultaneously.
- **Status Monitoring**: Real-time status updates for all your repositories.
- **Branch Management**: Easy switching and creation of branches across multiple repositories.
- **Conflict Resolution**: Quickly identify and resolve merge conflicts across repositories.
- **Customizable Actions**: Define custom Git commands to run on multiple repositories.

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install YourPublisherName.multi-git-manager` and press Enter

Or install through the VSCode Marketplace: [Multi-Git Manager](https://marketplace.visualstudio.com/items?itemName=ElanZhou.vscode-multi-git-manager&ssr=false#overview)

## Usage

1. Open a workspace containing multiple Git repositories.
2. Click on the Multi-Git Manager icon in the Activity Bar.
3. You'll see a list of all Git repositories in your workspace.
4. Use the toolbar actions to perform bulk operations or click on individual repositories for specific actions.

### Basic Commands

- **Refresh**: Update the status of all repositories
- **Pull All**: Pull changes for all repositories
- **Push All**: Push committed changes for all repositories
- **Fetch All**: Fetch updates for all repositories

## Configuration

You can customize Multi-Git Manager through VS Code settings. Here are some available options:

```json
{
  "multiGitManager.autoRefresh": true,
  "multiGitManager.refreshInterval": 300,
  "multiGitManager.showNotifications": true
}
```

## Known Issues

Please refer to our issue tracker for any known issues and to report new ones.

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Enjoy managing multiple Git repositories with ease!** If you find Multi-Git Manager helpful, please consider leaving a review on the VS Code Marketplace.
