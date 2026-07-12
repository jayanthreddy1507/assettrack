/**
 * Prisma Client Singleton — Prisma 7 / Next.js 15
 *
 * Prisma 7 requires a driver adapter for all client connections.
 * We use @prisma/adapter-pg which connects through the `pg` (node-postgres) driver.
 *
 * Next.js hot-reload creates new module instances in development. Storing the
 * client on `globalThis` prevents a new DB connection pool on every file save.
 *
 * Usage in API routes and server components:
 *   import { prisma } from '@/lib/prisma'
 *   const assets = await prisma.asset.findMany({ where: { deletedAt: null } })
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
