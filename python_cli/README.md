
## Agit Client Usage

Agit cli tool is a terminal cli to manage multi git repos with one command.

Enjoy!

```
usage: agit [-h] [-p] [-v] [--exclude [EXCLUDE ...]] [--include [INCLUDE ...]] [--repos [REPOS ...]] command [args ...]

Execute Git commands in multiple repositories

positional arguments:
  command               Git command to execute (e.g., checkout, pull, push)
  args                  Arguments for the Git command

options:
  -h, --help            show this help message and exit
  -p, --parallel        Execute commands in parallel
  -v, --verbose         Increase output verbosity
  --exclude [EXCLUDE ...]
                        Exclude repositories containing these substrings
  --include [INCLUDE ...]
                        Only include repositories containing these substrings
  --repos [REPOS ...]   Specify paths to Git repositories directly
  ```