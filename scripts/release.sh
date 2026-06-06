#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"
INSTALL="${INSTALL_EXTENSION:-1}"
CURSOR_BIN="${CURSOR_BIN:-/Applications/Cursor.app/Contents/Resources/app/bin/cursor}"

echo "==> AgentCompany v${VERSION} release"

echo "==> Building VSIX..."
npm run package

VSIX="releases/agent-company-${VERSION}.vsix"
if [[ ! -f "$VSIX" ]]; then
  echo "ERROR: VSIX not found: $VSIX" >&2
  exit 1
fi

if [[ "$INSTALL" == "1" ]] && [[ -x "$CURSOR_BIN" ]]; then
  echo "==> Installing extension..."
  "$CURSOR_BIN" --install-extension "$VSIX" --force
else
  echo "==> Skipping extension install (INSTALL_EXTENSION=$INSTALL)"
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Not a git repository" >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "==> Adding git remote..."
  git remote add "$REMOTE" "https://github.com/monacoding/AgentCompany.git"
fi

if [[ -f .env ]]; then
  if git check-ignore -q .env 2>/dev/null; then
    :
  else
    echo "WARN: .env is not gitignored — secrets may be committed" >&2
  fi
fi

echo "==> Committing to git..."
git add -A

if git diff --cached --quiet; then
  echo "==> No changes to commit — pushing current branch"
else
  git commit -m "$(cat <<EOF
release: v${VERSION}

버전 ${VERSION} 빌드·패키징 완료.
EOF
)"
fi

echo "==> Pushing to GitHub ($REMOTE/$BRANCH)..."
git push -u "$REMOTE" "$BRANCH"

echo ""
echo "Done: v${VERSION}"
echo "  VSIX : $VSIX"
echo "  Repo : https://github.com/monacoding/AgentCompany"
echo "  Reload Window: Cmd+Shift+P → Developer: Reload Window"
