import subprocess
import sys
from datetime import datetime

def check_timezone_invariant():
    """
    Checks all commits in the current Git repository for the +09:00 timezone invariant.
    Returns True if all commits are valid, False otherwise.
    """
    print("Checking author-date timezone invariant (Expected: +09:00)...")
    
    # %ai: author date, ISO 8601-like format (includes offset)
    # %ci: committer date, ISO 8601-like format (includes offset)
    try:
        output = subprocess.check_output(
            ["git", "log", "--all", "--format=%H %ai %ci"],
            encoding="utf-8"
        )
    except subprocess.CalledProcessError as e:
        print(f"Error: Failed to run git log: {e}")
        return False

    invalid_commits = []
    lines = output.strip().split("\n")
    if not lines or (len(lines) == 1 and not lines[0]):
        print("No commits found.")
        return True

    for line in lines:
        parts = line.split()
        if len(parts) < 7:
            continue
        
        commit_hash = parts[0]
        # parts[1]: date, parts[2]: time, parts[3]: offset
        author_offset = parts[3]
        # parts[4]: date, parts[5]: time, parts[6]: offset
        committer_offset = parts[6]

        if author_offset != "+0900" or committer_offset != "+0900":
            invalid_commits.append((commit_hash, author_offset, committer_offset))

    if invalid_commits:
        print(f"\nError: author-date timezone invariant broken in {len(invalid_commits)} commits!")
        for commit_hash, a_off, c_off in invalid_commits[:10]:
            print(f"  {commit_hash}: author={a_off}, committer={c_off}")
        if len(invalid_commits) > 10:
            print(f"  ... and {len(invalid_commits) - 10} more.")
        return False

    print("All commits verified. Timezone invariant (+09:00) holds.")
    return True

if __name__ == "__main__":
    if not check_timezone_invariant():
        sys.exit(1)
    sys.exit(0)
