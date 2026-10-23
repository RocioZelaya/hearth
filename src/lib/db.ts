import path from "node:path";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

// One client per process. In dev, Next reloads modules; keep it on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Production (Vercel) has no durable filesystem, so the notes live in Turso,
 * a hosted SQLite reached through the libsql driver adapter. Locally, with no
 * TURSO_DATABASE_URL, the built-in engine opens the SQLite file directly.
 */
function createClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    return new PrismaClient({ adapter });
  }
  if (process.env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL must be set on Vercel: the filesystem there does not persist.");
  }
  return new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });
}

/**
 * A relative `file:` DATABASE_URL is resolved against the prisma/ folder,
 * the same way the Prisma CLI does, so the app and the migrations agree on
 * which SQLite file is "the" database regardless of where the bundle runs.
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return url;
  const file = url.slice("file:".length);
  if (path.isAbsolute(file)) return url;
  return `file:${path.resolve(process.cwd(), "prisma", file)}`;
}
