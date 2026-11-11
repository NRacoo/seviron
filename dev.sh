#!/usr/bin/env bash
# Run the Go decision service and the Next.js dashboard together.
set -euo pipefail
cd "$(dirname "$0")"

(cd service && go run ./cmd/server) &
SVC=$!
trap 'kill $SVC 2>/dev/null || true' EXIT

sleep 2
cd web
[ -d node_modules ] || npm install
PERISAI_API="${PERISAI_API:-http://localhost:8088}" npm run dev
