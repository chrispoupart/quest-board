import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@questboard.com' },
        update: {},
        create: {
            googleId: 'admin-google-id',
            name: 'Admin User',
            email: 'admin@questboard.com',
            role: 'ADMIN',
            bountyBalance: 0,
        },
    });

    // Create editor user
    const editorUser = await prisma.user.upsert({
        where: { email: 'editor@questboard.com' },
        update: {},
        create: {
            googleId: 'editor-google-id',
            name: 'Editor User',
            email: 'editor@questboard.com',
            role: 'EDITOR',
            bountyBalance: 0,
        },
    });

    // Create player user
    const playerUser = await prisma.user.upsert({
        where: { email: 'player@questboard.com' },
        update: {},
        create: {
            googleId: 'player-google-id',
            name: 'Player User',
            email: 'player@questboard.com',
            role: 'PLAYER',
            bountyBalance: 0,
        },
    });

    // Create sample quests
    await prisma.quest.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Clean the Kitchen',
            description: 'Wash dishes, wipe counters, and sweep the floor',
            bounty: 50.0,
            status: 'AVAILABLE',
            createdBy: adminUser.id,
        },
    });

    await prisma.quest.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Take Out the Trash',
            description: 'Empty all trash bins and take to the curb',
            bounty: 25.0,
            status: 'AVAILABLE',
            createdBy: editorUser.id,
        },
    });

    await prisma.quest.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Do Laundry',
            description: 'Wash, dry, and fold all dirty clothes',
            bounty: 75.0,
            status: 'CLAIMED',
            createdBy: adminUser.id,
            claimedBy: playerUser.id,
            claimedAt: new Date(),
        },
    });

    const quest4 = await prisma.quest.upsert({
        where: { id: 4 },
        update: {},
        create: {
            title: 'Vacuum Living Room',
            description: 'Vacuum the entire living room area',
            bounty: 30.0,
            status: 'COMPLETED',
            createdBy: editorUser.id,
            claimedBy: playerUser.id,
            claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            completedAt: new Date(),
        },
    });

    // Create approval for completed quest
    await prisma.approval.upsert({
        where: { questId: quest4.id },
        update: {},
        create: {
            questId: quest4.id,
            approvedBy: adminUser.id,
            status: 'APPROVED',
            notes: 'Great job! The living room looks spotless.',
        },
    });

    // Update player's bounty balance after approved quest
    await prisma.user.update({
        where: { id: playerUser.id },
        data: {
            bountyBalance: quest4.bounty,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`👥 Created ${await prisma.user.count()} users`);
    console.log(`📋 Created ${await prisma.quest.count()} quests`);
    console.log(`✅ Created ${await prisma.approval.count()} approvals`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
