const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    const rewards = [
        { title: 'Grocer Discount', description: '200 DZD off your next purchase at local partner grocers.', pointsCost: 500, category: 'Groceries' },
        { title: 'Free Transit Pass', description: 'Unlimited bus/metro rides for 24 hours in Algiers.', pointsCost: 800, category: 'Transit' },
        { title: 'Plant a Cedar', description: 'We will plant a cedar tree in your name in the Blida mountains.', pointsCost: 1200, category: 'Eco' },
        { title: 'Artisanal Coffee', description: 'One free cup of traditional coffee at participating cafes.', pointsCost: 300, category: 'Food' },
    ];

    for (const reward of rewards) {
        await prisma.reward.upsert({
            where: { id: reward.title.toLowerCase().replace(/ /g, '-') }, // Using a slug as ID for simplicity in seeding
            update: reward,
            create: {
                id: reward.title.toLowerCase().replace(/ /g, '-'),
                ...reward
            }
        });
    }

    console.log('Seed: Created/Updated rewards');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
