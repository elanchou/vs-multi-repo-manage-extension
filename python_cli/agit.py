import os
import signal
import subprocess
import argparse
import concurrent.futures
import logging

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
        logging.warning(f"Timeout reached while searching in {base_dir}")
    except Exception as e:
        logging.error(f"Error while accessing {root}: {e}")
    
    return git_repos

def execute_git_command(repo_dir, command, timeout=30):
    """
    Execute a git command in the specified repo directory and print output
    """
    try:
        result = subprocess.run(command, cwd=repo_dir, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout)
        logging.info(f'[agit] - {" ".join(command)} in {repo_dir}:\n{result.stdout}')
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        logging.error(f'[agit] - Error executing command {" ".join(command)} in {repo_dir}: {e.stderr}')
        return False, e.stderr
    except subprocess.TimeoutExpired:
        logging.error(f'[agit] - Timeout executing command {" ".join(command)} in {repo_dir}')
        return False, "Timeout"

def process_repo(repo_dir, args):
    """
    Process a single repository with the given command
    """
    git_command = ['git'] + args.command.split() + args.args
    return repo_dir, execute_git_command(repo_dir, git_command)

def main():
    parser = argparse.ArgumentParser(description='Execute Git commands in multiple repositories')
    parser.add_argument('command', help='Git command to execute (e.g., checkout, pull, push)')
    parser.add_argument('args', nargs='*', help='Arguments for the Git command')
    parser.add_argument('-p', '--parallel', action='store_true', help='Execute commands in parallel')
    parser.add_argument('-v', '--verbose', action='store_true', help='Increase output verbosity')
    parser.add_argument('--exclude', nargs='*', help='Exclude repositories containing these substrings')
    parser.add_argument('--include', nargs='*', help='Only include repositories containing these substrings')
    
    args = parser.parse_args()

    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(levelname)s - %(message)s')

    base_dir = os.getcwd()
    git_repos = find_git_repos(base_dir)

    if args.exclude:
        git_repos = [repo for repo in git_repos if not any(excl in repo for excl in args.exclude)]
    if args.include:
        git_repos = [repo for repo in git_repos if any(incl in repo for incl in args.include)]

    if args.parallel:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(process_repo, repo, args) for repo in git_repos]
            for future in concurrent.futures.as_completed(futures):
                repo, (success, output) = future.result()
                if success:
                    print(f"Successfully processed {repo}")
                else:
                    print(f"Failed to process {repo}: {output}")
    else:
        for repo in git_repos:
            _, (success, output) = process_repo(repo, args)
            if success:
                print(f"Successfully processed {repo}")
            else:
                print(f"Failed to process {repo}: {output}")

if __name__ == '__main__':
    main()