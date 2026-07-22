#!/usr/bin/env bash
# One-shot: apply migrations after DATABASE_URL is set
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
fi
if [ -z "${DATABASE_URL:-}" ] || [[ "$DATABASE_URL" == file:* ]]; then
  echo "Set DATABASE_URL to a Neon Postgres connection string in .env"
  exit 1
fi
npx prisma migrate deploy
npx prisma generate
echo "Database ready."
