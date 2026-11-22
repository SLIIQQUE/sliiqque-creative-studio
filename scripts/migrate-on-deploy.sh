#!/bin/sh
# Applies pending database migrations during a Vercel build, before `next build` reads the new tables.
# Uses the direct (unpooled) connection when Vercel provides one. Already-applied migrations are skipped,
# so running this on every deploy is safe. With no database configured (for example a JSON-only build) it does nothing.
set -e
URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
if [ -z "$URL" ]; then
  echo "migrate-on-deploy: no database URL set, skipping migrations"
  exit 0
fi
echo "migrate-on-deploy: applying pending migrations"
DATABASE_URL="$URL" npx drizzle-kit migrate
