# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy remaining source code
COPY src ./src
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./

# Verify scripts directory exists
RUN ls -la scripts/ || echo "Scripts directory not found in build context"

# Build the application and scripts
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
COPY --from=builder /app/scripts ./scripts

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy built application and scripts from builder stage
COPY --from=builder /app/dist ./dist

# Verify scripts and compiled scripts were copied
RUN ls -la scripts/ || echo "Scripts directory not found in production stage"
RUN ls -la dist/scripts/ || echo "Compiled scripts directory not found in production stage"

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 8000

# Run migrations and then start the application
CMD npm run db:migrate:backup && npm start
