import os
import signal
import subprocess
import argparse

class TimeoutException(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutException

def find_git_repos(base_dir, timeout=30):
    """
    Recursively find all Git repositories in the given directory with a timeout.
    """
    git_repos = []
    
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)
    
    try:
        for root, dirs, files in os.walk(base_dir):
            if '.git' in dirs:
                git_repos.append(root)
        signal.alarm(0)
    except TimeoutException:
        print(f"Timeout reached while searching in {base_dir}")
    except Exception as e:
        print(f"Error while accessing {root}: {e}")
    
    return git_repos

def execute_git_command(repo_dir, command, timeout=30):
    """
    Execute a git command in the specified repo directory and print output
    """
    try:
        result = subprocess.run(command, cwd=repo_dir, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout)
        print(f'[agit] - {" ".join(command)} in {repo_dir}:\n{result.stdout}')
    except subprocess.CalledProcessError as e:
        print(f'[agit] - Error executing command {" ".join(command)} in {repo_dir}: {e.stderr}')
    except subprocess.TimeoutExpired:
        print(f'[agit] - Timeout executing command {" ".join(command)} in {repo_dir}')

def main():
    parser = argparse.ArgumentParser(description='Execute Git commands in multiple repositories')
    parser.add_argument('command', help='Git command to execute (e.g., checkout, pull, push)')
    parser.add_argument('args', nargs='*', help='Arguments for the Git command')
    
    args = parser.parse_args()

    base_dir = os.getcwd()
    git_repos = find_git_repos(base_dir)

    for repo_dir in git_repos:
        print(f'Processing repo: {repo_dir}')
        git_command = ['git', args.command] + args.args
        execute_git_command(repo_dir, git_command)

if __name__ == '__main__':
    main()