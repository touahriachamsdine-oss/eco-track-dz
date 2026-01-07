import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function test() {
    try {
        const bins = await prisma.bin.findMany();
        console.log('Bins:', bins);
    } catch (e) {
        console.dir(e, { depth: null });
    } finally {
        await prisma.$disconnect();
    }
}
test();
