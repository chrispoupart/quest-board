# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Create scripts directory and promote-to-admin script
RUN mkdir -p scripts
RUN echo '#!/usr/bin/env node' > scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'const { PrismaClient } = require("@prisma/client");' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'const prisma = new PrismaClient();' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'async function promoteToAdmin(email) {' >> scripts/promote-to-admin.js
RUN echo '    try {' >> scripts/promote-to-admin.js
RUN echo '        console.log(`🔍 Looking for user with email: ${email}`);' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        const user = await prisma.user.findUnique({' >> scripts/promote-to-admin.js
RUN echo '            where: { email }' >> scripts/promote-to-admin.js
RUN echo '        });' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        if (!user) {' >> scripts/promote-to-admin.js
RUN echo '            console.error(`❌ User with email ${email} not found`);' >> scripts/promote-to-admin.js
RUN echo '            process.exit(1);' >> scripts/promote-to-admin.js
RUN echo '            return;' >> scripts/promote-to-admin.js
RUN echo '        }' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        console.log(`👤 Found user: ${user.name} (ID: ${user.id})`);' >> scripts/promote-to-admin.js
RUN echo '        console.log(`📊 Current role: ${user.role}`);' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        if (user.role === "ADMIN") {' >> scripts/promote-to-admin.js
RUN echo '            console.log(`✅ User ${user.name} is already an admin!`);' >> scripts/promote-to-admin.js
RUN echo '            process.exit(0);' >> scripts/promote-to-admin.js
RUN echo '            return;' >> scripts/promote-to-admin.js
RUN echo '        }' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        const updatedUser = await prisma.user.update({' >> scripts/promote-to-admin.js
RUN echo '            where: { id: user.id },' >> scripts/promote-to-admin.js
RUN echo '            data: { role: "ADMIN" }' >> scripts/promote-to-admin.js
RUN echo '        });' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '        console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN!`);' >> scripts/promote-to-admin.js
RUN echo '        console.log(`🛡️  ${updatedUser.name} now has full Guild Master privileges`);' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo '    } catch (error) {' >> scripts/promote-to-admin.js
RUN echo '        console.error("❌ Error promoting user:", error);' >> scripts/promote-to-admin.js
RUN echo '        process.exit(1);' >> scripts/promote-to-admin.js
RUN echo '    } finally {' >> scripts/promote-to-admin.js
RUN echo '        await prisma.$disconnect();' >> scripts/promote-to-admin.js
RUN echo '    }' >> scripts/promote-to-admin.js
RUN echo '}' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'const email = process.argv[2];' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'if (!email) {' >> scripts/promote-to-admin.js
RUN echo '    console.error("❌ Please provide an email address");' >> scripts/promote-to-admin.js
RUN echo '    console.log("Usage: npm run promote-admin <email>");' >> scripts/promote-to-admin.js
RUN echo '    console.log("Example: npm run promote-admin john@example.com");' >> scripts/promote-to-admin.js
RUN echo '    process.exit(1);' >> scripts/promote-to-admin.js
RUN echo '}' >> scripts/promote-to-admin.js
RUN echo '' >> scripts/promote-to-admin.js
RUN echo 'promoteToAdmin(email);' >> scripts/promote-to-admin.js

# Copy remaining source code
COPY src ./src
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./

# Verify scripts directory exists
RUN ls -la scripts/ || echo "Scripts directory not found in build context"

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files and prisma from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy built application and scripts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Verify scripts were copied
RUN ls -la scripts/ || echo "Scripts directory not found in production stage"

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 8000

# Run migrations and then start the application
CMD npx prisma migrate deploy && npm start
