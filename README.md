# MyPocket

A read-it-later app inspired by Pocket: save articles, manage a reading list, and mark items as read.

## Quick start (run on your machine)

**In your Mac terminal**, from the project folder:

```bash
cd /Users/jkuang/Downloads/MyPocket
./start.sh
```

Then open **http://localhost:5001** in your browser.

- If you use **Homebrew Postgres**: `start.sh` will try to start it and then run the app. If `.env` fails to connect, set `DATABASE_URL=postgresql://$(whoami)@localhost:5432/postgres` (no password).
- If you use **Docker**: run `npm run db:docker` once, then `npm run db:push` and `npm run dev`.

---

## Run locally (full steps)

### 1. Install dependencies

```bash
npm install
```

### 2. PostgreSQL

You need a running PostgreSQL database. Options:

- **Docker** (recommended):
  ```bash
  npm run db:docker
  ```
  or: `docker run -d --name mypocket-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`

- Or use an existing local/remote Postgres instance.

### 3. Environment

A `.env` file is already present with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres`. To recreate it:

```bash
cp .env.example .env
```

Edit `.env` if your Postgres user, password, or port differ.

### 4. Create database tables

```bash
npm run db:push
```

### 5. Start the app

```bash
npm run dev
```

Then open **http://localhost:5001** in your browser.

---

## Deploy to Netlify (standalone)

Deploy this repo to Netlify for a **fully working standalone app**: no database, data in the browser (localStorage). **Content extraction** runs via a Netlify serverless function (`netlify/functions/extract-content.ts`), so pasting a URL can auto-fill title, description, and content. Connect the repo; build uses `npm run build:client`, publish `dist/public`, functions from `netlify/functions`. No env vars required. Optional: set `VITE_API_URL` to use your own server instead.

---

**Optional:** To enable AI-powered content extraction when adding articles by URL, set `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` in `.env`. Without them, you can still add articles by entering title, description, and content manually.
