import os
import argparse
import subprocess

def find_git_repos(base_dir):
    """
    Recursively find all Git repositories in the given directory
    """
    git_repos = []
    for root, dirs, files in os.walk(base_dir):
        if '.git' in dirs:
            git_repos.append(root)
    return git_repos

def execute_git_command(repo_dir, command):
    """
    Execute a git command in the specified repo directory and print output
    """
    try:
        result = subprocess.run(command, cwd=repo_dir, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(f'[agit] - {" ".join(command)} in {repo_dir}:\n{result.stdout}')
    except subprocess.CalledProcessError as e:
        print(f'[agit] - Error executing command {" ".join(command)} in {repo_dir}: {e.stderr}')

def checkout_branch(repo_dir, branch_name):
    """
    Switch to the specified Git branch, creating it if it doesn't exist
    """
    execute_git_command(repo_dir, ['git', 'checkout', branch_name])
    # If checkout fails, create and switch to the branch
    execute_git_command(repo_dir, ['git', 'checkout', '-b', branch_name])

def fetch_branch(repo_dir):
    """
    Fetch the latest changes from the remote
    """
    execute_git_command(repo_dir, ['git', 'fetch'])

def pull_branch(repo_dir):
    """
    Pull the latest changes from the remote branch
    """
    execute_git_command(repo_dir, ['git', 'pull'])

def push_branch(repo_dir):
    """
    Push local changes to the remote branch
    """
    execute_git_command(repo_dir, ['git', 'push'])

def main():
    parser = argparse.ArgumentParser(description='Manage Git branches in multiple repositories')
    parser.add_argument('branch', help='Branch name')
    parser.add_argument('--fetch', action='store_true', help='Fetch latest changes')
    parser.add_argument('--pull', action='store_true', help='Pull latest changes')
    parser.add_argument('--push', action='store_true', help='Push changes to remote')
    
    args = parser.parse_args()

    base_dir = os.getcwd()
    git_repos = find_git_repos(base_dir)

    for repo_dir in git_repos:
        print(f'Processing repo: {repo_dir} on branch: {args.branch}')
        
        if args.fetch:
            fetch_branch(repo_dir)
        
        if args.pull:
            pull_branch(repo_dir)
        
        if args.push:
            push_branch(repo_dir)
        
        checkout_branch(repo_dir, args.branch)

if __name__ == '__main__':
    main()