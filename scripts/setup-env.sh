#!/usr/bin/env bash

# Setup environment variables
set -euo pipefail

echo "Setting up environment variables..."

cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="30m"

# Google OAuth2
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=8000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"
EOF
    echo "✅ .env file created successfully!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "⚠️  IMPORTANT: Update the Google OAuth2 credentials in backend/.env before using authentication features"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo ""
echo "Environment setup completed!"
