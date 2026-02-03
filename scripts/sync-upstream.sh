#!/bin/bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/ubuntu/.local/bin${PATH:+:$PATH}"

REPO_DIR="/home/ubuntu/openclaw"
LOG_FILE="/home/ubuntu/openclaw/logs/openclaw-sync.log"
CODEX_CMD="pnpm dlx @openai/codex@latest exec --yolo"

# Ensure log file exists
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

{
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] sync start"
  cd "$REPO_DIR"

  # Load env if present (for OPENAI_API_KEY, etc.)
  if [ -f "$REPO_DIR/.env" ]; then
    set -a
    . "$REPO_DIR/.env"
    set +a
  fi

  git fetch upstream
  git fetch origin
  git checkout main

  # If dirty, let Codex clean up and commit
  if [ -n "$(git status --porcelain)" ]; then
    echo "Working tree dirty; invoking Codex to resolve and commit"
    script -q -c "$CODEX_CMD \"Repo is dirty. Resolve any conflicts or issues, ensure working tree is clean, commit with message 'chore: sync with upstream', and do not push.\"" /dev/null
  fi

  # Rebase onto upstream/main
  if ! git rebase upstream/main; then
    echo "Rebase failed; invoking Codex to resolve conflicts"
    script -q -c "$CODEX_CMD \"Resolve git rebase conflicts, complete the rebase, ensure working tree is clean, commit any needed fixes (message 'chore: sync with upstream'), and do not push.\"" /dev/null
  fi

  # Force push to origin/main
  git push -f origin main
  echo "sync complete"
} >> "$LOG_FILE" 2>&1
