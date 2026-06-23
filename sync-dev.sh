#!/bin/bash
# sync-dev.sh — Sync feature branch with remote develop
# Run before generating code or making a commit to avoid conflicts with collaborators.

set -e

CURRENT_BRANCH=$(git branch --show-current)
echo "🔄 [sync-dev] Current branch: $CURRENT_BRANCH"

echo "📡 Fetching origin/develop..."
git fetch origin develop

AHEAD=$(git log --oneline HEAD..origin/develop | wc -l)
if [ "$AHEAD" -eq "0" ]; then
  echo "✅ Already up to date with origin/develop."
else
  echo "⬇️  Merging $AHEAD new commit(s) from origin/develop..."
  git merge origin/develop --no-edit
  echo "✅ Merge complete."
fi

echo "🏁 [sync-dev] Done. Branch '$CURRENT_BRANCH' is synced."
