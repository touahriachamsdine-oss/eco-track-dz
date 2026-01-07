const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object' && prisma[k] !== null));

if (prisma.notification) {
    console.log('SUCCESS: prisma.notification is defined');
} else {
    console.log('FAILURE: prisma.notification is UNDEFINED');
}

prisma.$disconnect();
