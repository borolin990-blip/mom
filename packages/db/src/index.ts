import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In development, Next.js / tsx hot-reload would otherwise create a new
 * PrismaClient (and a new connection pool) on every reload. We cache it on
 * globalThis to avoid exhausting database connections.
 *
 * This package is the ONLY place the ORM is instantiated. Application code
 * imports `prisma` from here; it never imports @prisma/client directly.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export generated types & enums so callers get everything from @mom/db.
export * from "@prisma/client";
