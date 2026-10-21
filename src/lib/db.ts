import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

// One client per process. In dev, Next reloads modules; keep it on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
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
