// Prisma Client Re-cache Trigger - RELOAD COMPLETED: 2026-01-07 12:28
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = global;

const createPrismaClient = () => {
    // The PrismaBetterSqlite3 adapter factory in Prisma 7 expects a config object with 'url'
    const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
    return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();
// export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
