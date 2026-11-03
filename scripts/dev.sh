#!/usr/bin/env bash
# Run the site tooling in Podman, so Node does not need to be installed locally.
#
#   scripts/dev.sh install     npm ci (creates node_modules/)
#   scripts/dev.sh dev         dev server with hot reload   -> http://localhost:5173
#   scripts/dev.sh build       production build into site/.vitepress/dist
#   scripts/dev.sh serve       build, then serve dist in a named container -> http://localhost:4173
#   scripts/dev.sh stop        stop the review container
#   scripts/dev.sh linkcheck   check every link in the built site with lychee
#
# Set ENGINE=docker to use Docker instead of Podman.
set -euo pipefail

cd "$(dirname "$0")/.."

ENGINE="${ENGINE:-podman}"
NODE_IMAGE="docker.io/library/node:22.23.4-alpine"
LYCHEE_IMAGE="docker.io/lycheeverse/lychee:0.24.2"
CONTAINER="timothestoifl24-site"

node_run() {
  "$ENGINE" run --rm -v "$PWD":/app:Z -w /app "$@"
}

ensure_deps() {
  [ -d node_modules ] || node_run "$NODE_IMAGE" npm ci --no-audit --no-fund
}

case "${1:-}" in
  install)
    node_run "$NODE_IMAGE" npm ci --no-audit --no-fund
    ;;
  dev)
    ensure_deps
    node_run -it -p 5173:5173 "$NODE_IMAGE" npx vitepress dev site --host 0.0.0.0 --port 5173
    ;;
  build)
    ensure_deps
    node_run "$NODE_IMAGE" npm run build
    ;;
  serve)
    ensure_deps
    node_run "$NODE_IMAGE" npm run build
    "$ENGINE" rm -f "$CONTAINER" >/dev/null 2>&1 || true
    "$ENGINE" run -d --name "$CONTAINER" -p 4173:4173 -v "$PWD":/app:Z -w /app \
      "$NODE_IMAGE" npx vitepress preview site --host 0.0.0.0 --port 4173 >/dev/null
    echo "Serving the built site at http://localhost:4173 (container: $CONTAINER)"
    echo "Stop it with: scripts/dev.sh stop"
    ;;
  stop)
    "$ENGINE" rm -f "$CONTAINER" >/dev/null && echo "Stopped $CONTAINER"
    ;;
  linkcheck)
    [ -d site/.vitepress/dist ] || { echo "Run 'scripts/dev.sh build' first." >&2; exit 1; }
    # --fallback-extensions html matches cleanUrls (/projects/x -> x.html, as GitHub Pages does).
    # --root-dir resolves root-relative links (/projects/...) against dist/.
    # LinkedIn answers every automated request with HTTP 999, so it can't be checked.
    # The live domain is excluded because it may not resolve before the first deploy.
    "$ENGINE" run --rm -v "$PWD":/input:Z -w /input "$LYCHEE_IMAGE" \
      --root-dir /input/site/.vitepress/dist \
      --fallback-extensions html \
      --exclude 'linkedin\.com' \
      --exclude '^https://(www\.)?timothestoifl24\.dev' \
      --no-progress \
      'site/.vitepress/dist/**/*.html'
    ;;
  *)
    sed -n '2,12p' "$0"
    exit 1
    ;;
esac
