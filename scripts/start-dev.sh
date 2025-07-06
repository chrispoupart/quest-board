#!/usr/bin/env bash

# Start development environment
set -euo pipefail

echo "Starting Quest Board development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start services
docker-compose up --build

echo "Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Health Check: http://localhost:8000/health"
