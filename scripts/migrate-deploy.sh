#!/usr/bin/env bash
# Run prisma migrate deploy for production.
# Requires DATABASE_URL pointing to Cloud SQL (use Cloud SQL Proxy locally if needed).
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE"
#   # Or with Cloud SQL Proxy: DATABASE_URL="postgresql://user:pass@127.0.0.1:5432/dbname"
#   ./scripts/migrate-deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is required."
  exit 1
fi

cd "$ROOT_DIR"
npx prisma migrate deploy

echo "Migrations applied successfully."
