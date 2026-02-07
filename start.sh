#!/usr/bin/env bash
# Run this in your terminal from the project folder to start the app on your machine.
set -e
cd "$(dirname "$0")"

# Start Homebrew Postgres if installed (ignore errors if not)
brew services start postgresql@16 2>/dev/null || true
brew services start postgresql 2>/dev/null || true

echo "Waiting for Postgres..."
sleep 2

echo "Applying database schema..."
npm run db:push || { echo "DB push failed. Is Postgres running? Try: brew services start postgresql@16"; exit 1; }

echo "Starting dev server at http://localhost:5001"
exec npm run dev
