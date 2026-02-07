import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env when run by drizzle-kit (avoids dotenv resolution issues in npx context)
if (!process.env.DATABASE_URL && existsSync(resolve(process.cwd(), ".env"))) {
  const env = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
