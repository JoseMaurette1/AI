#!/usr/bin/env bash
set -euo pipefail

# Port can be overridden: PORT=4000 ./start.sh
export PORT="${PORT:-3000}"

# Clean install if lockfile exists; otherwise fall back to npm install
if command -v npm >/dev/null 2>&1; then
  npm ci || npm install
else
  echo "npm is required" >&2; exit 1
fi

npm run build
npm start -- -p "$PORT"


