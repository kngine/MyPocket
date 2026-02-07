#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Starting Postgres (Docker)..."
docker run -d --name mypocket-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -v mypocket-db-data:/var/lib/postgresql/data postgres:16 2>/dev/null || docker start mypocket-db

echo "Waiting for Postgres..."
sleep 4

echo "Creating tables..."
npm run db:push

echo "Starting app..."
npm run dev
