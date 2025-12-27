#!/usr/bin/env bash
set -e

# Load environment variables from .env file
if [ -f ".env" ]; then
  set -a; source ".env"; set +a
fi

# Export Drizzle schema to /tmp/schema.sql
echo "Exporting schema to /tmp/schema.sql..."
bun drizzle-kit export > /tmp/schema.sql

# For local dev, use the database file directly instead of the HTTP endpoint
# Atlas doesn't support HTTP-only libSQL connections well
DB_FILE="./database.db"

# Run atlas schema diff using the temp schema file
echo "Running atlas schema diff..."
atlas schema diff \
  --from "sqlite://${DB_FILE}" \
  --to file:///tmp/schema.sql \
  --dev-url "sqlite://file?mode=memory" \
  --format '{{ sql . "  " }}'
