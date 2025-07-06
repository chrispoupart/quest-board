#!/usr/bin/env bash

# Setup database
set -euo pipefail

echo "Setting up database..."

cd backend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Database setup completed!"
echo ""
echo "You can now:"
echo "- Start the development server: npm run dev"
echo "- Open Prisma Studio: npm run db:studio"
echo "- Reset the database: npm run db:reset"
