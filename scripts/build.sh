#!/bin/sh
set -e

PORT=3000
LOCKFILE=".next-build.lock"

cleanup() {
  rm -f "$LOCKFILE"
}
trap cleanup EXIT INT TERM

if [ -f ".next-dev.lock" ]; then
  echo "Dev server is running. Stopping it before build..."
  lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.5
  rm -f .next-dev.lock
fi

if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Stopping process on port $PORT..."
  lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.5
fi

touch "$LOCKFILE"
rm -rf .next

echo "Building..."
exec npx next build
