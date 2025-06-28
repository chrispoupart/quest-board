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

# Copy scripts directory first to ensure it exists
COPY scripts ./scripts

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

CMD ["npm", "start"]
