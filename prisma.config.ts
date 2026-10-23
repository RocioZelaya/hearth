import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    // Only the CLI reads this (generate, migrate dev, seed). Production uses Turso via src/lib/db.ts.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
