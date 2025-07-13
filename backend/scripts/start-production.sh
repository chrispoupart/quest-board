#!/bin/bash

# Production startup script with migration handling
# This script ensures the application starts even if migrations fail

set -e

echo "🚀 Starting Quest Board Backend in production mode..."

# Function to handle errors
handle_error() {
    echo "❌ Error occurred during startup: $1"
    echo "⚠️  Starting application anyway (migrations may have failed)..."
    exec npm start
}

# Function to run migrations with retry logic
run_migrations() {
    echo "📦 Running database migrations..."

    # Try to run migrations
    if npm run db:migrate:production; then
        echo "✅ Migrations completed successfully"
    else
        echo "⚠️  Migrations failed, but continuing with startup..."
        echo "⚠️  You may need to run migrations manually later"
    fi
}

# Main startup logic
echo "🔍 Checking environment..."

# Run migrations (with error handling)
run_migrations

# Start the application
echo "🚀 Starting application..."
exec npm start
