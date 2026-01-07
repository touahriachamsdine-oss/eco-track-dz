import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Seed Bins
    const bins = [
        { id: 'bin1', location: 'Place des Martyrs', latitude: 36.785, longitude: 3.060, fillLevel: 45, status: 'optimal', type: 'general' },
        { id: 'bin2', location: 'Grande Poste', latitude: 36.775, longitude: 3.058, fillLevel: 85, status: 'critical', type: 'plastic' },
        { id: 'bin3', location: 'Didouche Mourad', latitude: 36.768, longitude: 3.052, fillLevel: 20, status: 'optimal', type: 'paper' },
        { id: 'bin4', location: 'Garden City', latitude: 36.750, longitude: 2.980, fillLevel: 65, status: 'warning', type: 'glass' },
    ];

    for (const bin of bins) {
        await prisma.bin.upsert({
            where: { id: bin.id },
            update: bin,
            create: bin,
        });
    }

    // 2. Seed Tasks
    const tasks = [
        { address: '12 Rue Didouche Mourad', type: 'Residential', status: 'pending', bins: 3, time: '08:00 AM', latitude: 36.768, longitude: 3.052 },
        { address: 'Blvd Mohamed V', type: 'Commercial', status: 'pending', bins: 5, time: '09:15 AM', latitude: 36.772, longitude: 3.055 },
        { address: 'Hydra Residence', type: 'Recycling', status: 'completed', bins: 2, time: '10:30 AM', latitude: 36.742, longitude: 3.033 },
    ];

    for (const task of tasks) {
        await prisma.task.create({ data: task });
    }

    // 3. Seed Waste Guide
    const guideItems = [
        { name: 'Plastic Bottle', category: 'plastic', instructions: 'Rinse and remove cap. Place in blue bin.' },
        { name: 'Paper Box', category: 'paper', instructions: 'Flatten box. Place in yellow bin.' },
        { name: 'Apple Core', category: 'organic', instructions: 'Compost if possible, otherwise green bin.' },
        { name: 'Battery', category: 'hazardous', instructions: 'DO NOT throw in regular trash. Take to special collection center.' },
    ];

    for (const item of guideItems) {
        await prisma.wasteGuide.upsert({
            where: { name: item.name },
            update: item,
            create: item,
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
