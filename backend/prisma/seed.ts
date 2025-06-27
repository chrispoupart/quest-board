import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user (if it doesn't exist)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@questboard.com' },
        update: {},
        create: {
            googleId: 'admin-google-id',
            name: 'Admin User',
            email: 'admin@questboard.com',
            role: 'ADMIN',
            bountyBalance: 0,
            experience: 0,
        },
    });

    // Create initial skills
    const initialSkills = [
        { name: 'Lawnmower', description: 'Ability to operate and maintain lawnmowers' },
        { name: 'Dishwasher', description: 'Experience with dishwashing and kitchen cleaning' },
        { name: 'Cook', description: 'Cooking and meal preparation skills' },
        { name: 'Drive', description: 'Driving and transportation skills' },
        { name: 'Gardener', description: 'Gardening and plant care skills' },
        { name: 'Cleaner', description: 'General cleaning and housekeeping skills' },
        { name: 'Organizer', description: 'Organization and decluttering skills' },
        { name: 'Pet Care', description: 'Pet sitting and animal care skills' },
        { name: 'Tech Support', description: 'Basic computer and technology support' },
        { name: 'Handyman', description: 'Basic home repair and maintenance skills' }
    ];

    // Create skills
    for (const skillData of initialSkills) {
        const existingSkill = await prisma.skill.findUnique({
            where: { name: skillData.name }
        });

        if (!existingSkill) {
            await prisma.skill.create({
                data: {
                    name: skillData.name,
                    description: skillData.description,
                    createdBy: adminUser.id
                }
            });
            console.log(`✅ Created skill: ${skillData.name}`);
        } else {
            console.log(`⏭️  Skill already exists: ${skillData.name}`);
        }
    }

    // Create editor user (if it doesn't exist)
    const editorUser = await prisma.user.upsert({
        where: { email: 'editor@questboard.com' },
        update: {},
        create: {
            googleId: 'editor-google-id',
            name: 'Editor User',
            email: 'editor@questboard.com',
            role: 'EDITOR',
            bountyBalance: 0,
            experience: 0,
        },
    });

    // Create player user (if it doesn't exist)
    const playerUser = await prisma.user.upsert({
        where: { email: 'player@questboard.com' },
        update: {},
        create: {
            googleId: 'player-google-id',
            name: 'Player User',
            email: 'player@questboard.com',
            role: 'PLAYER',
            bountyBalance: 0,
            experience: 0,
        },
    });

    // Create sample quests with skill requirements
    const quest1 = await prisma.quest.upsert({
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

    // Add skill requirement to quest 1
    const cleanerSkill = await prisma.skill.findUnique({ where: { name: 'Cleaner' } });
    if (cleanerSkill) {
        await prisma.questRequiredSkill.upsert({
            where: { questId_skillId: { questId: quest1.id, skillId: cleanerSkill.id } },
            update: {},
            create: {
                questId: quest1.id,
                skillId: cleanerSkill.id,
                minLevel: 2,
            },
        });
    }

    const quest2 = await prisma.quest.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Mow the Lawn',
            description: 'Mow and edge the front and back lawns',
            bounty: 75.0,
            status: 'AVAILABLE',
            createdBy: editorUser.id,
        },
    });

    // Add skill requirement to quest 2
    const lawnmowerSkill = await prisma.skill.findUnique({ where: { name: 'Lawnmower' } });
    if (lawnmowerSkill) {
        await prisma.questRequiredSkill.upsert({
            where: { questId_skillId: { questId: quest2.id, skillId: lawnmowerSkill.id } },
            update: {},
            create: {
                questId: quest2.id,
                skillId: lawnmowerSkill.id,
                minLevel: 3,
            },
        });
    }

    const quest3 = await prisma.quest.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Cook Dinner',
            description: 'Prepare a healthy dinner for the family',
            bounty: 100.0,
            status: 'AVAILABLE',
            createdBy: adminUser.id,
        },
    });

    // Add skill requirement to quest 3
    const cookSkill = await prisma.skill.findUnique({ where: { name: 'Cook' } });
    if (cookSkill) {
        await prisma.questRequiredSkill.upsert({
            where: { questId_skillId: { questId: quest3.id, skillId: cookSkill.id } },
            update: {},
            create: {
                questId: quest3.id,
                skillId: cookSkill.id,
                minLevel: 4,
            },
        });
    }

    // Add some skills to the player user for demonstration
    const sampleSkills = ['Cleaner', 'Cook', 'Organizer'];
    for (const skillName of sampleSkills) {
        const skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (skill) {
            await prisma.userSkill.upsert({
                where: { userId_skillId: { userId: playerUser.id, skillId: skill.id } },
                update: {},
                create: {
                    userId: playerUser.id,
                    skillId: skill.id,
                    level: Math.floor(Math.random() * 5) + 1, // Random level 1-5
                },
            });
        }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`👥 Users: ${await prisma.user.count()}`);
    console.log(`📋 Quests: ${await prisma.quest.count()}`);
    console.log(`🎯 Skills: ${await prisma.skill.count()}`);
    console.log(`🔗 Quest Requirements: ${await prisma.questRequiredSkill.count()}`);
    console.log(`👤 User Skills: ${await prisma.userSkill.count()}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
