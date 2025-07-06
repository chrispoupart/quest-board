#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin(email: string): Promise<void> {
    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            process.exit(1);
            return; // TypeScript doesn't know process.exit stops execution
        }

        console.log(`👤 Found user: ${user.name} (ID: ${user.id})`);
        console.log(`📊 Current role: ${user.role}`);

        if (user.role === 'ADMIN') {
            console.log(`✅ User ${user.name} is already an admin!`);
            process.exit(0);
            return; // TypeScript doesn't know process.exit stops execution
        }

        // Update user role to ADMIN
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN!`);
        console.log(`🛡️  ${updatedUser.name} now has full Guild Master privileges`);

    } catch (error) {
        console.error('❌ Error promoting user:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npm run promote-admin <email>');
    console.log('Example: npm run promote-admin john@example.com');
    process.exit(1);
}

// Run the promotion
promoteToAdmin(email);
