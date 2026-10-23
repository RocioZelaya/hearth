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
 * One driver everywhere (libsql, no Rust engine to ship): production talks to
 * Turso through TURSO_DATABASE_URL; locally the same driver opens the SQLite
 * file named by DATABASE_URL. Vercel has no durable disk, so a missing Turso
 * URL there is a configuration error, not a fallback.
 */
function createClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (!tursoUrl && process.env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL must be set on Vercel: the filesystem there does not persist.");
  }
  const adapter = tursoUrl
    ? new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN })
    : new PrismaLibSQL({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

/**
 * A relative `file:` DATABASE_URL is resolved against the prisma/ folder,
 * the same way the Prisma CLI does, so the app and the migrations agree on
 * which SQLite file is "the" database regardless of where the bundle runs.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:")) return url;
  const file = url.slice("file:".length);
  if (path.isAbsolute(file)) return url;
  return `file:${path.resolve(process.cwd(), "prisma", file)}`;
}
