// Prisma Client - PostgreSQL Production Ready
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const createPrismaClient = () => {
    return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
