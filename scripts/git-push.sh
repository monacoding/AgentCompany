#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Not a git repository" >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  git remote add "$REMOTE" "https://github.com/monacoding/AgentCompany.git"
fi

git add -A

if git diff --cached --quiet; then
  echo "No changes to commit"
else
  git commit -m "$(cat <<EOF
release: v${VERSION}

버전 ${VERSION} 변경사항 GitHub 백업.
EOF
)"
fi

git push -u "$REMOTE" "$BRANCH"
echo "Pushed v${VERSION} to https://github.com/monacoding/AgentCompany"
