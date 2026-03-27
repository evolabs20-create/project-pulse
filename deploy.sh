#!/bin/bash
# Rebuild and deploy to GitHub Pages
cd "$(dirname "$0")"
npx vite build
cd dist
git add -A
git commit -m "Sync: $(date '+%Y-%m-%d %H:%M')" || true
git push origin gh-pages --force
echo "✅ Deployed to https://evolabs20-create.github.io/project-pulse/"
