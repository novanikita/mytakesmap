#!/bin/sh
set -e

PORT=3000
LOCKFILE=".next-dev.lock"

cleanup() {
  rm -f "$LOCKFILE"
}
trap cleanup EXIT INT TERM

# Останавливаем всё на порту 3000
if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Stopping process on port $PORT..."
  lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.5
fi

i=0
while lsof -ti:"$PORT" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 10 ]; then
    echo "Error: port $PORT is still in use."
    exit 1
  fi
  sleep 0.5
done

# Не запускаем dev, если идёт build
if [ -f ".next-build.lock" ]; then
  echo "Build in progress. Wait for it to finish."
  exit 1
fi

touch "$LOCKFILE"
rm -rf .next

echo "Starting dev server on http://localhost:$PORT"
exec npx next dev --port "$PORT"
