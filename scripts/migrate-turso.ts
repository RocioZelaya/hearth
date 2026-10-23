/**
 * Applies prisma/migrations/* to a Turso database, in order, once each.
 *
 * Prisma's own `migrate deploy` can't talk to Turso in this setup, so this
 * script does the one thing we need: run each migration.sql over libsql and
 * remember which ones ran in a `_hearth_migrations` table.
 *
 *   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… npm run db:migrate:turso
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.turso" });
loadEnv();
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("TURSO_DATABASE_URL is not set.");

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const migrationsDir = path.resolve(__dirname, "..", "prisma", "migrations");

async function main() {
  await client.execute(
    "CREATE TABLE IF NOT EXISTS _hearth_migrations (name TEXT PRIMARY KEY, appliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  const applied = new Set((await client.execute("SELECT name FROM _hearth_migrations")).rows.map((r) => String(r.name)));

  const pending = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !applied.has(d.name))
    .map((d) => d.name)
    .sort();

  for (const name of pending) {
    const sql = readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8");
    // One batch = one transaction: either the whole migration lands and is recorded, or nothing does.
    const statements = splitStatements(sql).map((s) => ({ sql: s, args: [] }));
    await client.batch(
      [...statements, { sql: "INSERT INTO _hearth_migrations (name) VALUES (?)", args: [name] }],
      "write",
    );
    console.log(`applied ${name}`);
  }
  console.log(pending.length ? `${pending.length} migration(s) applied.` : "turso is up to date.");
}

/** Prisma's SQLite migrations are plain statements ending in `;` with `--` comments; no triggers or string literals containing `;`. */
function splitStatements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
