const { prisma } = require('./lib/db');

async function check() {
    console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
}

check().catch(console.error);
