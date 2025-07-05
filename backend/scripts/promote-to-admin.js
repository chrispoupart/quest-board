#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            process.exit(1);
            return;
        }

        console.log(`👤 Found user: ${user.name} (ID: ${user.id})`);
        console.log(`📊 Current role: ${user.role}`);

        if (user.role === "ADMIN") {
            console.log(`✅ User ${user.name} is already an admin!`);
            process.exit(0);
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
        });

        console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN!`);
        console.log(`🛡️  ${updatedUser.name} now has full Guild Master privileges`);

    } catch (error) {
        console.error("❌ Error promoting user:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];

if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: npm run promote-admin <email>");
    console.log("Example: npm run promote-admin john@example.com");
    process.exit(1);
}

promoteToAdmin(email); 
