#!/usr/bin/env bash
set -euo pipefail
cd /home/ubuntu/awesome-openclaw-skills
if [ ! -d .git ]; then
  echo "Not a git repo: /home/ubuntu/awesome-openclaw-skills" >&2
  exit 1
fi
git fetch origin --prune
git pull --ff-only
